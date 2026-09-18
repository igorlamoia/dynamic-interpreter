import { expect, test } from "../fixtures";
import { setEditorCode } from "../support/monaco";

// As 5 linguagens oficiais publicadas pelo seed do catálogo comunitário
// (backend/scripts/community_language_presets.py).
const OFFICIAL_LANGUAGE_NAMES = [
  "Didática em Português",
  "Pythonica",
  "Minimalista",
  "Ruby-like",
  "Minerês",
];

const DIDACTIC_PT_NAME = "Didática em Português";

// `POST /languages/{id}/import` reaproveita o mesmo service de
// `clone_language` (backend/app/modules/languages/router.py:107-111 chama
// `clone_language` tanto no endpoint `/clone` quanto no `/import`), que
// sempre sufixa o nome com " (cópia)" (backend/app/modules/languages/service.py:270).
// Ou seja: mesmo sendo a primeira importação, o nome que chega no acervo do
// usuário nunca é o nome puro do catálogo — confirmado pelo toast de sucesso
// e pelo card em /languages na primeira rodada desta spec. Não é um bug que
// bloqueia a feature (a linguagem aparece e funciona), mas é surpreendente o
// bastante para registrar aqui em vez de esconder atrás de um match exato;
// por isso as asserções abaixo usam substring/contains, nunca igualdade.
const IMPORTED_NAME_SUFFIX = " (cópia)";

// Programa escrito com o vocabulário do preset "didactic-pt" (mesmo mapping
// de backend/scripts/community_language_presets.py, idêntico ao
// DIDACTIC_PT_PRESET do frontend em
// packages/ide/src/components/keyword-customizer/wizard-model.ts): tipo
// "numero_inteiro" no lugar de "int", bloco delimitado por "inicio"/"fim" no
// lugar de "{"/"}", e "escreva" no lugar de "print". O terminador de
// instrução continua sendo ";" (o preset usa statementTerminatorLexeme
// ";", que packages/ide/src/lib/keyword-customization.ts:64 normaliza para
// "não enviar" ao lexer, pois ";" já é o terminador padrão — enviá-lo
// explicitamente faz o Lexer rejeitar com "statement terminator cannot
// reuse semicolon", confirmado rodando o Lexer diretamente).
//
// Programa e saída derivados rodando o compilador diretamente (Lexer +
// TokenIterator + Interpreter de packages/compiler/src, com
// customKeywords/operatorWordMap/booleanLiteralMap/blockDelimiters
// equivalentes ao preset, sem passar statementTerminatorLexeme) num script
// descartável, depois apagado — `git status` em packages/compiler/ ficou
// limpo. A mesma fonte, rodada com o Lexer *sem* nenhuma customização,
// lança `Tipo inesperado "numero_inteiro" na linha 1, coluna 1.` — prova de
// que o programa só compila com o remapeamento em vigor.
const DIDACTIC_PT_PROGRAM = `numero_inteiro main() inicio
  escreva("Linguagem portuguesa ativa\\n");
  numero_inteiro soma;
  soma = 20 + 22;
  escreva(soma);
  escreva("\\n");
fim
`;

// Saída real do interpretador para o programa acima (stdout concatenado):
// "Linguagem portuguesa ativa\n" + "42\n" (soma = 20 + 22), com quebras de
// linha reais — confirmado no mesmo script descartável antes de escrever
// esta asserção.
const DIDACTIC_PT_OUTPUT_MARKER = "Linguagem portuguesa ativa";

