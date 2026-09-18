import { randomInt, randomUUID } from "node:crypto";

/**
 * `fullyParallel` roda cada worker em processo separado, então um contador
 * em memória colidiria entre workers. Por isso todo identificador carrega um
 * componente aleatório em vez de um contador.
 */

/** Identifica a execução inteira — útil para achar sobras no banco. */
export const RUN_ID = (process.env.GITHUB_RUN_ID ?? randomUUID()).slice(0, 8);

function token(): string {
  return randomUUID().replace(/-/g, "").slice(0, 10);
}

export function uniqueName(prefix: string): string {
  return `E2E-${prefix}-${RUN_ID}-${token()}`;
}

/**
 * `.local`/`.test` são rejeitados pelo `email_validator` mesmo com
 * `check_deliverability=False` (são "special-use domains" por RFC 6761/6762).
 * `example.com` é o domínio reservado pela RFC 6761 para esse fim e passa na
 * validação de sintaxe sem checagem de DNS.
 */
export function uniqueEmail(role: string): string {
  return `e2e-${role}-${RUN_ID}-${token()}@example.com`;
}

const ACCESS_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * 6 caracteres, como o produto gera (`create-class-modal.tsx`) e como o
 * formulário de entrar em turma aceita (`maxLength={6}` no
 * `join-class-modal.tsx`). Um código mais longo passaria pela API mas nunca
 * poderia ser digitado na UI.
 *
 * Base36 em vez de hex porque `classes.access_code` é UNIQUE e o banco local
 * acumula turmas entre execuções: 36^6 ≈ 2,2 bilhões de combinações contra
 * 16,7 milhões de 6 caracteres hex.
 */
export function uniqueAccessCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ACCESS_CODE_ALPHABET[randomInt(ACCESS_CODE_ALPHABET.length)];
  }
  return code;
}
