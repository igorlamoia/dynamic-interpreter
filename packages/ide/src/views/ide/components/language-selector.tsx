import { useMemo } from "react";
import { useLanguageChoices } from "@/hooks/useLanguageChoices";
import { t } from "@/i18n";

export function LanguageSelector({ locale }: { locale?: string }) {
  const { choices, activeKey, isSelectionLocked, selectLanguage } =
    useLanguageChoices();

  const activeChoice = useMemo(
    () => choices.find((choice) => choice.key === activeKey) ?? null,
    [choices, activeKey],
  );

  if (!choices.length) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {activeChoice?.imageUrl ? (
        <img
          src={activeChoice.imageUrl}
          alt={activeChoice.name}
          className="h-8 w-8 rounded-lg object-cover"
        />
      ) : null}
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="hidden md:inline">{t(locale, "ui.language")}</span>
        <select
          aria-label={t(locale, "ui.select_saved_language")}
          value={activeKey}
          disabled={isSelectionLocked}
          onChange={(event) => {
            void selectLanguage(event.target.value);
          }}
          className="rounded-lg border border-black/10 bg-white/80 px-2 py-1 text-xs text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-black/20"
        >
          {choices.map((choice) => (
            <option key={choice.key} value={choice.key}>
              {choice.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
