import { expect, test } from "../fixtures";
import { setEditorCode } from "../support/monaco";
import { montarListaPublicada, PROGRAMA_VALIDO } from "../support/scenario";
import type { Page } from "@playwright/test";

/**
 * A correção: o professor abre a submissão do aluno, dá nota e feedback, e a
 * nota volta para o aluno. `/submissions/[id]` (grading-panel.tsx e o
 * PATCH /submissions/{id}/grade) não era exercitado por nenhum teste.
 */

/** O aluno submete pelo workspace, gerando uma submissão de verdade (com codeSnapshot). */
async function alunoSubmete(
  page: Page,
  ids: { exercicioId: number; listaId: number; turmaId: number },
) {
  await page.goto(
    `/exercises/${ids.exercicioId}?listId=${ids.listaId}&classId=${ids.turmaId}`,
  );
  await setEditorCode(page, PROGRAMA_VALIDO);
  await page
    .getByRole("button", { name: "Submeter Resposta", exact: true })
    .click();
  await expect(page.getByTestId("submission-result-panel")).toContainText(
    "Submissão Enviada",
  );
}

/** Abre a submissão pendente pela tabela do professor, e não pela URL direta. */
async function professorAbreACorrecao(page: Page, listaId: number) {
  await page.goto(`/exercise-lists/${listaId}`);
  await page.getByRole("button", { name: /Submissões/ }).click();

  const linha = page.getByRole("row").filter({ hasText: "Submetido" });
  await expect(linha).toBeVisible();
  // Nota vazia antes de corrigir: o "—" é o que a tabela mostra com score null.
  await expect(linha).toContainText("—");

  await linha.getByRole("link", { name: "Corrigir" }).click();
  await expect(page).toHaveURL(/\/submissions\/\d+/);
}

test("professor atribui nota e feedback, e a correcao persiste", async ({
  api,
  teacher,
  student,
  loginAs,
  page,
}) => {
  const { turma, exercicio, lista } = await montarListaPublicada(
    api,
    teacher.token,
    student.token,
  );

  await loginAs(student.token);
  await alunoSubmete(page, {
    exercicioId: exercicio.id,
    listaId: lista.id,
    turmaId: turma.id,
  });

  await loginAs(teacher.token);
  await professorAbreACorrecao(page, lista.id);

  await expect(page.getByText("📩 Enviado")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Atribuir Nota" }),
  ).toBeVisible();

  // Os <label> do grading-panel não têm htmlFor, então getByLabel não alcança
  // os campos; o placeholder é o identificador estável que sobrou.
  await page.getByPlaceholder("0.0").fill("8.5");
  await page
    .getByPlaceholder("Escreva seu feedback sobre o código do aluno...")
    .fill("Boa solução. Cuidado com o nome das variáveis.");
  await page.getByRole("button", { name: "Atribuir Nota" }).click();

  await expect(page.getByText("✅ Nota salva com sucesso!")).toBeVisible();

  // O "salvo com sucesso" é estado local (setSaved). Recarregar é o que prova
  // que o PATCH gravou: nota, feedback e status vêm do backend agora, e o
  // botão passa a dizer "Atualizar Nota" porque o status virou GRADED.
  await page.reload();
  await expect(page.getByPlaceholder("0.0")).toHaveValue("8.5");
  await expect(
    page.getByPlaceholder("Escreva seu feedback sobre o código do aluno..."),
  ).toHaveValue("Boa solução. Cuidado com o nome das variáveis.");
  await expect(page.getByText("✅ Corrigido")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Atualizar Nota" }),
  ).toBeVisible();

  // E a tabela de onde o professor veio reflete a correção.
  await page.goto(`/exercise-lists/${lista.id}`);
  await page.getByRole("button", { name: /Submissões/ }).click();
  const linha = page.getByRole("row").filter({ hasText: "Avaliado" });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("8.5");
});

test("a nota atribuida pelo professor chega ao aluno no exercicio", async ({
  api,
  teacher,
  student,
  loginAs,
  page,
}) => {
  const { turma, exercicio, lista } = await montarListaPublicada(
    api,
    teacher.token,
    student.token,
  );

  await loginAs(student.token);
  await alunoSubmete(page, {
    exercicioId: exercicio.id,
    listaId: lista.id,
    turmaId: turma.id,
  });

  // Antes da correção o aluno vê o "✓ Enviado" sem nota nenhuma.
  await expect(page.getByText(/Nota:/)).toHaveCount(0);

  await loginAs(teacher.token);
  await professorAbreACorrecao(page, lista.id);
  await page.getByPlaceholder("0.0").fill("7");
  await page.getByRole("button", { name: "Atribuir Nota" }).click();
  await expect(page.getByText("✅ Nota salva com sucesso!")).toBeVisible();

  await loginAs(student.token);
  await page.goto(
    `/exercises/${exercicio.id}?listId=${lista.id}&classId=${turma.id}`,
  );

  await expect(page.getByText("✓ Enviado", { exact: true })).toBeVisible();
  await expect(page.getByText("Nota: 7")).toBeVisible();
});
