import { expect, type Page } from "@playwright/test";

const EDITOR = '[data-testid="monaco-editor"]';

declare global {
  interface Window {
    monaco?: typeof import("monaco-editor");
  }
}

/**
 * Orçamento próprio para a montagem do Monaco, maior que os 15s padrão do
 * `expect`.
 *
 * O bundle do editor é lazy e é o carregamento mais pesado da suíte: com a
 * stack ocupada (logo depois de outra corrida paralela) os 15s estouraram uma
 * vez, no `grading.e2e.ts`, enquanto o mesmo teste passava 12/12 isolado. Como
 * o `playwright.config.ts` liga `failOnFlakyTests` no CI, um estouro raro
 * reprova o gate mesmo quando o retry passa — daí o teto mais alto aqui.
 *
 * Isto afrouxa só a espera, não a asserção: um editor que de fato não monta
 * continua reprovando, apenas 30s mais tarde.
 */
const MONACO_MOUNT_TIMEOUT = 45_000;

/** Espera o Monaco terminar de montar dentro do container. */
export async function waitForMonaco(page: Page): Promise<void> {
  await expect(page.locator(EDITOR)).toBeVisible({
    timeout: MONACO_MOUNT_TIMEOUT,
  });
  await expect(page.locator(`${EDITOR} .monaco-editor`)).toBeVisible({
    timeout: MONACO_MOUNT_TIMEOUT,
  });
  await page.waitForFunction(
    () => Boolean(window.monaco?.editor.getEditors().length),
    undefined,
    { timeout: MONACO_MOUNT_TIMEOUT },
  );
}

/**
 * Substitui todo o conteúdo do editor pelo código informado.
 *
 * Duas armadilhas descartadas na prática, não só por leitura de código:
 * - `fill()` no textarea real (`textarea.inputarea`) não escreve no modelo do
 *   Monaco, só no DOM da textarea invisível que ele usa para capturar input.
 * - Digitar caractere por caractere (`keyboard.type` ou
 *   `document.execCommand("insertText", ...)`) passa pelo pipeline normal de
 *   digitação do Monaco, que aplica `autoClosingBrackets` e auto-indentação
 *   por linha — confirmado experimentalmente: o mesmo código de 7 linhas saiu
 *   com indentação crescente e uma `}` extra ao final.
 *
 * `editor.setValue()` via `window.monaco` (exposto pelo `@monaco-editor/loader`
 * usado em `EditorContext.tsx`) substitui o modelo diretamente, sem passar
 * pelo pipeline de digitação — o texto final é byte a byte o que foi passado.
 */
export async function setEditorCode(page: Page, code: string): Promise<void> {
  await waitForMonaco(page);

  await page.evaluate((value) => {
    const editor = window.monaco!.editor.getEditors()[0];
    editor.setValue(value);
    editor.focus();
  }, code);

  const firstLine = code.trim().split("\n")[0].trim();
  await expect(page.locator(`${EDITOR} .view-lines`)).toContainText(firstLine);
}

/** Lê o texto visível das linhas do editor, para provar o que foi digitado. */
export async function readEditorCode(page: Page): Promise<string> {
  await waitForMonaco(page);
  return (await page.locator(`${EDITOR} .view-lines`).innerText()).trim();
}
