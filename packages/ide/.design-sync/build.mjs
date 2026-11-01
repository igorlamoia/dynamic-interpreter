#!/usr/bin/env node
// design-sync build step (cfg.buildCmd). Run from packages/ide:
//   node .design-sync/build.mjs
//
// The IDE is a Next.js app with no dist/, so this stages a typed package the
// converter can consume as if it were a published DS:
//   .design-sync/.cache/pkg/
//     package.json   name = @ts-compilator-for-java/ide, types -> types/index.d.ts
//     index.ts       barrel: every src/components/ui/*.tsx + ThemeProvider (the JS entry, --entry)
//     types/         tsc --emitDeclarationOnly output of those real sources (the props contracts)
//     ide.css        src/styles/globals.css compiled by Tailwind v4 (cfg.cssEntry)
// Everything here is regenerated; nothing is hand-edited.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkgDir = resolve(here, '..');
const out = join(here, '.cache', 'pkg');
const require = createRequire(join(pkgDir, 'package.json'));
const ideVersion = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// 1. Barrel over the DS surface: src/components/ui (minus tests) + ThemeProvider.
const uiDir = join(pkgDir, 'src', 'components', 'ui');
const uiFiles = readdirSync(uiDir)
  .filter((f) => /\.tsx$/.test(f) && !/\.(spec|test|stories)\./.test(f))
  .sort();
const modules = [...uiFiles.map((f) => join(uiDir, f)), join(pkgDir, 'src', 'contexts', 'ThemeContext.tsx')];
const spec = (abs, from) => {
  const r = relative(from, abs).replace(/\.tsx?$/, '');
  return r.startsWith('.') ? r : `./${r}`;
};
// Export-name collisions between ui files: `export *` would make the name
// ambiguous (silently dropped). terminal.tsx and typing-animation.tsx both
// export TypingAnimation - the Terminal-scoped one is re-exported under an
// alias so both reach window.DynamicInterpreter.
const EXPLICIT = {
  'terminal.tsx': '{ Terminal, AnimatedSpan, TypingAnimation as TerminalTypingAnimation }',
};
const reexport = (m, from) => {
  const named = EXPLICIT[m.split('/').at(-1)];
  return `export ${named ?? '*'} from ${JSON.stringify(spec(m, from))};`;
};
writeFileSync(join(out, 'index.ts'), modules.map((m) => reexport(m, out)).join('\n') + '\n');

// 2. Declarations from the real sources (emitted even if the app has type errors).
const typesDir = join(out, 'types');
const tsconfig = {
  extends: relative(out, join(pkgDir, 'tsconfig.json')),
  compilerOptions: {
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
    noEmitOnError: false,
    incremental: false,
    skipLibCheck: true,
    rootDir: relative(out, pkgDir),
    outDir: 'types',
  },
  include: [],
  files: modules.map((m) => relative(out, m)),
};
writeFileSync(join(out, 'tsconfig.dts.json'), JSON.stringify(tsconfig, null, 2));
const tsc = require.resolve('typescript/bin/tsc');
try {
  execFileSync(process.execPath, [tsc, '-p', join(out, 'tsconfig.dts.json')], { stdio: 'pipe' });
} catch (e) {
  // Type errors don't block declaration emit; surface a count only.
  const n = (String(e.stdout).match(/error TS/g) ?? []).length;
  console.error(`build: tsc reported ${n} type error(s) (declarations still emitted)`);
}
writeFileSync(join(typesDir, 'index.d.ts'), modules.map((m) => reexport(join(typesDir, relative(pkgDir, m)), typesDir)).join('\n') + '\n');

// 3. Package manifest the converter reads.
writeFileSync(join(out, 'package.json'), JSON.stringify({
  name: '@ts-compilator-for-java/ide',
  version: ideVersion,
  private: true,
  types: 'types/index.d.ts',
}, null, 2) + '\n');

// 4. Tailwind v4 compile of the IDE's real stylesheet.
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const input = join(here, 'tailwind.input.css');
const result = await postcss([tailwind({ base: pkgDir, optimize: { minify: false } })])
  .process(readFileSync(input, 'utf8'), { from: input, to: join(out, 'ide.css') });
writeFileSync(join(out, 'ide.css'), result.css);

console.error(`build: staged ${modules.length} modules -> ${relative(pkgDir, out)} (css ${(result.css.length / 1024).toFixed(0)} KB)`);
