import { useMemo } from "react";
import { useLanguageChoices } from "@/hooks/useLanguageChoices";

export function LanguageSelector() {
  const { choices, activeKey, selectLanguage } = useLanguageChoices();

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
        <span className="hidden md:inline">Linguagem</span>
        <select
          aria-label="Selecionar linguagem salva"
          value={activeKey}
          onChange={(event) => {
            void selectLanguage(event.target.value);
          }}
          className="rounded-lg border border-black/10 bg-white/80 px-2 py-1 text-xs text-foreground outline-none dark:border-white/10 dark:bg-black/20"
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
