/**
 * URLs da stack sob teste. Os defaults apontam para o que
 * `docker-compose.local.yml` expõe; o CI sobrescreve se mudar de porta.
 */
export const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3001";
export const API_URL = process.env.E2E_API_URL ?? "http://localhost:8000";

/**
 * Conta criada pelo seed idempotente (`backend/scripts/seed.py:156-164`).
 * Usada só para leitura, nos specs que precisam provar que o login real
 * funciona. Tudo que os testes escrevem usa contas criadas na hora.
 */
export const SEED_TEACHER = {
  email: "professor@gmail.com",
  password: "professor",
  name: "Prof. Carlos Silva",
} as const;
