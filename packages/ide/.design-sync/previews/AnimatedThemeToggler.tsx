import "./_theme";
import { AnimatedThemeToggler, ThemeProvider } from "@ts-compilator-for-java/ide";

export const Default = () => (
  <ThemeProvider>
    <div className="flex items-center gap-4 p-8">
      <AnimatedThemeToggler duration={1000} />
    </div>
  </ThemeProvider>
);

export const InToolbar = () => (
  <ThemeProvider>
    <div className="p-6">
      <div className="flex w-full max-w-md items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2">
        <span className="text-sm font-semibold text-foreground">Java-- IDE</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Tema</span>
          <AnimatedThemeToggler duration={1000} />
        </div>
      </div>
    </div>
  </ThemeProvider>
);
