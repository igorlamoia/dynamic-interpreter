import { Dna, Loader2, RefreshCw, X } from "lucide-react";
import { useLanguageDetail } from "@/hooks/useLanguages";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLanguageDNAChips } from "../language-dna";
import { t } from "@/i18n";
import { useRouter } from "next/router";

type LanguageDnaDialogProps = {
  languageId: number | undefined;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const OPERATOR_LABELS: Record<string, string> = {
  logical_or: "OU lógico",
  logical_and: "E lógico",
  logical_not: "Negação",
  less: "Menor que",
  less_equal: "Menor ou igual",
  greater: "Maior que",
  greater_equal: "Maior ou igual",
  equal_equal: "Igualdade",
  not_equal: "Diferença",
};

function ValueList({
  title,
  items,
  locale,
}: {
  title: string;
  items: Array<{ label: string; value: string }>;
  locale?: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 dark:border-white/8 dark:bg-white/3">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {t(locale, "ui.languages_default_config")}
        </p>
      ) : (
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className="rounded-xl border border-border bg-muted/60 px-3 py-2 dark:border-white/6 dark:bg-black/15"
            >
              <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-1 break-words font-mono text-sm text-cyan-700 dark:text-cyan-100">
                {item.value || t(locale, "ui.languages_compiler_default")}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export function LanguageDnaDialog({
  languageId,
  name,
  open,
  onOpenChange,
}: LanguageDnaDialogProps) {
  const { locale } = useRouter();
  const languageQuery = useLanguageDetail(languageId, open);
  const language = languageQuery.data;
  const customization = language?.customization;

  const keywords = (customization?.mappings ?? []).map((mapping) => ({
    label: mapping.original,
    value: mapping.custom,
  }));
  const operators = Object.entries(customization?.operatorWordMap ?? {}).map(
    ([key, value]) => ({ label: OPERATOR_LABELS[key] ?? key, value }),
  );
  const booleans = Object.entries(customization?.booleanLiteralMap ?? {}).map(
    ([key, value]) => ({
      label:
        key === "true"
          ? t(locale, "ui.languages_boolean_true")
          : t(locale, "ui.languages_boolean_false"),
      value,
    }),
  );
  const documentation = Object.entries(
    customization?.languageDocumentation ?? {},
  ).map(([key, entry]) => ({ label: key, value: entry.description }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden border-cyan-400/20 bg-card/95 p-0 shadow-[0_0_80px_rgba(13,204,242,0.08)] dark:bg-[#0c1019]/95 dark:shadow-[0_0_80px_rgba(13,204,242,0.13)]">
        <DialogHeader className="border-border bg-[radial-gradient(circle_at_top_left,rgba(13,204,242,0.1),transparent_55%)] dark:border-white/8 dark:bg-[radial-gradient(circle_at_top_left,rgba(13,204,242,0.16),transparent_55%)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <Dna className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate text-xl">
                {t(locale, "ui.languages_dna_title")}
              </DialogTitle>
              <DialogDescription className="truncate">
                {name || t(locale, "ui.languages_config")}
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label={t(locale, "ui.languages_close_dna")}
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:hover:bg-white/8 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="overflow-y-auto p-5 sm:p-6">
          {languageQuery.isPending && (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-7 animate-spin text-cyan-300" />
              <p>{t(locale, "ui.languages_decoding")}</p>
            </div>
          )}

          {languageQuery.isError && (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
              <p className="max-w-sm text-muted-foreground">
                {t(locale, "ui.languages_dna_load_error")}
              </p>
              <button
                type="button"
                onClick={() => void languageQuery.refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
              >
                <RefreshCw className="size-4" />
                {t(locale, "ui.try_again")}
              </button>
            </div>
          )}

          {language && customization && (
            <div className="space-y-4">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {t(locale, "ui.languages_structure")}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getLanguageDNAChips(language.dna, locale).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/8 dark:text-cyan-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <ValueList
                title={t(locale, "ui.languages_delimiters_terminator")}
                locale={locale}
                items={[
                  {
                    label: t(locale, "ui.languages_block_open"),
                    value: customization.blockDelimiters?.open ?? "",
                  },
                  {
                    label: t(locale, "ui.languages_block_close"),
                    value: customization.blockDelimiters?.close ?? "",
                  },
                  {
                    label: t(locale, "ui.languages_terminator"),
                    value: customization.statementTerminatorLexeme ?? "",
                  },
                ]}
              />
              <ValueList
                title={t(locale, "ui.languages_keywords")}
                items={keywords}
                locale={locale}
              />
              <ValueList
                title={t(locale, "ui.languages_word_operators")}
                items={operators}
                locale={locale}
              />
              <ValueList
                title={t(locale, "ui.languages_boolean_literals")}
                items={booleans}
                locale={locale}
              />
              <ValueList
                title={t(locale, "ui.languages_documentation")}
                items={documentation}
                locale={locale}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
