import type { ApiClient } from "../fixtures/api";

/**
 * Turma + exercício + caso de teste + lista publicada + aluno matriculado,
 * tudo pela API.
 *
 * Montar isso pela UI é o assunto do teacher-flow.e2e.ts. Nos specs que
 * testam o que vem *depois* (submeter, corrigir), a montagem é só pré-condição
 * — e pré-condição via API é mais rápida e não quebra por mudança de layout.
 */
export async function montarListaPublicada(
  api: ApiClient,
  teacherToken: string,
  studentToken: string,
  options?: { description?: string; expectedOutput?: string },
) {
  const turma = await api.createClass(teacherToken);
  const exercicio = await api.createExercise(teacherToken, {
    description:
      options?.description ??
      "Escreva um programa que imprima exatamente: ok",
  });
  await api.addTestCase(teacherToken, exercicio.id, {
    label: "imprime ok",
    input: "",
    expectedOutput: options?.expectedOutput ?? "ok",
  });
  const lista = await api.createExerciseList(teacherToken);
  await api.addExerciseToList(teacherToken, lista.id, exercicio.id);
  await api.publishList(teacherToken, lista.id, turma.id);
  await api.joinClass(studentToken, turma.accessCode);
  return { turma, exercicio, lista };
}

/** Programa Java-- mínimo que imprime "ok" — a saída esperada do cenário padrão. */
export const PROGRAMA_VALIDO = `int main() {
  print("ok\\n");
}
`;
