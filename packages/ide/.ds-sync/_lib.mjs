import { chromium } from "playwright";
export const B = "http://localhost:3001";
export async function start() { return chromium.launch(); }
export async function session(b, email, pw) {
  const ctx = await b.newContext({ viewport: { width: 1900, height: 900 }, colorScheme: "dark", locale: "pt-BR" });
  await ctx.addInitScript(() => { try { localStorage.setItem("theme", "dark"); } catch {} });
  const p = await ctx.newPage();
  await p.goto(B + "/login", { waitUntil: "networkidle" });
  await p.fill('input[type="email"]', email); await p.fill('input[type="password"]', pw);
  await p.locator('button[type="submit"]').first().click();
  await p.waitForURL(u => !u.toString().includes("/login")).catch(() => {}); await p.waitForTimeout(1500);
  return p;
}
export const settle = async (p, ms = 2000) => { await p.waitForLoadState("networkidle").catch(() => {}); await p.waitForTimeout(ms); await p.mouse.move(5, 890); };
export async function setCode(p, code) {
  await p.locator(".monaco-editor .view-lines").first().click();
  await p.keyboard.press("Control+A"); await p.keyboard.press("Delete");
  await p.keyboard.insertText(code); await p.waitForTimeout(600);
  return p.locator(".monaco-editor .view-lines").first().innerText();
}
