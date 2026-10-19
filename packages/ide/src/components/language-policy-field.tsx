import { useRouter } from "next/router";
import { Globe2, LockKeyhole, Plus } from "lucide-react";
import type { LanguagePolicy } from "@/types/api";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

const DEFAULT_LANGUAGE_IMAGE = "/images/language-default.png";

export type LanguagePolicyValue = {
  policy: LanguagePolicy;
  lockedLanguageId: number | null;
};

type LanguagePolicyFieldProps = {
  value: LanguagePolicyValue;
  onChange: (next: LanguagePolicyValue) => void;
  languages: { id: number; name: string; imageUrl?: string | null }[];
  disabled?: boolean;
};

const policyOptions: Array<{
  policy: LanguagePolicy;
  titleKey: string;
  descriptionKey: string;
  icon: typeof Globe2;
}> = [
  {
    policy: "OPEN",
    titleKey: "ui.language_policy_open_title",
    descriptionKey: "ui.language_policy_open_description",
    icon: Globe2,
  },
  {
    policy: "LOCKED",
    titleKey: "ui.language_policy_locked_title",
    descriptionKey: "ui.language_policy_locked_description",
    icon: LockKeyhole,
  },
];

export function LanguagePolicyField({
  value,
  onChange,
  languages,
  disabled = false,
}: LanguagePolicyFieldProps) {
  const router = useRouter();
  const { locale } = router;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {policyOptions.map((option) => {
          const Icon = option.icon;
          const selected = value.policy === option.policy;

          return (
            <label
              key={option.policy}
              className={cn(
                "relative flex min-h-24 cursor-pointer items-start gap-3 rounded-md border p-3 text-left transition",
                "bg-card/80 hover:border-primary/50 hover:bg-primary/5 dark:bg-white/5 dark:hover:bg-primary/10",
                "focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-background",
                selected
                  ? "border-primary bg-primary/10 shadow-[0_0_18px_rgba(13,204,242,0.18)] dark:border-primary/80"
                  : "border-border dark:border-white/10",
                disabled && "cursor-not-allowed opacity-60 hover:bg-card/80",
              )}
            >
              <input
                type="radio"
                aria-label={t(locale, option.titleKey)}
                checked={selected}
                disabled={disabled}
                onChange={() =>
                  onChange(
                    option.policy === "OPEN"
                      ? { policy: "OPEN", lockedLanguageId: null }
                      : {
                          policy: "LOCKED",
                          lockedLanguageId: value.lockedLanguageId,
                        },
                  )
                }
                className="sr-only"
              />
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
                  selected
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border bg-background/70 text-muted-foreground dark:border-white/10 dark:bg-black/20",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 space-y-1">
                <span className="block text-sm font-semibold text-foreground">
                  {t(locale, option.titleKey)}
                </span>
                <span className="block text-xs leading-5 text-muted-foreground">
                  {t(locale, option.descriptionKey)}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {value.policy === "LOCKED" && (
        <div className="space-y-3 rounded-md border border-primary/20 bg-primary/5 p-3 dark:border-primary/20 dark:bg-primary/10">
          <select
            aria-label={t(locale, "ui.language")}
            className="sr-only"
            value={value.lockedLanguageId ?? ""}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                policy: "LOCKED",
                lockedLanguageId: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
          >
            <option value="">{t(locale, "ui.select_placeholder")}</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          {languages.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {languages.map((language) => {
                const selected = value.lockedLanguageId === language.id;

                return (
                  <button
                    key={language.id}
                    type="button"
                    disabled={disabled}
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({
                        policy: "LOCKED",
                        lockedLanguageId: language.id,
                      })
                    }
                    className={cn(
                      "flex min-w-0 items-center gap-3 rounded-md border p-2 text-left transition",
                      "bg-background/80 hover:border-primary/50 hover:bg-background dark:bg-black/25 dark:hover:bg-black/35",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      selected
                        ? "border-primary bg-background shadow-[0_0_18px_rgba(13,204,242,0.18)]"
                        : "border-border dark:border-white/10",
                      disabled && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <img
                      src={language.imageUrl || DEFAULT_LANGUAGE_IMAGE}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-md object-cover ring-1 ring-border dark:ring-white/10"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {language.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {selected
                          ? t(locale, "ui.language_policy_selected")
                          : t(locale, "ui.language_policy_select_language")}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "h-3 w-3 shrink-0 rounded-full border",
                        selected
                          ? "border-primary bg-primary shadow-[0_0_10px_rgba(13,204,242,0.6)]"
                          : "border-muted-foreground/40",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border bg-background/50 px-3 py-4 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-black/20">
              {t(locale, "ui.language_policy_no_languages")}
            </div>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => void router.push("/language-creator")}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background/80 px-3 py-2 text-sm font-medium text-foreground transition",
              "hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/40",
              "dark:border-white/10 dark:bg-black/25 dark:hover:bg-primary/10",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <Plus className="h-4 w-4" />
            {t(locale, "ui.create_language")}
          </button>
        </div>
      )}
    </div>
  );
}
