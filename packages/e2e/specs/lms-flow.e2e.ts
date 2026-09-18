import { expect, test } from "../fixtures";
import type { ApiClient } from "../fixtures/api";
import { setEditorCode } from "../support/monaco";

// Programas Java-- mínimos para o exercício "imprima exatamente: ok".
// `normalizeOutput` (packages/ide/src/pages/api/submissions/validate.ts:62)
// aplica trimEnd, então o "\n" do print não atrapalha — confirmado rodando o
// interpretador diretamente antes de escrever esta asserção (stdout: "ok\n").
const VALID_PROGRAM = `int main() {
  print("ok\\n");
}
`;

// Mesmo tipo de erro de sintaxe do Task 5 (parêntese não fechado antes do
// "}"): o lexer tokeniza normalmente, o parser (TokenIterator) rejeita.
const BROKEN_PROGRAM = `int main() {
  print("ok"
}
`;

/** Monta turma + exercício + test case + lista publicada + aluno matriculado, tudo pela API. */
async function montarCenario(
  api: ApiClient,
  teacherToken: string,
  studentToken: string,
) {
  const turma = await api.createClass(teacherToken);
  const exercicio = await api.createExercise(teacherToken, {
    description: "Escreva um programa que imprima exatamente: ok",
  });
  await api.addTestCase(teacherToken, exercicio.id, {
    label: "imprime ok",
    input: "",
    expectedOutput: "ok",
  });
  const lista = await api.createExerciseList(teacherToken);
  await api.addExerciseToList(teacherToken, lista.id, exercicio.id);
  await api.publishList(teacherToken, lista.id, turma.id);
  await api.joinClass(studentToken, turma.accessCode);
  return { turma, exercicio, lista };
}

test("aluno entra na turma pela UI usando o codigo de acesso", async ({
  api,
  teacher,
  student,
  loginAs,
  page,
}) => {
  const turma = await api.createClass(teacher.token);

  await loginAs(student.token);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "Entrar em nova turma" }).click();
  await page.getByLabel("Código de Acesso").fill(turma.accessCode);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();

  // A turma some do card "Entrar em nova turma" para virar um card de turma
  // de verdade só se a query de turmas revalidar sozinha — sem reload aqui é
  // a prova de que a invalidação de cache (useJoinClassMutation) funciona.
  await expect(page.getByText(turma.name)).toBeVisible();
});

test('submissao com codigo correto mostra os test cases passando e o badge "Enviado"', async ({
  api,
  teacher,
  student,
  loginAs,
  page,
}) => {
  const { turma, exercicio, lista } = await montarCenario(
    api,
    teacher.token,
    student.token,
  );

  await loginAs(student.token);
  await page.goto(`/exercises/${exercicio.id}?listId=${lista.id}&classId=${turma.id}`);

  await setEditorCode(page, VALID_PROGRAM);
  await page.getByRole("button", { name: "Submeter Resposta", exact: true }).click();

  const panel = page.getByTestId("submission-result-panel");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Submissão Enviada");
  await expect(panel).toContainText("Casos de Teste");
  await expect(panel).toContainText("1/1 passaram");
  await expect(panel).toContainText("PASSED");

  const badge = page.getByText("✓ Enviado", { exact: true });
  await expect(badge).toBeVisible();

  // Recarrega a página: se o badge ainda aparecer, o estado veio do backend
  // (exercise.submissions[0] via useExerciseQuery), não de um useState local.
  await page.reload();
  await expect(page.getByText("✓ Enviado", { exact: true })).toBeVisible();
});

test("submissao com erro mostra os erros e nao marca como enviado", async ({
  api,
  teacher,
  student,
  loginAs,
  page,
}) => {
  const { turma, exercicio, lista } = await montarCenario(
    api,
    teacher.token,
    student.token,
  );

  await loginAs(student.token);
  await page.goto(`/exercises/${exercicio.id}?listId=${lista.id}&classId=${turma.id}`);

  await setEditorCode(page, BROKEN_PROGRAM);
  await page.getByRole("button", { name: "Submeter Resposta", exact: true }).click();

  const panel = page.getByTestId("submission-result-panel");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Submissão Falhou");

  await expect(page.getByText("✓ Enviado", { exact: true })).toHaveCount(0);
});
