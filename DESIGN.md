# Dynamic Interpreter Design System

This document describes the current visual system used by the IDE package. It is based on the Tailwind configuration, global CSS variables, shared UI components, and recurring class patterns across `packages/ide/src`.

## Sources Of Truth

- Tailwind config: `packages/ide/tailwind.config.mjs`
- Global theme tokens: `packages/ide/src/styles/globals.css`
- Shared primitives: `packages/ide/src/components/ui`
- Feature surfaces: IDE explorer, terminal, keyword customizer, grammar graph, dashboard, submissions

The app uses Tailwind CSS v4 with CSS variable backed semantic colors. Dark mode is class based through `.dark`.

## Design Direction

The product is a compact programming IDE and language customization tool. The UI should feel dense, technical, and work-focused.

- Prefer dark editor surfaces and slate neutral panels.
- Use cyan and teal as the primary product accents.
- Use compact spacing, thin borders, small text, and monospaced text where data or code appears.
- Use translucent surfaces only when they help separate layered IDE controls.
- Keep cards and panels functional. Avoid decorative card nesting.

## Typography

### Font Families

Current base font:

```css
body {
  font-family: Arial, Helvetica, sans-serif;
}
```

Tailwind usage:

- `font-sans`: page shells, auth pages, dashboards, standard UI.
- `font-mono`: code, terminal, grammar symbols, lexemes, technical IDs, keyboard-like labels.

### Type Scale

The project is mostly compact. The most used sizes are:

| Token | Use |
| --- | --- |
| `text-[10px]` | dense badges, metadata pills, table labels |
| `text-[11px]` | section eyebrows, compact labels |
| `text-xs` | buttons, list rows, secondary controls, explorer text |
| `text-sm` | body text, inputs, menu items, terminal/code text |
| `text-base` | default readable content, occasional headings |
| `text-lg` | panel headings and summary titles |
| `text-xl` | step titles, section titles, language names |
| `text-2xl` | highlighted values or larger feature titles |
| `text-3xl` / `text-4xl` | page-level headings only |

### Font Weights

| Token | Use |
| --- | --- |
| `font-medium` | standard controls, chips, secondary emphasis |
| `font-semibold` | headings, labels, selected states |
| `font-bold` | strong badges, primary metrics, high-emphasis actions |

### Letter Spacing

Uppercase labels frequently use extra tracking:

- `tracking-wider` for compact language, status, and menu labels.
- `tracking-[0.16em]` to `tracking-[0.28em]` for section eyebrows.
- Use uppercase tracking only for labels, not body text.

### Line Height

- Use normal line height for dense UI rows.
- Use `leading-6` or `leading-relaxed` for readable descriptions and submitted code.
- Use `leading-none` only for icons, compact badges, and fixed-size symbol blocks.

## Color System

### Semantic Tokens

Tailwind maps these semantic names to CSS variables:

```js
background, foreground,
card, card-foreground,
popover, popover-foreground,
primary, primary-foreground,
secondary, secondary-foreground,
muted, muted-foreground,
accent, accent-foreground,
destructive, destructive-foreground,
border, input, ring,
chart-1, chart-2, chart-3, chart-4, chart-5
```

Use semantic tokens for reusable primitives and app-wide components. Use direct Tailwind palette colors for feature-specific states, syntax colors, and technical visualizations.

### Light Theme Tokens

| Token | Current value | Use |
| --- | --- | --- |
| `--background` | `0 0% 100%` | app background |
| `--foreground` | `240 10% 3.9%` | primary text |
| `--card` | `0 0% 100%` | base cards |
| `--popover` | `0 0% 100%` | menus/dialog surfaces |
| `--primary` | `184 74% 70%` | cyan primary |
| `--primary-foreground` | `240 10% 3.9%` | text on primary |
| `--secondary` | `#0fb698` | teal secondary |
| `--muted` | `240 4.8% 95.9%` | muted backgrounds |
| `--muted-foreground` | `240 3.8% 46.1%` | secondary text |
| `--accent` | `240 4.8% 95.9%` | hover and ghost states |
| `--destructive` | `0 84.2% 60.2%` | destructive actions |
| `--border` / `--input` | `240 5.9% 90%` | borders and inputs |
| `--ring` | `240 10% 3.9%` | focus rings |

