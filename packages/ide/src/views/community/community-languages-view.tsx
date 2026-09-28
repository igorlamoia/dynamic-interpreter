import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowDownToLine,
  Dna,
  Globe2,
  Loader2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useCommunityLanguages, useImportLanguage } from "@/hooks/useLanguages";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import type {
  CommunityLanguageFilters,
  LanguageDNA,
  LanguageSummary,
} from "@/lib/languages-api";
import { getLanguageDNAChips } from "@/views/languages/language-dna";
import { LanguageDnaDialog } from "@/views/languages/components/language-dna-dialog";
import { Pagination } from "@/components/ui/pagination";
import { t } from "@/i18n";

const DEFAULT_LANGUAGE_IMAGE = "/images/language-default.png";
const PAGE_SIZE = 12;

type DnaAxis = keyof LanguageDNA;
type DnaValue = LanguageDNA[DnaAxis];

function getDnaFilterGroups(locale?: string): Array<{
  axis: DnaAxis;
  label: string;
  options: Array<{ value: DnaValue; label: string }>;
}> {
  return [
  {
    axis: "typing",
    label: t(locale, "ui.community_filter_typing"),
    options: [
      { value: "typed", label: t(locale, "ui.language_dna_typed") },
      { value: "untyped", label: t(locale, "ui.language_dna_untyped") },
    ],
  },
  {
    axis: "block",
    label: t(locale, "ui.community_filter_blocks"),
    options: [
      { value: "delimited", label: t(locale, "ui.community_filter_delimited") },
      { value: "indentation", label: t(locale, "ui.community_filter_indented") },
    ],
  },
  {
    axis: "array",
    label: t(locale, "ui.community_filter_arrays"),
    options: [
      { value: "fixed", label: t(locale, "ui.community_filter_fixed") },
      { value: "dynamic", label: t(locale, "ui.community_filter_dynamic") },
    ],
  },
  {
    axis: "semicolon",
    label: t(locale, "ui.community_filter_terminator"),
    options: [
      { value: "optional-eol", label: t(locale, "ui.community_filter_optional") },
      { value: "required", label: t(locale, "ui.community_filter_required") },
    ],
  },
  ];
}

