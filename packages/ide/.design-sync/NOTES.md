# design-sync notes — @ts-compilator-for-java/ide → Claude Design "DynamicInterpreter"

Run everything from `packages/ide/`.

## Re-sync (one pass)

```sh
npm ci                                   # at repo root, if node_modules is stale
cp -r <skill>/package-build.mjs <skill>/package-validate.mjs <skill>/package-capture.mjs <skill>/resync.mjs <skill>/lib <skill>/storybook .ds-sync/
(cd .ds-sync && npm i esbuild ts-morph @types/react playwright@1.63.0)   # 1.63.0 pins chromium-1243 (cached)
node .design-sync/build.mjs              # cfg.buildCmd: staging pkg + types + Tailwind CSS
# fetch the project's _ds_sync.json -> .design-sync/.cache/remote-sync.json, then:
node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ../../node_modules \
  --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```

First sync: 2026-11-01, 38 components, all with authored previews graded good, project 1b3c2cda-7016-4c31-8f92-ab76e5186e2e.

## Build pipeline (why it looks like this)

- The IDE is a Next.js app with **no dist/**. `cfg.buildCmd` (`node .design-sync/build.mjs`) stages a typed
  package at `.design-sync/.cache/pkg/` (barrel `index.ts` over `src/components/ui/*.tsx` + `ThemeContext`,
  `tsc --emitDeclarationOnly` types, Tailwind-compiled `ide.css`). The converter runs with
  `cfg.entry = .design-sync/.cache/pkg/index.ts`, so **PKG_DIR is the staging dir** and every package-relative
  cfg path (`srcDir`, `tsconfig`, `cssEntry`, `docsDir`, `guidelinesGlob`) is relative to it.
- Converter command: `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ../../node_modules --out ./ds-bundle`
  (`react` is hoisted to the repo-root node_modules; `packages/ide/node_modules` has none).
- Stale `node_modules` broke the first build (`rough-notation`, `react-joyride` missing though in the lockfile) —
  run `npm ci` at the repo root first.
- Tailwind v4: `.design-sync/tailwind.input.css` imports the real `src/styles/globals.css`, scans the whole app
  (auto source detection from `packages/ide`) + `.design-sync/previews`, plus an `@source inline(...)` safelist
  of layout/spacing/type/token utilities so the design agent's own glue classes resolve. Not in the safelist and
  not used anywhere in the app → the class doesn't exist in the shipped CSS.
- **shiki is aliased** (`.design-sync/tsconfig.json` paths → `.design-sync/shims/shiki.ts`) to a fine-grained
  highlighter: java/javascript/typescript/python/c/json + github-light/github-dark, JS regex engine. Without it
  `import("shiki")` inlines every grammar/theme → 10.8 MB bundle (2 MB with). Other languages fall back to
  CodeComparison's own `<pre>`.
- `terminal.tsx` and `typing-animation.tsx` both export `TypingAnimation`; the barrel re-exports the Terminal one
  as **`TerminalTypingAnimation`** (alias exists only in the synced bundle). Standalone `TypingAnimation` = typing-animation.tsx.
- lucide-react is NOT merged into the global (5.8k names, collides with Badge/Form/Dock…). Previews import icons
  from `lucide-react` directly (bundled per preview).
- Sub-parts (DialogContent, AlertDialogAction, ContextMenuItem, FormField…) are excluded from cards via
  `componentSrcMap: null` — they stay in `window.DynamicInterpreter`; each parent's preview composes them.
- Groups come from frontmatter-only stubs in `.design-sync/docs/<Name>.md` (`category:`). Empty body ⇒ the
  `.prompt.md` is still synthesized (Props + Examples).
- `dtsPropsFor` hand-written for Button (cva VariantProps lost), Input/Textarea (native attrs filtered),
  Pointer/HyperText/TypingAnimation (hundreds of inherited motion/DOM props). Re-check against source on re-sync.

## Preview authoring rules (learned on the solo set)

- First line of every preview: `import "./_theme";` — sets `html.dark`, `localStorage.theme=dark`, and paints
  `body` with `var(--color-background)`. The card harness paints `body{background:#fff}`; the IDE's surfaces
  (translucent `dark:bg-cyan-950/15` dialogs, ghost/outline buttons, light-on-tint alerts) are designed for the
  dark page — on white they look broken. DESIGN.md: dark editor surfaces are the product default.
- Use **`export const Name = () => (...)`** — the `.prompt.md` Examples extractor only matches `export const`.
  `export function` previews render fine but ship no examples to the design agent. Put helper data consts
  (non-exported) ABOVE the first export (the extractor captures everything up to the next `export const`).
- Content in pt-BR (default locale), Java-- / classroom domain (exercícios, turmas, compilar, terminal).
- Overlays render open via `defaultOpen` with `cfg.overrides.<Name> = {cardMode: single, viewport}`.

## Per-component composition gotchas (from the authoring waves)

- ThemeProvider wrap required in previews of AnimatedThemeToggler and CodeComparison (useTheme defaults to
  darkMode=false -> day scene / github-light highlighting even on the dark card).
- Tooltip: `<TooltipProvider><Tooltip defaultOpen>`. ContextMenu has no open prop: a callback ref on the trigger
  dispatches a synthetic `contextmenu` event after mount (real Radix parts).
- Terminal: `sequence={false}` + `initial={false}` on each AnimatedSpan so lines paint on first frame.
- AnimatedBeam needs a wrapper component with useRef for container + nodes (defined above the exports).
- BorderBeam: parent needs `relative overflow-hidden rounded-*`. Particles: `className="absolute inset-0"` in a
  sized `relative` parent. Meteors: `left` is random over window width, keep the card wide. Dock has built-in mt-8.
- Pointer is page-global (listens on document, portals to body): `overrides.Pointer = {cardMode: single}` so grid
  stories don't stack 4 cursors; preview helper fires a synthetic mousemove.
- ScrollStack: preview helper scrolls the container to the stacked state on mount.
- NumberTicker: previews keep the canonical `startValue={0}` (the app's real usage); the spring is mid-count at
  harness capture time -> grades verified on fresh pages with a settle wait (see below).
- AnimatedShinyText is dim by design (neutral-400/70). Input has no error styling of its own (show errors via Form).

## Capture harness limitations

- Playwright launches Chromium with `--hide-scrollbars`, so CodeScrollArea / PerfectScrollbar captures never show
  the scrollbar (their whole point). Grades for those two were verified with a scratch Playwright run using
  `ignoreDefaultArgs: ['--hide-scrollbars']` against the built card (`?story=<Cell>`). Do NOT patch `.ds-sync/`
  (re-copied every sync) - re-verify the same way if their previews change.
- motion/react opacity enter animations can be captured at opacity 0: package-capture reuses one page with
  `page.clock.setFixedTime`, so after the 2nd navigation performance.now (~1090ms) runs ahead of
  document.timeline (~530ms) and motion schedules the WAAPI animation ~550ms in the future. Compose previews so
  the settled state paints first (`initial={false}`, `startOnView={false}`, `sequence={false}`). AnimatedList
  can't (AnimatedListItem hardcodes initial opacity 0) - its grades were verified with a scratch Playwright run,
  one fresh page per `?story=` cell. Re-verify the same way if its preview changes.
- Classes used only in previews exist in the shipped CSS only after `node .design-sync/build.mjs` + package-build
  (preview-rebuild doesn't recompile Tailwind). Authors: `grep -cF '.<class>' ds-bundle/_ds_bundle.css` first.

## Known render warns

- `[TOKENS_MISSING]` `--margin-top-for-head`, `--font-geist-sans` (app pages, not ui), `--tw` (Tailwind internal),
  `--perfect-scrollbar-size` (set inline by PerfectScrollbar/CodeScrollArea at runtime).

## Re-sync risks

- `dtsPropsFor` bodies are hand copies of source prop types — they rot if Button/Input/Textarea/Pointer/
  HyperText/TypingAnimation props change.
- The shiki shim's language/theme list is fixed; a call site passing another theme renders the `<pre>` fallback.
- The `@source inline` safelist and the `EXPLICIT` alias map in build.mjs are hand-maintained.
- `globals.css` uses `@config "../../tailwind.config.mjs"` (relative to src/styles) — moving files breaks the compile.