### Dark Theme Tokens

| Token | Current value | Use |
| --- | --- | --- |
| `--background` | `240 10% 3.9%` | app background |
| `--foreground` | `0 0% 98%` | primary text |
| `--card` | `240 10% 3.9%` | dark card base |
| `--popover` | `240 10% 3.9%` | dark overlays |
| `--primary` | `#00b7d0` | cyan primary |
| `--primary-foreground` | `240 10% 3.9%` | text on primary |
| `--secondary` | `#0fb698` | teal secondary |
| `--muted` | `240 3.7% 15.9%` | muted dark surfaces |
| `--muted-foreground` | `240 5% 64.9%` | secondary text |
| `--accent` | `240 3.7% 15.9%` | hover and ghost states |
| `--destructive` | `0 62.8% 30.6%` | destructive actions |
| `--border` / `--input` | `240 3.7% 15.9%` | borders and inputs |
| `--ring` | `240 4.9% 83.9%` | focus rings |

Implementation note: most semantic variables are consumed as `hsl(var(--token))`. Hex values used by `--primary` or `--secondary` should be normalized if they are consumed through an `hsl(...)` wrapper.

### Neutral Surface Palette

Most UI surfaces use slate and transparent white/black layers:

| Pattern | Use |
| --- | --- |
| `bg-slate-950`, `bg-slate-950/90` | deep editor panels, grammar graph surfaces |
| `bg-slate-900/70`, `bg-slate-900/80` | elevated dark cards |
| `bg-white/5`, `bg-white/10` | dark hover and glass layers |
| `bg-black/20`, `bg-black/30` | dark overlays and image scrims |
| `border-white/10`, `border-white/15` | dark mode panel borders |
| `border-black/10` | light mode panel borders |
| `border-slate-800` | dark technical panels |
| `border-slate-200/80` | light content panels |

### Accent Colors

Primary accents:

- Cyan: `#0dccf2`, `#00b7d0`, `cyan-300`, `cyan-400`, `cyan-500`
- Teal/green: `#0fb698`, `emerald-300`, `emerald-400`, `emerald-500`

Supporting accents:

- Amber/yellow: warnings, optional markers, syntax emphasis.
- Rose/red: destructive actions, errors, block syntax.
- Sky/blue: type syntax and info states.
- Violet/pink/fuchsia: category differentiation in keyword customization.

### Status Colors

| Status | Light | Dark |
| --- | --- | --- |
| Success | `green-100`, `green-400`, `emerald-*` | `green-500/20`, `emerald-400` |
| Error | `red-100`, `red-700` | `red-700/20`, `red-400`, `rose-400` |
| Warning | `yellow-100`, `yellow-700` | `yellow-700/20`, `yellow-400`, `amber-300` |
| Info | `blue-100`, `blue-700` | `blue-700/20`, `blue-500`, `sky-300` |

### Code And Syntax Colors

Used in language previews and compiler UI:

| Purpose | Token |
| --- | --- |
| Function keywords | `text-emerald-300` |
| Block keywords | `text-rose-300` |
| Types | `text-blue-400` |
| Conditionals | `text-amber-300` |
| Strings | `text-[#AD7B68]` |
| Normal code | `text-slate-200` |
| Active lexeme/category | `text-cyan-300`, `bg-cyan-400/15`, `ring-cyan-400/30` |

## Spacing System

The project follows Tailwind's default spacing scale and favors compact rhythm.

### Most Common Spacing Tokens