export function CommunityLanguagesView() {
  const { locale } = useRouter();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dnaFilters, setDnaFilters] = useState<Partial<LanguageDNA>>({});
  const deferredSearch = useDeferredValue(search.trim());
  const catalogFilters = useMemo<CommunityLanguageFilters>(
    () => ({
      ...dnaFilters,
      ...(deferredSearch ? { query: deferredSearch } : {}),
      page,
      pageSize: PAGE_SIZE,
    }),
    [deferredSearch, dnaFilters, page],
  );
  const catalog = useCommunityLanguages(catalogFilters);

  const languages = Array.isArray(catalog.data)
    ? catalog.data
    : (catalog.data?.items ?? []);
  const totalPages = Array.isArray(catalog.data)
    ? 1
    : (catalog.data?.totalPages ?? 1);
  const totalItems = Array.isArray(catalog.data)
    ? catalog.data.length
    : (catalog.data?.total ?? languages.length);

  const importLanguage = useImportLanguage();
  const [importingId, setImportingId] = useState<number | null>(null);
  const [dnaLanguage, setDnaLanguage] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const activeDnaFilterCount = Object.values(dnaFilters).filter(Boolean).length;
  const hasActiveCriteria = deferredSearch !== "" || activeDnaFilterCount > 0;

  const toggleDnaFilter = (axis: DnaAxis, value: DnaValue) => {
    setPage(1);
    setDnaFilters((current) => {
      const next = { ...current };
      if (next[axis] === value) {
        delete next[axis];
      } else {
        Object.assign(next, { [axis]: value });
      }
      return next;
    });
  };

  const handleImport = async (language: LanguageSummary) => {
    setImportingId(language.id);
    try {
      const imported = await importLanguage.mutateAsync(language.id);
      showToast({
        type: "success",
        message: t(locale, "ui.community_import_success", {
          name: imported.name,
        }),
      });
    } catch (error) {
      showToast({
        type: "error",
        message: getApiErrorMessage(
          error,
          t(locale, "ui.community_import_error"),
        ),
      });
    } finally {
      setImportingId(null);
    }
  };

  return (
    <>
      <header className="relative mb-8 overflow-hidden rounded-4xl border  px-6 py-9 shadow-[0_30px_100px_rgba(15,23,42,0.12)] border-primary/15 bg-primary/10 dark:bg-secondary/10 dark:shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:px-10">
        <div className="pointer-events-none absolute -right-20 -top-32 size-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-1/2 bg-linear-to-r from-transparent via-primary/90 to-transparent" />
        <div className="relative max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary dark:border-primary/20 dark:bg-primary/8 dark:text-primary">
            <Sparkles className="size-3.5" />
            {t(locale, "ui.community_badge")}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
            {t(locale, "ui.community_title_prefix")}{" "}
            <span className="text-primary dark:text-primary">
              {t(locale, "ui.community_title_highlight")}
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t(locale, "ui.community_intro")}
          </p>
        </div>
      </header>

      <section aria-labelledby="catalog-title">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="catalog-title"
              className="text-xl font-bold text-foreground"
            >
              {t(locale, "ui.community_published_languages")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(locale, "ui.community_import_note")}
            </p>
          </div>
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">{t(locale, "ui.community_search")}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={t(locale, "ui.community_search_placeholder")}
              className="w-full rounded-xl border border-border bg-card/80 py-3 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/35 focus:bg-primary/5 focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>
        </div>

        <DnaFiltersPanel
          filters={dnaFilters}
          activeCount={activeDnaFilterCount}
          onToggle={toggleDnaFilter}
          onClear={() => {
            setDnaFilters({});
            setPage(1);
          }}
        />

        {catalog.isPending ? (
          <div
            className="flex min-h-64 items-center justify-center"
            aria-label={t(locale, "ui.community_loading_catalog")}
          >
            <Loader2 className="size-7 animate-spin text-primary" />
          </div>
        ) : catalog.isError ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center text-sm text-red-700 dark:border-red-400/15 dark:text-red-200"
          >
            {getApiErrorMessage(
              catalog.error,
              t(locale, "ui.community_load_error"),
            )}
          </div>
        ) : languages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-primary/15 bg-primary/3 px-6 py-16 text-center">
            <Globe2 className="mx-auto size-9 text-primary/60" />
            <p className="mt-4 font-bold text-foreground">
              {hasActiveCriteria
                ? t(locale, "ui.community_empty_filtered")
                : t(locale, "ui.community_empty_atlas")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasActiveCriteria
                ? t(locale, "ui.community_empty_filtered_description")
                : t(locale, "ui.community_empty_atlas_description")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {languages.map((language) => (
                <CommunityLanguageCard
                  key={language.id}
                  language={language}
                  importing={importingId === language.id}
                  importDisabled={importLanguage.isPending}
                  onImport={() => void handleImport(language)}
                  onViewDna={() =>
                    setDnaLanguage({ id: language.id, name: language.name })
                  }
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              className="mt-8"
            />
          </>
        )}
      </section>

      <LanguageDnaDialog
        languageId={dnaLanguage?.id}
        name={dnaLanguage?.name ?? ""}
        open={dnaLanguage !== null}
        onOpenChange={(open) => {
          if (!open) setDnaLanguage(null);
        }}
      />
    </>
  );
}

