import { randomUUID } from "node:crypto";

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

/** `classes.access_code` é UNIQUE; 8 caracteres hex em maiúsculas bastam. */
export function uniqueAccessCode(): string {
  return token().slice(0, 8).toUpperCase();
}
