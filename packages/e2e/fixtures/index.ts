import { test as base, expect } from "@playwright/test";
import { ApiClient, type Account } from "./api";
import { seedAuthCookie } from "./auth";

type Fixtures = {
  /** Cliente da API do backend, para montar cenário sem passar pela UI. */
  api: ApiClient;
  /** Professor recém-criado, isolado desta execução. */
  teacher: Account;
  /** Aluno recém-criado, isolado desta execução. */
  student: Account;
  /** Autentica o contexto atual do browser com o token informado. */
  loginAs: (token: string) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  teacher: async ({ api }, use) => {
    await use(await api.register("teacher", "professor"));
  },

  student: async ({ api }, use) => {
    await use(await api.register("student", "aluno"));
  },

  loginAs: async ({ context }, use) => {
    await use(async (token: string) => {
      await seedAuthCookie(context, token);
    });
  },
});

export { expect };
