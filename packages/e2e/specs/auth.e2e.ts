import { expect, test } from "../fixtures";
import { E2E_PASSWORD } from "../fixtures/api";
import { SEED_TEACHER } from "../support/env";
import { uniqueEmail, uniqueName } from "../support/unique";

test("login com credencial do seed chega ao dashboard", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Endereço de E-mail").fill(SEED_TEACHER.email);
  await page.getByLabel("Senha").fill(SEED_TEACHER.password);
  await page.getByRole("button", { name: /Entrar no Painel/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  // So a URL nao basta: no bug que o `user` do TokenResponse consertou, a
  // pagina passava por /dashboard e o AuthContext, apos um GET /auth/me com
  // 404, limpava o token e voltava ao login. O nome so aparece com o perfil
  // carregado.
  await expect(
    page.getByRole("button", { name: SEED_TEACHER.name }),
  ).toBeVisible();
});

test("senha errada mostra erro e mantem o usuario no login", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Endereço de E-mail").fill(SEED_TEACHER.email);
  await page.getByLabel("Senha").fill("senha-definitivamente-errada");
  await page.getByRole("button", { name: /Entrar no Painel/i }).click();

  // O backend responde `{"detail": "Invalid credentials"}`, mas
  // getApiErrorMessage (packages/ide/src/lib/get-api-error-message.ts) só lê
  // `data.error`, então cai sempre no fallback passado em pages/login.tsx:51.
  // A mesma mensagem também aparece num toast; miramos só o `serverError`
  // inline (dentro de <main>) porque o toast pode se auto-dispensar.
  await expect(
    page.getByRole("main").getByText("Falha ao entrar", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("registro de aluno novo chega ao dashboard", async ({ page }) => {
  await page.goto("/register");

  // "Aluno" é um radio nativo estilizado como sr-only (packages/ide/src/components/buttons/radio-selector.tsx),
  // então não tem role="button"; `force` ignora o hit-test visual já que o input
  // é intencionalmente invisível (o `<label>` que o envolve é que recebe o clique real do usuário).
  await page.getByRole("radio", { name: "Aluno" }).check({ force: true });
  const nome = uniqueName("aluno-ui");
  await page.getByLabel("Nome Completo").fill(nome);
  await page.getByLabel("Endereço de E-mail").fill(uniqueEmail("ui-student"));
  await page.getByLabel("Senha").fill(E2E_PASSWORD);
  await page.getByLabel(/Instituição/).selectOption({ label: "CEFET-MG" });

  await page.getByRole("button", { name: "Cadastrar", exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  // Mesmo motivo do teste de login: prova que a sessao sobreviveu, e nao so
  // que a URL passou por /dashboard.
  await expect(page.getByRole("button", { name: nome })).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("rota protegida sem sessao redireciona para o login", async ({ page }) => {
  await page.goto("/languages");

  await expect(page).toHaveURL(/\/login/);
});
