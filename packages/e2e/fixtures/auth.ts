import type { BrowserContext } from "@playwright/test";
import { BASE_URL } from "../support/env";

const TOKEN_COOKIE = "lms_access_token";

/**
 * O frontend lê a sessão do cookie `lms_access_token`
 * (packages/ide/src/lib/auth-cookies.ts:1). Injetar o cookie evita passar pelo
 * formulário de login em todo spec: mais rápido, e um bug no login não derruba
 * a suíte inteira. O spec auth.e2e.ts é o único que exercita o formulário.
 */
export async function seedAuthCookie(
  context: BrowserContext,
  token: string,
): Promise<void> {
  await context.addCookies([
    {
      name: TOKEN_COOKIE,
      value: token,
      url: BASE_URL,
      sameSite: "Lax",
    },
  ]);
}