| Token | Value | Use |
| --- | --- | --- |
| `gap-1` / `gap-1.5` | `0.25rem` / `0.375rem` | icon-label groups, compact controls |
| `gap-2` | `0.5rem` | default inline and row gap |
| `gap-3` | `0.75rem` | panel header groups, form rows |
| `gap-4` | `1rem` | card grids and section blocks |
| `gap-6` | `1.5rem` | larger layouts and split panels |
| `px-2`, `py-1` | compact chips and list rows |
| `px-3`, `py-1.5` | small buttons, menu items, labels |
| `px-4`, `py-2` | standard controls and form fields |
| `p-3` | compact panels |
| `p-4` | default card and panel padding |
| `p-5` / `p-6` | elevated panels, forms, dashboard cards |
| `space-y-2` / `space-y-3` | stacked compact content |
| `space-y-4` / `space-y-6` | form sections and wizard steps |

### Layout Patterns

- Page shells: `h-screen`, `overflow-hidden`, `font-sans`, dark background such as `bg-[#0A0A0F]`.
- Main content width: `max-w-7xl mx-auto px-6 py-12`.
- IDE panels: fixed or flex regions with `border-white/10`, `bg-white/5`, and compact padding.
- Responsive grids: `grid gap-3 md:grid-cols-2 xl:grid-cols-3` for option cards; `grid gap-4 lg:grid-cols-2` for larger form areas.
- List rows: `flex items-center gap-2 px-2 py-1 text-xs`.
- Popovers: `min-w-44 rounded-xl p-1` with backdrop blur and a subtle shadow.

## Shape And Radius

Global radius tokens:

```css
--radius: 0.5rem;
--radius-lg: var(--radius);
--radius-md: calc(var(--radius) - 2px);
--radius-sm: calc(var(--radius) - 4px);
```

Usage patterns:

| Token | Use |
| --- | --- |
| `rounded-sm` | tiny badges, technical pills |
| `rounded` | small syntax chips and low-emphasis blocks |
| `rounded-md` | default buttons, inputs, menu items |
| `rounded-lg` | standard panels and cards |
| `rounded-xl` | popovers, larger inputs, prominent cards |
| `rounded-2xl` | hero-like cards, auth panels, high-emphasis surfaces |
| `rounded-full` | pills, avatars, circular icon buttons |

Default recommendation:

- Use `rounded-md` for controls.
- Use `rounded-lg` for ordinary panels.
- Use `rounded-xl` or `rounded-2xl` only for visually prominent surfaces.

## Borders, Shadows, And Effects

### Borders

- Light mode: `border-black/10`, `border-slate-200/80`.
- Dark mode: `border-white/10`, `border-white/15`, `border-slate-800`.
- Focus: cyan border or ring, usually `focus:border-[#0dccf2]` or `focus:border-cyan-500`.

### Shadows

Use shadows sparingly. Current examples:

- `shadow-sm shadow-black/20` for technical panels.
- `shadow-lg` for dropdowns.
- `shadow-2xl` for auth cards.
- Custom cyan glow for primary submissions/actions and changed keyword states.

### Backdrop And Transparency

The project often uses glass-like overlays:

- `backdrop-blur-sm`, `backdrop-blur-md`, `backdrop-blur-xl`, `backdrop-blur-2xl`
- `bg-white/5`, `bg-white/10`, `bg-black/25`, `bg-slate-950/70`

Use transparency mainly over dark IDE surfaces and image-backed language cards.

## Component Specifications

### Buttons

Base button:

- `inline-flex items-center justify-center gap-2`
- `rounded-md`
- `text-sm font-medium`
- `transition-colors`
- `focus-visible:ring-1 focus-visible:ring-ring`
- Disabled state: `pointer-events-none opacity-50`

Sizes:

| Size | Classes |
| --- | --- |
| Default | `h-9 px-4 py-2` |
| Small | `h-8 rounded-md px-3 text-xs` |
| Large | `h-10 rounded-md px-8` |
| Icon | `h-9 w-9` |

Icon buttons should use Lucide icons at `h-4 w-4` or `h-3.5 w-3.5` in dense IDE areas.

### Inputs And Textareas

Default input pattern:

