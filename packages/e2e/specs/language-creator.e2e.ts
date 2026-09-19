import { expect, test } from "../fixtures";
import type { Page } from "@playwright/test";
import { preencherEstavel } from "../support/form";

/**
 * O wizard de criação de linguagem (`/language-creator`), a maior feature do
 * IDE e a que estava mais descoberta: os 8 specs unitários dela estão no
 * `exclude` do vitest.integration.config.ts desde o PR #35, então nenhum teste
 * de nenhum nível passava por aqui.
 *
 * O caminho coberto é o do usuário logado: escolher um preset, percorrer as 7
 * etapas e salvar na conta (POST /languages) ou atualizar (PATCH).
 */

const TOTAL_DE_ETAPAS = 7;

/**
 * Abre o wizard e só devolve o controle quando a sessão terminou de hidratar.
 *
 * Sem esta espera o teste digita no campo de nome antes do React hidratar, e o
 * input controlado volta para o estado inicial — o save então acontece com o
 * nome vazio. Isso passou despercebido rodando o arquivo sozinho e quebrou na
 * primeira corrida da suíte inteira em paralelo.
 *
 * O botão de perfil na navbar é o sinal certo: ele só existe depois de o
 * AuthContext hidratar o token E o perfil chegar — as mesmas duas condições
 * que o `isReady` de useLanguagePersistence espera para não salvar no
 * localStorage por engano.
 */
async function abrirWizard(page: Page, url: string, nomeDaConta: string) {
  await page.goto(url);
  await expect(page.getByRole("button", { name: nomeDaConta })).toBeVisible();
}

/** Preenche o nome da linguagem, garantindo que o valor fixou no campo. */
async function preencherNome(page: Page, nome: string) {
  await preencherEstavel(page.getByLabel("Nome da linguagem"), nome);
}

/** Avança do passo "Identidade" até "Revisão", como o usuário faz. */
async function irAteARevisao(page: Page) {
  for (let i = 0; i < TOTAL_DE_ETAPAS - 1; i++) {
    await page.getByRole("button", { name: "Continuar" }).click();
  }
  await expect(page.getByRole("button", { name: "Continuar" })).toHaveCount(0);
}

test("criar uma linguagem pelo wizard salva no acervo da conta", async ({
  api,
  student,
  loginAs,
  page,
}) => {
  const nome = `E2E-wizard-${Date.now()}`;

  await loginAs(student.token);
  await abrirWizard(page, "/language-creator", student.name);

  await preencherNome(page, nome);
  await page
    .getByLabel("Descrição da linguagem")
    .fill("Linguagem criada pelo wizard no E2E");

  // O preset preenche os lexemas de todas as etapas seguintes; sem ele o
  // wizard começa vazio e a validação barra o save.
  await page.getByRole("button", { name: /Didatica em Portugues/ }).click();

  await irAteARevisao(page);

  // Logado e sem `?id`, o modo de salvamento é "create"
  // (useLanguagePersistence.ts:mode) — o rótulo do botão é a prova de que o
  // wizard não caiu no branch "local" (localStorage) por sessão não hidratada.
  const salvar = page.getByRole("button", { name: "Salvar como nova" });
  await expect(salvar).toBeEnabled();
  await salvar.click();

  // Save bem-sucedido redireciona para /languages
  // (keyword-customizer-context.tsx:740).
  await expect(page).toHaveURL(/\/languages$/);
  await expect(page.getByRole("heading", { name: nome, exact: true })).toBeVisible();

  // E o acervo do backend concorda: a linguagem existe na conta, não só no
  // localStorage do navegador.
  const doBackend = await api.myLanguages(student.token);
  expect(doBackend.map((l) => l.name)).toContain(nome);
});

test("editar uma linguagem pelo wizard atualiza a existente em vez de criar outra", async ({
  api,
  student,
  loginAs,
  page,
}) => {
  const original = await api.createLanguage(student.token, "linguagem-a-editar");
  const novoNome = `${original.name}-editada`;

  await loginAs(student.token);
  await abrirWizard(page, `/language-creator/${original.id}`, student.name);

  await expect(page.getByLabel("Nome da linguagem")).toHaveValue(original.name);

  await preencherNome(page, novoNome);
  await irAteARevisao(page);

  // Com `?id`, o modo vira "update": o rótulo muda e o save usa PATCH.
  const salvar = page.getByRole("button", { name: "Salvar alterações" });
  await expect(salvar).toBeEnabled();
  await salvar.click();

  await expect(page).toHaveURL(/\/languages$/);
  await expect(
    page.getByRole("heading", { name: novoNome, exact: true }),
  ).toBeVisible();

  // O ponto do teste: atualizar não pode duplicar. A conta tem que continuar
  // com uma linguagem só, e com o mesmo id de antes.
  const doBackend = await api.myLanguages(student.token);
  expect(doBackend).toHaveLength(1);
  expect(doBackend[0].id).toBe(original.id);
  expect(doBackend[0].name).toBe(novoNome);
});

test("salvar com um nome que ja existe na conta mostra o erro e nao cria duplicata", async ({
  api,
  student,
  loginAs,
  page,
}) => {
  const existente = await api.createLanguage(student.token, "linguagem-ocupada");

  await loginAs(student.token);
  await abrirWizard(page, "/language-creator", student.name);

  await preencherNome(page, existente.name);
  await page.getByRole("button", { name: /Didatica em Portugues/ }).click();
  await irAteARevisao(page);
  await page.getByRole("button", { name: "Salvar como nova" }).click();

  // UNIQUE (owner_id, name) no backend vira 409, e o wizard traduz isso numa
  // mensagem corrigível em vez de um erro genérico — e devolve o usuário para
  // a etapa "Identidade", onde o nome está.
  await expect(
    page.getByText("Você já tem uma linguagem com esse nome."),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/\/languages$/);

  const doBackend = await api.myLanguages(student.token);
  expect(doBackend).toHaveLength(1);
});
