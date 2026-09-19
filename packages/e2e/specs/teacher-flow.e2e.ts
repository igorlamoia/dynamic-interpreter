import { expect, test } from "../fixtures";

/**
 * O caminho que o professor percorre de verdade: criar turma, criar exercício
 * com caso de teste, montar a lista, adicionar o exercício e publicar.
 *
 * Os outros specs montam esse cenário pela API (`montarCenario` em
 * lms-flow.e2e.ts) porque lá o assunto é outro. Aqui os modais são o assunto:
 * create-class-modal, create-exercise-modal (o de /exercises), create-list-modal,
 * add-exercise-modal e publish-modal só existem neste arquivo como interface.
 */

/** O código que o modal gera (create-class-modal.tsx:66) e exibe no alerta de sucesso. */
function accessCodeFrom(alertText: string): string {
  const match = alertText.match(/Código de acesso:\s*([A-Z0-9]{6})/);
  if (!match) {
    throw new Error(
      `Alerta de sucesso não trouxe o código de acesso: "${alertText}"`,
    );
  }
  return match[1];
}

test("professor cria turma pela UI e o codigo gerado serve para o aluno entrar", async ({
  api,
  teacher,
  student,
  loginAs,
  page,
}) => {
  const nomeDaTurma = `E2E-turma-ui-${Date.now()}`;

  await loginAs(teacher.token);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "Nova Turma" }).click();
  await page.getByLabel("Nome da Turma").fill(nomeDaTurma);
  await page.getByLabel("Descrição").fill("Turma criada pela UI no E2E");
  await page.getByRole("button", { name: "Criar Turma" }).click();

  const alerta = page.getByRole("alert").filter({ hasText: "Turma criada!" });
  await expect(alerta).toBeVisible();

  // Sem reload: o card só aparece se useCreateClassMutation invalidar o cache
  // de turmas (use-api-queries.ts:354). O dashboard não refaz a query no
  // onSuccess dele — quem revalida é a mutation.
  await expect(page.getByText(nomeDaTurma)).toBeVisible();

  // O código no alerta é gerado no cliente, antes do POST. Só provamos que ele
  // é o código real da turma usando-o para entrar: se o modal exibisse um
  // código diferente do que persistiu, este join falharia.
  const codigo = accessCodeFrom((await alerta.textContent()) ?? "");
  await api.joinClass(student.token, codigo);
});

test("professor cria exercicio com caso de teste pela UI e ele aparece no catalogo", async ({
  teacher,
  loginAs,
  page,
}) => {
  const titulo = `E2E-exercicio-ui-${Date.now()}`;

  await loginAs(teacher.token);
  await page.goto("/exercises");

  await page.getByRole("button", { name: "Novo Exercício" }).click();

  const modal = page.getByRole("dialog");
  await modal.getByLabel("Título").fill(titulo);
  await modal
    .getByLabel("Descrição / Enunciado")
    .fill("Escreva um programa que imprima exatamente: ok");

  // Os campos de caso de teste ficam dentro de um Accordion fechado. O form
  // nasce com 3 blocos vazios e o submit descarta os que não têm entrada nem
  // saída (create-exercise-modal.tsx:113), então preencher só o primeiro
  // precisa resultar em exatamente 1 caso.
  await modal.getByRole("button", { name: /Casos de Teste/ }).click();
  await modal.getByLabel("Saída esperada (stdout)").first().fill("ok");

  await modal.getByRole("button", { name: "Criar Exercício" }).click();

  await expect(page.locator("#toast-success")).toContainText(
    "Exercício criado!",
  );

  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();

  // O caso de teste vai num POST separado, depois do exercício
  // (use-api-queries.ts:383). Se esse segundo request falhasse, o exercício
  // ainda apareceria — com "0 casos de teste". Recarregar tira o cache do
  // caminho e deixa só o que o backend devolve.
  //
  // A fixture `teacher` registra uma conta nova a cada teste, então o catálogo
  // tem exatamente este exercício: o texto do card não precisa de escopo.
  await page.reload();
  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();
  await expect(page.getByText("1 caso de teste")).toBeVisible();
});

test("professor monta a lista, adiciona exercicio e publica; o aluno passa a ver a lista", async ({
  api,
  teacher,
  student,
  loginAs,
  page,
}) => {
  const turma = await api.createClass(teacher.token);
  const exercicio = await api.createExercise(teacher.token, {
    description: "Escreva um programa que imprima exatamente: ok",
  });
  await api.joinClass(student.token, turma.accessCode);

  const tituloDaLista = `E2E-lista-ui-${Date.now()}`;

  await loginAs(teacher.token);
  await page.goto("/exercise-lists");

  // 1. Criar a lista.
  await page.getByRole("button", { name: "Nova Lista" }).click();
  const modalDeCriacao = page.getByRole("dialog");
  await modalDeCriacao.getByLabel("Título").fill(tituloDaLista);
  await modalDeCriacao.getByRole("button", { name: "Criar Lista" }).click();

  await expect(page.locator("#toast-success")).toContainText(
    "Lista criada com sucesso!",
  );
  // A fixture `teacher` registra uma conta nova a cada teste, então esta é a
  // única lista da conta — o card não precisa de escopo para ser identificado.
  await expect(page.getByRole("heading", { name: tituloDaLista })).toBeVisible();

  // 2. Abrir o detalhe da lista.
  await page.getByRole("link", { name: /Gerenciar/ }).click();
  await expect(page).toHaveURL(/\/exercise-lists\/\d+/);
  await expect(page.getByRole("heading", { name: tituloDaLista })).toBeVisible();
  await expect(page.getByText("Nenhum exercício adicionado ainda.")).toBeVisible();

  // 3. Adicionar o exercício. O botão do painel e o botão de cada linha do
  // modal se chamam "Adicionar"; escopar no dialog separa os dois.
  await page.getByRole("button", { name: "Adicionar" }).click();
  const modalDeExercicios = page.getByRole("dialog");
  await expect(modalDeExercicios.getByText(exercicio.title)).toBeVisible();
  await modalDeExercicios.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.locator("#toast-success")).toContainText(
    "Exercício adicionado!",
  );
  await modalDeExercicios.getByRole("button", { name: "Fechar" }).click();

  await expect(page.getByText("Nenhum exercício adicionado ainda.")).toHaveCount(
    0,
  );
  await expect(page.getByText(exercicio.title)).toBeVisible();

  // 4. Publicar para a turma.
  await page.getByRole("button", { name: "Publicar" }).click();
  const modalDePublicacao = page.getByRole("dialog");
  await modalDePublicacao
    .getByLabel("Turma")
    .selectOption({ label: turma.name });
  await modalDePublicacao.getByRole("button", { name: "Publicar" }).click();

  await expect(page.locator("#toast-success")).toContainText(
    "Lista publicada com sucesso!",
  );

  // 5. A prova real da publicação: o aluno matriculado passa a enxergar a
  // lista. Antes do passo 4 esta tela mostrava "Nenhuma lista publicada".
  await loginAs(student.token);
  await page.goto("/exercise-lists");

  await expect(page.getByText(tituloDaLista)).toBeVisible();
  await expect(page.getByText("0 de 1 concluídos")).toBeVisible();
});