function DnaFiltersPanel({
  filters,
  activeCount,
  onToggle,
  onClear,
}: {
  filters: Partial<LanguageDNA>;
  activeCount: number;
  onToggle: (axis: DnaAxis, value: DnaValue) => void;
  onClear: () => void;
}) {
  const { locale } = useRouter();
  const dnaFilterGroups = getDnaFilterGroups(locale);

  return (
    <div className="mb-7 rounded-2xl border border-border bg-card/80 p-4 dark:border-white/8 dark:bg-[#0c1216]/75 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary dark:border-primary/15 dark:bg-primary/7 dark:text-primary">
            <SlidersHorizontal className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t(locale, "ui.community_filter_by_dna")}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t(locale, "ui.community_filter_description")}
            </p>
          </div>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary">
              {t(
                locale,
                activeCount === 1
                  ? "ui.community_filter_count_singular"
                  : "ui.community_filter_count_plural",
                { count: activeCount },
              )}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground dark:hover:bg-white/5 dark:hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            {t(locale, "ui.community_clear_dna")}
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dnaFilterGroups.map((group) => (
          <fieldset key={group.axis} className="min-w-0">
            <legend className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/60 p-1 dark:border-white/6 dark:bg-black/20">
              {group.options.map((option) => {
                const selected = filters[group.axis] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-label={t(locale, "ui.community_filter_by", {
                      label: option.label,
                    })}
                    aria-pressed={selected}
                    onClick={() => onToggle(group.axis, option.value)}
                    className={`min-w-0 rounded-lg px-2 py-2 text-[11px] font-bold transition ${
                      selected
                        ? "bg-primary text-primary shadow-[0_4px_18px_rgba(110,231,183,0.16)]"
                        : "text-muted-foreground hover:bg-background hover:text-foreground dark:hover:bg-white/5 dark:hover:text-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

function CommunityLanguageCard({
  language,
  importing,
  importDisabled,
  onImport,
  onViewDna,
}: {
  language: LanguageSummary;
  importing: boolean;
  importDisabled: boolean;
  onImport: () => void;
  onViewDna: () => void;
}) {
  const { locale } = useRouter();

  return (
    <article
      data-testid="community-language-card"
      className="group relative flex min-h-72 flex-col overflow-hidden rounded-3xl border border-border bg-card/85 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_60px_rgba(16,185,129,0.08)] dark:border-white/8 dark:bg-[#10151b]/90 dark:hover:border-primary/20"
    >
      <div className="flex items-start gap-4">
        <img
          src={language.imageUrl || DEFAULT_LANGUAGE_IMAGE}
          alt=""
          className="size-14 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-extrabold text-foreground">
            {language.name}
          </h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {t(locale, "ui.community_by")}{" "}
            <span className="text-foreground">
              {language.ownerName || t(locale, "ui.community_owner_fallback")}
            </span>
          </p>
        </div>
        <Globe2
          className="size-4 shrink-0 text-primary/70"
          aria-label={t(locale, "ui.languages_public_language")}
        />
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
        {language.description ||
          t(locale, "ui.community_default_description")}
      </p>

      <div
        className="mt-4 flex flex-wrap gap-1.5"
        aria-label={t(locale, "ui.languages_dna_summary")}
      >
        {getLanguageDNAChips(language.dna, locale).map((item) => (
          <span
            key={item}
            className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary dark:border-primary/12 dark:bg-primary/5 dark:text-primary/85"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-2 border-t border-border pt-4 dark:border-white/6">
        <button
          type="button"
          onClick={onViewDna}
          aria-label={t(locale, "ui.languages_view_dna_named", {
            name: language.name,
          })}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-muted/70 px-3 py-2.5 text-xs font-bold text-foreground transition hover:border-cyan-300/20 hover:bg-cyan-300/10 hover:text-cyan-700 dark:border-white/8 dark:bg-white/4 dark:text-slate-200 dark:hover:bg-cyan-300/7 dark:hover:text-cyan-100"
        >
          <Dna className="size-4" />
          {t(locale, "ui.languages_view_dna")}
        </button>
        <button
          type="button"
          onClick={onImport}
          disabled={importDisabled}
          aria-label={t(locale, "ui.community_import_named", {
            name: language.name,
          })}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/30 px-3 py-2.5 text-xs font-black  transition hover:bg-primary disabled:cursor-wait disabled:opacity-60"
        >
          {importing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowDownToLine className="size-4" />
          )}
          {importing
            ? t(locale, "ui.community_importing")
            : t(locale, "ui.community_import")}
        </button>
      </div>
    </article>
  );
}
