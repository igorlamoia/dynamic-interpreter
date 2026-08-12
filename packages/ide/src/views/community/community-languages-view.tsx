import { useDeferredValue, useMemo, useState } from "react";
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

const DEFAULT_LANGUAGE_IMAGE = "/images/language-default.png";

type DnaAxis = keyof LanguageDNA;
type DnaValue = LanguageDNA[DnaAxis];

const DNA_FILTER_GROUPS: Array<{
  axis: DnaAxis;
  label: string;
  options: Array<{ value: DnaValue; label: string }>;
}> = [
  {
    axis: "typing",
    label: "Tipagem",
    options: [
      { value: "typed", label: "Tipada" },
      { value: "untyped", label: "Não tipada" },
    ],
  },
  {
    axis: "block",
    label: "Blocos",
    options: [
      { value: "delimited", label: "Delimitada" },
      { value: "indentation", label: "Indentada" },
    ],
  },
  {
    axis: "array",
    label: "Arrays",
    options: [
      { value: "fixed", label: "Fixos" },
      { value: "dynamic", label: "Dinâmicos" },
    ],
  },
  {
    axis: "semicolon",
    label: "Terminador",
    options: [
      { value: "optional-eol", label: "Opcional" },
      { value: "required", label: "Obrigatório" },
    ],
  },
];

