// Shared preview setup: render every card in the IDE's dark theme (DESIGN.md:
// "prefer dark editor surfaces"), exactly as ThemeProvider does in the app -
// `dark` class on <html> plus localStorage.theme so useTheme().darkMode is true.
try {
  localStorage.setItem("theme", "dark");
} catch {
  /* storage blocked - the class alone still themes the card */
}
document.documentElement.classList.add("dark");
// The card harness paints body #fff; the app paints it with the theme token
// (globals.css `body { background-color: var(--color-background) }`), and the
// IDE's translucent surfaces assume that dark page behind them.
document.body.style.background = "var(--color-background)";
document.body.style.color = "var(--color-foreground)";

export {};
