import { expect, test } from "../fixtures";
import { SEED_TEACHER } from "../support/env";

test("cria professor e aluno isolados por execução", async ({
  teacher,
  student,
}) => {
  expect(teacher.id).toBeGreaterThan(0);
  expect(student.id).toBeGreaterThan(0);
  expect(teacher.email).not.toBe(student.email);
  expect(teacher.email).toMatch(/^e2e-teacher-/);
});

test("monta turma, exercicio, lista e publicacao pela API", async ({
  api,
  teacher,
  student,
}) => {
  const turma = await api.createClass(teacher.token);
  expect(turma.accessCode).toHaveLength(6);

  const exercicio = await api.createExercise(teacher.token, {
    description: "Imprima a palavra ok",
  });
  await api.addTestCase(teacher.token, exercicio.id, {
    input: "",
    expectedOutput: "ok",
  });

  const lista = await api.createExerciseList(teacher.token);
  await api.addExerciseToList(teacher.token, lista.id, exercicio.id);
  const publicacao = await api.publishList(teacher.token, lista.id, turma.id);

  expect(publicacao.classId).toBe(turma.id);
  expect(publicacao.exerciseListId).toBe(lista.id);

  const matricula = await api.joinClass(student.token, turma.accessCode);
  expect(matricula.classId).toBe(turma.id);
});

test("cookie injetado autentica o dashboard sem passar pelo login", async ({
  api,
  page,
  loginAs,
}) => {
  const token = await api.login(SEED_TEACHER.email, SEED_TEACHER.password);
  await loginAs(token);

  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard/);
  // O menu do usuario na navbar (iniciais + nome) so existe com sessao
  // autenticada. Por nome solto o seletor casaria tambem os cartoes das
  // turmas do professor, que carregam depois.
  await expect(
    page.getByRole("button", { name: SEED_TEACHER.name }),
  ).toBeVisible();
});
