// Dependências externas: playwright e @axe-core/playwright.
// Uso: NODE_PATH=/caminho/node_modules node scripts/verificar-interface.cjs URL SAIDA
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const baseUrl = process.argv[2] || 'http://localhost:3012';
  const out = path.resolve(process.argv[3] || '/tmp/tcc-igor-interface');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const theme of ['light', 'dark']) {
      for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
        const context = await browser.newContext({ viewport, colorScheme: theme, reducedMotion: 'reduce' });
        await context.addInitScript(value => localStorage.setItem('theme', value), theme);
        const page = await context.newPage();
        const response = await page.goto(`${baseUrl}/language-creator`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        assert.equal(response.status(), 200);
        await page.locator('[data-wizard-stepper]').waitFor();
        // Development tooling is outside the application being assessed.
        await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
        await page.waitForFunction(() => document.documentElement.classList.contains('dark') === (localStorage.getItem('theme') === 'dark'));
        await page.evaluate(() => document.fonts.ready);
        // Wait for the preview's asynchronously loaded content to settle.
        await page.locator('[data-wizard-step-list] button').first().waitFor();
        const name = `${theme}-${viewport.width}`;
        await page.screenshot({ path: path.join(out, `${name}.png`), animations: 'disabled' });
        const layout = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          stepDirection: getComputedStyle(document.querySelector('[data-wizard-step-list]')).flexDirection,
          hiddenStepLabel: getComputedStyle(document.querySelector('[data-wizard-step-label]')).position,
        }));
        // Reach the first wizard button using actual sequential keyboard navigation.
        let tabs = 0;
        while (!(await page.locator('[data-wizard-step-button]').first().evaluate(el => el === document.activeElement)) && tabs < 80) {
          await page.keyboard.press('Tab');
          tabs += 1;
        }
        assert.ok(tabs < 80, `First step must be reachable by Tab: ${name}`);
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.querySelector('[data-wizard-active-title]')?.textContent === 'Entrada/Saída');
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.querySelector('[data-wizard-active-title]')?.textContent === 'Identidade');
        const audit = await new AxeBuilder({ page })
          .exclude('nextjs-portal')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        results.push({
          name, viewport, theme, layout,
          keyboard: { firstStepReachedWithTab: true, tabs, secondStepActivatedWithEnter: true },
          axeVersion: audit.testEngine.version,
          violations: audit.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, helpUrl: v.helpUrl, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary })) })),
          incomplete: audit.incomplete.map(v => ({ id: v.id, nodes: v.nodes.length })),
          passes: audit.passes.length,
        });
        await context.close();
      }
    }
    fs.writeFileSync(path.join(out, 'resultado.json'), JSON.stringify({
      checkedAt: new Date().toISOString(), browser: browser.version(),
      route: '/language-creator', authenticated: false,
      scope: 'Initial wizard step; keyboard transition to second step; WCAG A/AA rules implemented by axe, excluding Next.js development portal. No screen reader assessment.',
      results,
    }, null, 2) + '\n');
    console.log(JSON.stringify(results.map(r => ({ name: r.name, layout: r.layout, keyboard: r.keyboard, violations: r.violations.map(v => ({ id: v.id, nodes: v.nodes.length })), incomplete: r.incomplete })), null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
