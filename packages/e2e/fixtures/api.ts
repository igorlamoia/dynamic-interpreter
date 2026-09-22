import type { APIRequestContext, APIResponse } from "@playwright/test";
import { API_URL } from "../support/env";
import { uniqueAccessCode, uniqueEmail, uniqueName } from "../support/unique";

export const E2E_PASSWORD = "e2e-password";

export type Account = {
  token: string;
  id: number;
  email: string;
  password: string;
  name: string;
};

export type ClassRecord = { id: number; name: string; accessCode: string };
export type ExerciseRecord = { id: number; title: string };
export type ExerciseListRecord = { id: number; title: string };

/**
 * Unico ponto do pacote que fala HTTP com o backend. Os specs recebem esta
 * classe pela fixture `api` e nunca montam requisicao na mao.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private bearer(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  private async unwrap<T>(response: APIResponse, what: string): Promise<T> {
    if (!response.ok()) {
      throw new Error(
        `${what} falhou: HTTP ${response.status()} - ${await response.text()}`,
      );
    }
    return (await response.json()) as T;
  }

  private async unwrapRetrying<T>(
    request: () => Promise<APIResponse>,
    what: string,
    retryStatuses = new Set([404]),
  ): Promise<T> {
    const deadline = Date.now() + 5_000;
    let response = await request();

    while (
      !response.ok() &&
      retryStatuses.has(response.status()) &&
      Date.now() < deadline
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      response = await request();
    }

    return this.unwrap<T>(response, what);
  }

  /** `GET /organizations` e publico. O seed cria CEFET-MG, UFJF e System. */
  async academicOrganizationId(): Promise<number> {
    const response = await this.request.get(`${API_URL}/organizations`);
    const orgs = await this.unwrap<Array<{ id: number; name: string }>>(
      response,
      "GET /organizations",
    );
    const cefet = orgs.find((org) => org.name === "CEFET-MG");
    if (!cefet) {
      throw new Error(
        "CEFET-MG nao encontrada - o seed do backend nao rodou. Tente `make local-reset && make local-up`.",
      );
    }
    return cefet.id;
  }

  async register(
    role: "teacher" | "student",
    namePrefix: string,
  ): Promise<Account> {
    const organizationId = await this.academicOrganizationId();
    const email = uniqueEmail(role);
    const name = uniqueName(namePrefix);

    const response = await this.request.post(`${API_URL}/auth/register`, {
      data: { email, password: E2E_PASSWORD, name, role, organizationId },
    });
    const { accessToken, user } = await this.unwrap<{
      accessToken: string;
      user?: { id: number };
    }>(response, "POST /auth/register");
    const registeredUser = user ?? (await this.waitForMe(accessToken));

    return {
      token: accessToken,
      id: registeredUser.id,
      email,
      password: E2E_PASSWORD,
      name,
    };
  }

  async login(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${API_URL}/auth/login`, {
      data: { email, password },
    });
    const { accessToken } = await this.unwrap<{ accessToken: string }>(
      response,
      "POST /auth/login",
    );
    return accessToken;
  }

  async me(token: string) {
    const response = await this.request.get(`${API_URL}/auth/me`, {
      headers: this.bearer(token),
    });
    return this.unwrap<{ id: number; name: string; email: string; role: string }>(
      response,
      "GET /auth/me",
    );
  }

  private async waitForMe(token: string) {
    const deadline = Date.now() + 5_000;
    let lastError: unknown;

    while (Date.now() < deadline) {
      try {
        return await this.me(token);
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    throw lastError;
  }

  async createClass(token: string, namePrefix = "turma"): Promise<ClassRecord> {
    const response = await this.request.post(`${API_URL}/classes`, {
      headers: this.bearer(token),
      data: {
        name: uniqueName(namePrefix),
        description: "Turma criada pela suite E2E",
        accessCode: uniqueAccessCode(),
      },
    });
    return this.unwrap<ClassRecord>(response, "POST /classes");
  }

  async joinClass(token: string, accessCode: string) {
    return this.unwrapRetrying<{ classId: number }>(
      () =>
        this.request.post(`${API_URL}/classes/join`, {
          headers: this.bearer(token),
          data: { accessCode },
        }),
      "POST /classes/join",
    );
  }

  async createExercise(
    token: string,
    options: { description: string; titlePrefix?: string },
  ): Promise<ExerciseRecord> {
    const response = await this.request.post(`${API_URL}/exercises`, {
      headers: this.bearer(token),
      data: {
        title: uniqueName(options.titlePrefix ?? "exercicio"),
        description: options.description,
      },
    });
    return this.unwrap<ExerciseRecord>(response, "POST /exercises");
  }

  async addTestCase(
    token: string,
    exerciseId: number,
    testCase: {
      label?: string;
      input: string;
      expectedOutput: string;
      orderIndex?: number;
    },
  ) {
    return this.unwrapRetrying<{ id: number }>(
      () =>
        this.request.post(`${API_URL}/exercises/${exerciseId}/test-cases`, {
          headers: this.bearer(token),
          data: {
            label: testCase.label ?? "caso 1",
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            orderIndex: testCase.orderIndex ?? 0,
          },
        }),
      `POST /exercises/${exerciseId}/test-cases`,
    );
  }

  async createExerciseList(
    token: string,
    titlePrefix = "lista",
  ): Promise<ExerciseListRecord> {
    const response = await this.request.post(`${API_URL}/exercise-lists`, {
      headers: this.bearer(token),
      data: {
        title: uniqueName(titlePrefix),
        description: "Lista criada pela suite E2E",
      },
    });
    return this.unwrap<ExerciseListRecord>(response, "POST /exercise-lists");
  }

  async addExerciseToList(
    token: string,
    listId: number,
    exerciseId: number,
    options?: { gradeWeight?: number; orderIndex?: number },
  ) {
    return this.unwrapRetrying<{ exerciseId: number }>(
      () =>
        this.request.post(`${API_URL}/exercise-lists/${listId}/exercises`, {
          headers: this.bearer(token),
          data: {
            exerciseId,
            gradeWeight: options?.gradeWeight ?? 10,
            orderIndex: options?.orderIndex ?? 0,
          },
        }),
      `POST /exercise-lists/${listId}/exercises`,
    );
  }

  async publishList(
    token: string,
    listId: number,
    classId: number,
    options?: { deadline?: Date; totalGrade?: number; minRequired?: number },
  ) {
    const deadline =
      options?.deadline ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.unwrapRetrying<{ classId: number; exerciseListId: number }>(
      () =>
        this.request.post(`${API_URL}/exercise-lists/${listId}/publish`, {
          headers: this.bearer(token),
          data: {
            classId,
            totalGrade: options?.totalGrade ?? 100,
            minRequired: options?.minRequired ?? 1,
            deadline: deadline.toISOString(),
          },
        }),
      `POST /exercise-lists/${listId}/publish`,
    );
  }

  async communityLanguages(token: string) {
    const response = await this.request.get(`${API_URL}/languages/community`, {
      headers: this.bearer(token),
    });
    return this.unwrap<
      Array<{ id: number; name: string; ownerName: string | null }>
    >(response, "GET /languages/community");
  }

  async myLanguages(token: string) {
    const response = await this.request.get(`${API_URL}/languages`, {
      headers: this.bearer(token),
    });
    return this.unwrap<Array<{ id: number; name: string }>>(
      response,
      "GET /languages",
    );
  }
}
