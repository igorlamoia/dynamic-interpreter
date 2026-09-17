import { expect, test } from "@playwright/test";
import { API_URL } from "../support/env";

test("o backend responde no /health", async ({ request }) => {
  const response = await request.get(`${API_URL}/health`);

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("a landing renderiza o shell do IDE", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("ide-shell")).toBeVisible();
});