- Height: `h-9` to `h-11`
- Radius: `rounded-md`
- Padding: `px-3 py-1.5` or `p-4`
- Text: `text-xs` for dense controls, `text-sm` for forms
- Background: `bg-white/5` or `dark:bg-slate-950/60`
- Border: `border-white/10` or `border-slate-200/80 dark:border-slate-700/80`
- Focus: cyan border/ring and slightly brighter background

Textarea pattern:

- `min-h-20`
- `resize-y`
- `px-3 py-2`
- `text-sm`

### Badges And Chips

Default badge:

- `inline-flex items-center`
- `rounded-sm`
- `px-2 py-0.5`
- `text-[10px] font-semibold uppercase tracking-wide`

Pills:

- `rounded-full`
- `px-3 py-1`
- `text-xs font-medium`
- Use low-opacity colored backgrounds such as `bg-cyan-400/10` with matching borders.

### Cards And Panels

Standard content panel:

- `rounded-lg`
- `border border-slate-200/80 dark:border-slate-800/80`
- `bg-white/80 dark:bg-slate-900/70`
- `p-4`

Technical dark panel:

- `rounded-lg`
- `border border-slate-800`
- `bg-slate-950/90`
- `text-slate-200`
- `shadow-sm shadow-black/20`

Prominent language/image card:

- `rounded-2xl`
- `overflow-hidden`
- image layer with dark gradient overlay
- `p-4 sm:p-5`
- white text with soft shadow

### Menus And Popovers

Dropdown content:

- `z-1000`
- `min-w-44`
- `rounded-xl`
- `border border-black/10 dark:border-white/15`
- `bg-white/95 dark:bg-slate-800/20`
- `p-1`
- `backdrop-blur-md`
- `shadow-lg`

Dropdown item:

- `flex items-center gap-2`
- `rounded-lg`
- `px-3 py-2`
- `text-sm`
- hover/focus: `bg-black/5 dark:bg-white/10`

### Scroll Areas

Use `PerfectScrollbar` for scrollable panels where the scrollbar should be visible but refined.

Scrollbar tokens:

- Light track: `rgba(148, 163, 184, 0.14)`
- Light thumb: `rgba(100, 116, 139, 0.58)`
- Dark track: `rgba(15, 23, 42, 0.72)`
- Dark thumb: `rgba(148, 163, 184, 0.56)`
- Thumb hover: brighter slate in both modes

## Motion

Available animations:

- `animate-fade-in`
- `animate-bounce-down`
- `animate-typewriter`
- `animate-caret`
- `animate-meteor`
- `animate-marquee`
- `animate-marquee-reverse`
- `animate-marquee-vertical`
- `animate-blink-cursor`
- `animate-rainbow`
- `animate-shimmer-slide`
- `animate-spin-around`

Interaction transitions are usually short and color-based:

- `transition`
- `transition-colors`
- `transition-all`
- `duration-200`
- `duration-300`

Respect reduced motion for background mascot animations.

## Accessibility And Interaction

- Preserve visible focus states through `focus-visible:ring-1`, cyan focus borders, or menu focus backgrounds.
- Keep icon-only buttons labeled with `aria-label` and tooltips where meaning is not obvious.
- Keep disabled controls visibly reduced with `opacity-50` or lower.
- Use `text-muted-foreground` for secondary information, not for primary actions.
- Avoid relying on color alone for errors and selected states; pair color with text, border, icon, or layout position.

## Practical Rules

- Prefer semantic colors in reusable UI components.
- Prefer palette colors in feature-level visualizations, syntax highlighting, and compiler states.
- Keep IDE rows compact: `text-xs`, `gap-2`, `px-2`, `py-1`.
- Keep forms readable: `text-sm`, `gap-3`, `p-4`, `h-10` or `h-11`.
- Use `font-mono` for compiler output, terminal content, grammar symbols, and lexeme references.
- Use cyan for focus, selection, and primary highlights.
- Use emerald for successful or function-oriented states.
- Use rose/red for errors, destructive actions, and block syntax.
- Use amber/yellow for warnings and optional markers.
