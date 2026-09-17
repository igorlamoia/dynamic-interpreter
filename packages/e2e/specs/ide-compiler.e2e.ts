import { expect, test } from "@playwright/test";
import { readEditorCode, setEditorCode } from "../support/monaco";

// A landing pública ("/") embute o IDE completo sem exigir login
// (packages/ide/src/pages/index.tsx:32 renderiza <IDEView />).

const VALID_PROGRAM = `int main() {
  print("Ola Mundo\\n");
  int soma;
  soma = 20 + 22;
  print(soma);
  print("\\n");
}
`;

// Programa com um parêntese não fechado antes do "}": o lexer tokeniza sem
// problemas, mas o gerador de código intermediário (parser) encontra um
// token inesperado. Mensagem confirmada rodando o compilador diretamente
// (TokenIterator lança IssueError "iterator.unexpected_token") e também
// observando o toast renderizado na UI para este exato programa.
const SYNTAX_ERROR_PROGRAM = `int main() {
  print("erro"
}
`;

const SYNTAX_ERROR_MESSAGE =
  'Token inesperado na linha 3, coluna 1. Esperado "fecha parênteses", mas recebeu "fecha chaves" (lexema "}").';

test("escrever codigo no Monaco e executar produz a saida esperada no terminal", async ({
  page,
}) => {
  await page.goto("/");
  await setEditorCode(page, VALID_PROGRAM);

  await page.getByRole("button", { name: "Executar", exact: true }).click();

  // A saída real do interpretador para este programa: "Ola Mundo" (via print
  // com \n) seguido de "42" (soma = 20 + 22) — confirmado rodando o
  // interpretador diretamente com o mesmo programa antes de escrever esta
  // asserção (não é um valor assumido).
  const terminalOutput = page.getByTestId("terminal-output");
  await expect(terminalOutput).toBeVisible();
  await expect(terminalOutput).toContainText("Ola Mundo");
  await expect(terminalOutput).toContainText("42");
});

test("o painel de tokens lista os tokens do programa", async ({ page }) => {
  await page.goto("/");
  await setEditorCode(page, VALID_PROGRAM);

  await page.getByRole("button", { name: "Executar Análise Léxica" }).click();

  const totalTokens = page.getByText("Tokens Gerados");
  await totalTokens.scrollIntoViewIfNeeded();
  await expect(totalTokens).toBeVisible();

  await page.getByRole("button", { name: "Mostrar Tokens", exact: true }).click();

  const tokenList = page.getByTestId("token-list");
  await tokenList.scrollIntoViewIfNeeded();
  await expect(tokenList).toContainText("main");
  await expect(tokenList).toContainText("soma");
});

test("o codigo intermediario mostra temporarios ou labels gerados", async ({
  page,
}) => {
  await page.goto("/");
  await setEditorCode(page, VALID_PROGRAM);

  await page.getByRole("button", { name: "Executar", exact: true }).click();

  const intermediateCodeList = page.getByTestId("intermediate-code-list");
  await intermediateCodeList.scrollIntoViewIfNeeded();
  await expect(intermediateCodeList).toBeVisible();
  await expect(intermediateCodeList).toContainText(/__temp\d+|__label\d+/);
});

test("um erro de sintaxe e reportado em vez de passar silenciosamente", async ({
  page,
}) => {
  await page.goto("/");
  await setEditorCode(page, SYNTAX_ERROR_PROGRAM);

  await page.getByRole("button", { name: "Executar", exact: true }).click();

  // O erro aparece tanto num toast quanto num marcador de linha no Monaco;
  // o toast (#toast-error, id fixo de ToastContext/toast.tsx) é o alvo mais
  // estável para assert de texto.
  await expect(page.locator("#toast-error")).toContainText(SYNTAX_ERROR_MESSAGE);

  // Prova de que o programa quebrado é de fato o que estava no editor quando
  // rodamos — sem isso, um teste que "passa" não provaria nada.
  const editorContent = await readEditorCode(page);
  expect(editorContent).toContain('print("erro"');
});
