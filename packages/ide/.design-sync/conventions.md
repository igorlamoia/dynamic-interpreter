# DynamicInterpreter — Java-- IDE design system

Components from the Java-- IDE (a web IDE and classroom LMS for a teaching subset of Java). shadcn/Radix + Magic UI components styled with **Tailwind v4 utility classes backed by CSS-variable tokens**. All components are on `window.DynamicInterpreter`; icons are not, so use your own inline SVGs or lucide-style icons.

## Setup: dark theme first

The product is designed **dark-first** (dark editor surfaces, cyan/teal accents). Theme is class-based: tokens switch when an ancestor (normally `<html>`) has the `dark` class. Several components are translucent or use light-on-tint text (`Dialog`'s `dark:bg-cyan-950/15` surface, `Alert`'s `text-red-300` on `bg-red-500/10`). They are built to sit on the dark page background, and on a white page they look washed out or broken.

```jsx
const { ThemeProvider, Button } = window.DynamicInterpreter;
document.documentElement.classList.add("dark");   // dark tokens + dark: variants
localStorage.setItem("theme", "dark");            // ThemeProvider reads this → useTheme().darkMode
<ThemeProvider>
  <div className="min-h-screen bg-background text-foreground font-sans">…</div>
</ThemeProvider>
```

Wrap the tree in `ThemeProvider`. `AnimatedThemeToggler` and `CodeComparison` read it, and `CodeComparison` picks `lightTheme`/`darkTheme` from it. Always paint the page root with `bg-background text-foreground`.

## Styling idiom: semantic token utilities

Use the token utilities, not raw colors, for anything structural:

| Role | Classes |
|---|---|
| Page / text | `bg-background` `text-foreground` `text-muted-foreground` |
| Surfaces | `bg-card` `text-card-foreground` `bg-popover` `bg-muted` `bg-accent` |
| Brand | `bg-primary` `text-primary` `text-primary-foreground` (cyan) · `bg-secondary` (teal) · `bg-primary/10` tints |
| Danger | `bg-destructive` `text-destructive-foreground` |
| Lines / focus | `border-border` `border-input` `ring-ring` |
| Radius | `rounded-md` `rounded-lg` `rounded-xl` (from `--radius` 0.5rem) |

Dark panel vocabulary the IDE uses on top of the tokens: `bg-slate-900/70` (elevated cards), `bg-white/5` (glass/hover layers), `border-white/10` (panel borders), `border-slate-800` (technical panels), `text-cyan-300` / `bg-cyan-400/15` (active item). Status colors: emerald (success), amber (warning), sky (info), red (error), at the `-300`/`-400` text and `-500/10` background weights `Alert` uses. Typography: `font-sans` (Arial/Helvetica) for UI and `font-mono` for code, lexemes, tokens and terminal output. Weights: `font-medium` for controls, `font-semibold` for headings and labels.

The shipped CSS is compiled, so only classes present in it resolve. That covers every class the IDE itself uses, plus layout/spacing/sizing/type utilities (`flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `max-w-*`, `text-xs…6xl`, `md:`/`lg:` grid columns). Avoid arbitrary values like `bg-[#…]`; use a token instead.

## Components and where the truth lives

- Read `styles.css` (it imports `_ds_bundle.css`, which holds the tokens in `:root`/`.dark`) and `guidelines/DESIGN.md` (product color and type rules) before styling.
- Each component's `.prompt.md` has its props and working examples. Compound parts are flat exports. Compose them inside their parent:
  `Dialog` + `DialogContent/Header/Title/Description/Footer/Close/Trigger`; `AlertDialog` + `AlertDialogContent/Header/Title/Description/Footer/Action/Cancel/Trigger`; `DropdownMenu` + `DropdownMenuTrigger/Content/Item/Separator`; `ContextMenu` + `ContextMenuTrigger/Content/Item/Sub/…`; `Tooltip` + `TooltipProvider/Trigger/Content` (`TooltipProvider` is required); `Accordion` + `AccordionItem/Trigger/Content`; `Form` (react-hook-form provider) + `FormField/Item/Label/Control/Message`; `Terminal` + `AnimatedSpan` + `TerminalTypingAnimation`; `Dock` + `DockIcon`; `AnimatedList` + `AnimatedListItem`; `ScrollStack` + `ScrollStackItem`; `InputWithActions` + `InputActionButton`; `Avatar` + `AvatarFallback`.
- `Button`: `variant` default|secondary|outline|ghost|destructive|link, `size` sm|default|lg|icon, `asChild` to style an `<a>`.
- Effects need a positioned host: `BorderBeam` sits inside a `relative overflow-hidden rounded-xl` card; `Particles` and `Meteors` go in a sized `relative` box (`Particles` with `className="absolute inset-0"`). `Pointer` replaces the cursor for the whole page, so use at most one.
- UI copy is **Brazilian Portuguese** (pt-BR) by default.

## Example

```jsx
const { Button, Badge, Alert } = window.DynamicInterpreter;
<section className="rounded-xl border border-white/10 bg-slate-900/70 p-6">
  <div className="flex items-center justify-between gap-4">
    <h2 className="text-lg font-semibold">Lista 3 · Estruturas de repetição</h2>
    <Badge variant="success">Aprovado</Badge>
  </div>
  <p className="mt-2 text-sm text-muted-foreground">5 de 6 casos de teste passaram.</p>
  <Alert variant="warning" className="mt-4">A variável <code className="font-mono">i</code> nunca é usada.</Alert>
  <div className="mt-6 flex gap-3">
    <Button>Enviar solução</Button>
    <Button variant="outline">Ver saída</Button>
  </div>
</section>
```
