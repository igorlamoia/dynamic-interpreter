import IconButton from "@/components/buttons/icon-button";
import {
  Check,
  ChevronDown,
  Maximize2,
  Minimize2,
  Plus,
  StepForward,
} from "lucide-react";
import { useRouter } from "next/router";
import { t } from "@/i18n";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LanguageChoicesState } from "@/hooks/useLanguageChoices";

interface MenuProps {
  handleRun: () => void;
  isFullscreen: boolean;
  isRunDisabled?: boolean;
  languageChoices: LanguageChoicesState;
  onHelp: () => void;
  onOpenLanguagePanel: () => void;
  onRules: () => void;
  runAll: () => void;
  toggleFullscreen: () => void;
  toggleTerminal: () => void;
}

export function Menu({
  handleRun,
  isFullscreen,
  isRunDisabled = false,
  languageChoices,
  onHelp,
  onOpenLanguagePanel,
  onRules,
  runAll,
  toggleFullscreen,
  toggleTerminal,
}: MenuProps) {
  const router = useRouter();
  const { locale } = router;
  const fullscreenLabel = t(
    locale,
    isFullscreen ? "ui.exit_fullscreen" : "ui.enter_fullscreen",
  );

  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 px-4 py-2">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <DropdownMenu
          onOpenChange={(open) => {
            if (open) onOpenLanguagePanel();
          }}
        >
          <DropdownMenuTrigger asChild>
            <RainbowButton
              data-tour="ide-language"
              type="button"
              variant="outline"
              size="sm"
              aria-label={t(locale, "ui.open_language_selection")}
              disabled={languageChoices.isSelectionLocked}
              title={
                languageChoices.isSelectionLocked
                  ? t(locale, "ui.language_locked_by_exercise")
                  : t(locale, "ui.select_active_language")
              }
              className="max-w-48 rounded-md disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {languageChoices.activeLanguage?.name ??
                  t(locale, "ui.language")}
              </span>
              <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
            </RainbowButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-56 border-black/10 bg-white/40 shadow-xl backdrop-blur-2xl dark:border-white/15 dark:bg-slate-800/20 dark:shadow-lg dark:backdrop-blur-md"
          >
            {languageChoices.choices.map((language) => {
              const isActive = language.key === languageChoices.activeKey;

              return (
                <DropdownMenuItem
                  key={language.key}
                  onSelect={() => {
                    onOpenLanguagePanel();
                    void languageChoices.selectLanguage(language.key);
                  }}
                  className="justify-between"
                >
                  <span className="truncate">{language.name}</span>
                  {isActive ? (
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => void router.push("/language-creator")}
            >
              <Plus className="size-4" aria-hidden="true" />
              {t(locale, "ui.create_another_language")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden items-center gap-3 md:flex">
          <button
            data-tour="ide-help"
            className="cursor-pointer hover:text-foreground"
            onClick={onHelp}
          >
            {t(locale, "ui.examples")}
          </button>
          <button
            data-tour="ide-rules"
            className="cursor-pointer hover:text-foreground"
            onClick={onRules}
          >
            {t(locale, "ui.compiler_rules")}
          </button>
          <button
            data-tour="ide-terminal-toggle"
            className="cursor-pointer hover:text-foreground"
            onClick={toggleTerminal}
          >
            {t(locale, "ui.terminal")}
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
          data-tour="ide-run-lexer"
          aria-label={t(locale, "ui.run_lexer")}
          disabled={isRunDisabled}
          onClick={handleRun}
          tooltip={t(locale, "ui.run_lexer")}
          className="size-3 p-3 rounded-lg"
        >
          <StepForward />
        </IconButton>
        <RainbowButton
          data-tour="ide-run-all"
          variant="outline"
          disabled={isRunDisabled}
          onClick={runAll}
        >
          {t(locale, "ui.run_all")}
        </RainbowButton>
      </div>
    </div>
  );
}