test("o catalogo comunitario lista as 5 linguagens oficiais do seed", async ({
  student,
  loginAs,
  page,
}) => {
  await loginAs(student.token);
  await page.goto("/community/languages");

  for (const name of OFFICIAL_LANGUAGE_NAMES) {
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
});

test("importar uma linguagem do catalogo a leva para /languages, e o backend concorda", async ({
  api,
  student,
  loginAs,
  page,
}) => {
  await loginAs(student.token);
  await page.goto("/community/languages");

  await page
    .getByRole("button", { name: `Importar ${DIDACTIC_PT_NAME}`, exact: true })
    .click();

  // Confirma que a mutação terminou (toast de sucesso disparado por
  // handleImport em community-languages-view.tsx) antes de navegar — sem
  // isso, a navegação poderia chegar em /languages antes do import
  // persistir no backend.
  await expect(page.locator("#toast-success")).toContainText(
    `"${DIDACTIC_PT_NAME}${IMPORTED_NAME_SUFFIX}" foi adicionada`,
  );

  await page.goto("/languages");
  await expect(
    page
      .getByTestId("language-card")
      .filter({ hasText: DIDACTIC_PT_NAME }),
  ).toBeVisible();

  const myLanguages = await api.myLanguages(student.token);
  expect(
    myLanguages.some((language) => language.name.startsWith(DIDACTIC_PT_NAME)),
  ).toBe(true);
});

test("ativar a linguagem importada remapeia o lexer usado por /", async ({
  student,
  loginAs,
  page,
}) => {
  await loginAs(student.token);

  // Linha de base: o mesmo programa em português, rodado ANTES de importar
  // ou ativar qualquer linguagem customizada nesta sessão (o fixture
  // `student` cria um usuário novo por teste, então não há linguagem ativa
  // herdada). Isso prova que a asserção final não passaria por acidente —
  // uma regressão que parasse de aplicar a customização deixaria este
  // teste vermelho na parte de ativação, não silenciosamente verde aqui.
  // Sem nenhuma linguagem customizada ativa, o lexer padrão não reconhece
  // "numero_inteiro"/"inicio"/"fim"/"escreva" — a IDE reporta isso via toast
  // de erro (mesmo caminho de views/ide/index.tsx:114 usado pelo teste de
  // erro de sintaxe em ide-compiler.e2e.ts) e nunca chega a abrir o
  // terminal, então não há `terminal-output` para inspecionar aqui. Essa é
  // a prova de que a asserção final (mais abaixo) não passaria por
  // acidente: sem a customização em vigor, este mesmo programa não produz
  // saída nenhuma, só erro.
  await page.goto("/");
  await setEditorCode(page, DIDACTIC_PT_PROGRAM);
  await page.getByRole("button", { name: "Executar", exact: true }).click();
  await expect(page.locator("#toast-error")).toBeVisible();
  await expect(page.getByTestId("terminal-output")).toHaveCount(0);

  await page.goto("/community/languages");
  await page
    .getByRole("button", { name: `Importar ${DIDACTIC_PT_NAME}`, exact: true })
    .click();
  await expect(page.locator("#toast-success")).toContainText(
    `"${DIDACTIC_PT_NAME}${IMPORTED_NAME_SUFFIX}" foi adicionada`,
  );

  await page.goto("/languages");
  const importedCard = page
    .getByTestId("language-card")
    .filter({ hasText: DIDACTIC_PT_NAME });
  await expect(importedCard).toBeVisible();

  // O aria-label do botão usa o nome exato guardado no acervo, que inclui o
  // sufixo " (cópia)" que o import herda de clone_language (ver nota acima).
  await importedCard
    .getByRole("button", {
      name: `Tornar ${DIDACTIC_PT_NAME}${IMPORTED_NAME_SUFFIX} ativa`,
      exact: true,
    })
    .click();
  await expect(importedCard).toHaveAttribute("data-language-active", "true");

  await page.goto("/");
  await setEditorCode(page, DIDACTIC_PT_PROGRAM);
  await page.getByRole("button", { name: "Executar", exact: true }).click();

  const terminalOutput = page.getByTestId("terminal-output");
  await expect(terminalOutput).toBeVisible();
  await expect(terminalOutput).toContainText(DIDACTIC_PT_OUTPUT_MARKER);
  await expect(terminalOutput).toContainText("42");
});