export function CommunityLanguagesView() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [dnaFilters, setDnaFilters] = useState<Partial<LanguageDNA>>({});
  const deferredSearch = useDeferredValue(search.trim());
  const catalogFilters = useMemo<CommunityLanguageFilters>(
    () => ({
      ...dnaFilters,
      ...(deferredSearch ? { query: deferredSearch } : {}),
    }),
    [deferredSearch, dnaFilters],
  );
  const catalog = useCommunityLanguages(catalogFilters);
  const importLanguage = useImportLanguage();
  const [importingId, setImportingId] = useState<number | null>(null);
  const [dnaLanguage, setDnaLanguage] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const activeDnaFilterCount = Object.values(dnaFilters).filter(Boolean).length;
  const hasActiveCriteria = deferredSearch !== "" || activeDnaFilterCount > 0;

  const toggleDnaFilter = (axis: DnaAxis, value: DnaValue) => {
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
        message: `"${imported.name}" foi adicionada às suas linguagens.`,
      });
    } catch (error) {
      showToast({
        type: "error",
        message: getApiErrorMessage(error, "Não foi possível importar a linguagem."),
      });
    } finally {
      setImportingId(null);
    }
  };

  return (
    <>
      <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-[#0d1717]/90 px-6 py-9 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:px-10">
        <div className="pointer-events-none absolute -right-20 -top-32 size-96 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-1/2 bg-linear-to-r from-transparent via-emerald-300/60 to-transparent" />
        <div className="relative max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">
            <Sparkles className="size-3.5" />
            Acervo colaborativo
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
            Atlas de <span className="text-emerald-300">linguagens</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Descubra gramáticas criadas pela comunidade, examine cada eixo do
            DNA e importe uma base para experimentar no seu próprio acervo.
          </p>
        </div>
      </header>

      <section aria-labelledby="catalog-title">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="catalog-title" className="text-xl font-bold text-white">
              Linguagens publicadas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A importação cria uma cópia privada e editável no seu acervo.
            </p>
          </div>
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Buscar linguagens</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou descrição"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/35 focus:bg-emerald-300/5 focus:ring-2 focus:ring-emerald-300/10"
            />
          </label>
        </div>

        <DnaFiltersPanel
          filters={dnaFilters}
          activeCount={activeDnaFilterCount}
          onToggle={toggleDnaFilter}
          onClear={() => setDnaFilters({})}
        />

        {catalog.isPending ? (
          <div className="flex min-h-64 items-center justify-center" aria-label="Carregando catálogo">
            <Loader2 className="size-7 animate-spin text-emerald-300" />
          </div>
        ) : catalog.isError ? (
          <div role="alert" className="rounded-2xl border border-red-400/15 bg-red-400/5 p-8 text-center text-sm text-red-200">
            {getApiErrorMessage(catalog.error, "Não foi possível carregar o acervo.")}
          </div>
        ) : (catalog.data?.length ?? 0) === 0 ? (
          <div className="rounded-3xl border border-dashed border-emerald-300/15 bg-emerald-300/3 px-6 py-16 text-center">
            <Globe2 className="mx-auto size-9 text-emerald-300/60" />
            <p className="mt-4 font-bold text-slate-200">
              {hasActiveCriteria ? "Nenhuma linguagem encontrada" : "O atlas ainda está vazio"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {hasActiveCriteria
                ? "Tente remover algum filtro de DNA ou alterar a busca."
                : "Usuários da comunidade podem publicar pelo acervo pessoal."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.data?.map((language) => (
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
        )}
      </section>

      <LanguageDnaDialog
        languageId={dnaLanguage?.id}
        languageName={dnaLanguage?.name ?? ""}
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
  return (
    <div className="mb-7 rounded-2xl border border-white/8 bg-[#0c1216]/75 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-300/15 bg-emerald-300/7 text-emerald-200">
            <SlidersHorizontal className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Filtrar pelo DNA</h3>
            <p className="text-[11px] text-slate-500">
              Combine características de diferentes eixos.
            </p>
          </div>
          {activeCount > 0 && (
            <span className="rounded-full bg-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-950">
              {activeCount} {activeCount === 1 ? "filtro" : "filtros"}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            Limpar DNA
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {DNA_FILTER_GROUPS.map((group) => (
          <fieldset key={group.axis} className="min-w-0">
            <legend className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
              {group.label}
            </legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/6 bg-black/20 p-1">
              {group.options.map((option) => {
                const selected = filters[group.axis] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-label={`Filtrar por ${option.label}`}
                    aria-pressed={selected}
                    onClick={() => onToggle(group.axis, option.value)}
                    className={`min-w-0 rounded-lg px-2 py-2 text-[11px] font-bold transition ${
                      selected
                        ? "bg-emerald-300 text-emerald-950 shadow-[0_4px_18px_rgba(110,231,183,0.16)]"
                        : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
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
  return (
    <article data-testid="community-language-card" className="group relative flex min-h-72 flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#10151b]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/20 hover:shadow-[0_22px_60px_rgba(16,185,129,0.08)]">
      <div className="flex items-start gap-4">
        <img
          src={language.imageUrl || DEFAULT_LANGUAGE_IMAGE}
          alt=""
          className="size-14 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-extrabold text-white">{language.name}</h3>
          <p className="mt-1 truncate text-xs text-slate-500">
            por <span className="text-slate-300">{language.ownerName || "Comunidade"}</span>
          </p>
        </div>
        <Globe2 className="size-4 shrink-0 text-emerald-300/70" aria-label="Linguagem pública" />
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">
        {language.description || "Uma linguagem personalizada compartilhada com a comunidade."}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Resumo do DNA">
        {getLanguageDNAChips(language.dna).map((item) => (
          <span key={item} className="rounded-full border border-emerald-300/12 bg-emerald-300/5 px-2.5 py-1 text-[10px] font-semibold text-emerald-100/85">
            {item}
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-2 border-t border-white/6 pt-4">
        <button type="button" onClick={onViewDna} aria-label={`Ver DNA de ${language.name}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-xs font-bold text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/7 hover:text-cyan-100">
          <Dna className="size-4" />
          Ver DNA
        </button>
        <button type="button" onClick={onImport} disabled={importDisabled} aria-label={`Importar ${language.name}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-3 py-2.5 text-xs font-black text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60">
          {importing ? <Loader2 className="size-4 animate-spin" /> : <ArrowDownToLine className="size-4" />}
          {importing ? "Importando" : "Importar"}
        </button>
      </div>
    </article>
  );
}
