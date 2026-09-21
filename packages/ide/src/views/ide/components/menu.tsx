import IconButton from "@/components/buttons/icon-button";
import { Maximize2, Minimize2, StepForward } from "lucide-react";
import { useRouter } from "next/router";
import { t } from "@/i18n";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface MenuProps {
  handleRun: () => void;
  isFullscreen: boolean;
  onHelp: () => void;
  runAll: () => void;
  toggleFullscreen: () => void;
  toggleTerminal: () => void;
}

export function Menu({
  handleRun,
  isFullscreen,
  onHelp,
  runAll,
  toggleFullscreen,
  toggleTerminal,
}: MenuProps) {
  const { locale } = useRouter();
  const fullscreenLabel = t(
    locale,
    isFullscreen ? "ui.exit_fullscreen" : "ui.enter_fullscreen",
  );

  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 px-4 py-2">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="rounded-full bg-white/10 px-3 py-1 text-foreground">
          {t(locale, "ui.studio")}
        </span>
        <div className="hidden items-center gap-3 md:flex">
          {/* <button className="hover:text-foreground">
            {t(locale, "ui.edit")}
          </button> */}
          <button className="hover:text-foreground" onClick={toggleTerminal}>
            {t(locale, "ui.terminal")}
          </button>
          <button className="hover:text-foreground" onClick={onHelp}>
            {t(locale, "ui.help")}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton
          aria-label={fullscreenLabel}
          onClick={toggleFullscreen}
          selected={isFullscreen}
          tooltip={fullscreenLabel}
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </IconButton>
        <IconButton
          aria-label={t(locale, "ui.run_lexer")}
          onClick={handleRun}
          tooltip={t(locale, "ui.run_lexer")}
          className="size-3 p-3 rounded-lg"
        >
          <StepForward />
        </IconButton>
        <RainbowButton variant="outline" onClick={runAll}>
          {t(locale, "ui.run_all")}
        </RainbowButton>
      </div>
    </div>
  );
}
