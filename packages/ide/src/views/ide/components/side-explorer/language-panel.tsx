"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useEditor } from "@/hooks/useEditor";
import { useKeywords } from "@/contexts/keyword/KeywordContext";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";
import { cn } from "@/lib/utils";
import {
  listSavedKeywordLanguages,
  loadActiveSavedKeywordLanguage,
  loadSavedKeywordLanguage,
  setActiveSavedKeywordLanguage,
  type SavedKeywordLanguageIndexEntry,
} from "@/lib/keyword-language-storage";
import { PREVIEW_CATEGORIES } from "@/components/keyword-customizer/preview-panel/categories-list";
import { getCategoryLexemes } from "./category-lexemes";

export type LanguageCustomization = NonNullable<
  ReturnType<typeof loadSavedKeywordLanguage>
>["customization"];

function getDefaultLanguageImage(imageUrl?: string) {
  return imageUrl?.trim() ? imageUrl : "/images/language-default.png";
}

function getLanguageDNA(customization: LanguageCustomization): string[] {
  return [
    customization.modes.typing === "typed" ? "tipada" : "nao tipada",
    customization.modes.block === "delimited"
      ? "blocos com delimitadores"
      : "blocos por indentacao",
    customization.modes.semicolon === "required"
      ? "terminador obrigatorio"
      : "terminador opcional",
  ];
}

export function LanguagePanel() {
  const editor = useEditor();
  const { setCustomization } = useKeywords();
  const [languages, setLanguages] = useState<SavedKeywordLanguageIndexEntry[]>(
    [],
  );
  const [selectedSlug, setSelectedSlug] = useState("");

  useEffect(() => {
    const nextLanguages = listSavedKeywordLanguages();
    setLanguages(nextLanguages);

    const activeSlug =
      loadActiveSavedKeywordLanguage()?.slug ?? nextLanguages[0]?.slug ?? "";
    setSelectedSlug(activeSlug);

    if (!activeSlug) return;

    const loadedLanguage = loadSavedKeywordLanguage(activeSlug);
    if (loadedLanguage) {
      setActiveSavedKeywordLanguage(activeSlug);
      setCustomization(loadedLanguage.customization);
    }
  }, [setCustomization]);

  const visibleLanguage = useMemo(() => {
    const currentSlug = selectedSlug || loadActiveSavedKeywordLanguage()?.slug;
    const currentLanguage = currentSlug
      ? loadSavedKeywordLanguage(currentSlug)
      : null;

    if (currentLanguage) return currentLanguage;

    const fallbackSlug = languages[0]?.slug;
    return fallbackSlug ? loadSavedKeywordLanguage(fallbackSlug) : null;
  }, [languages, selectedSlug]);

  const handleLexemeClick = (lexeme: string) => {
    editor.insertTextAtCursor(lexeme);
  };

  if (!languages.length) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
        Nenhuma linguagem salva foi encontrada.
      </div>
    );
  }

  return (
    <PerfectScrollbar className="flex h-full min-h-0 flex-col gap-4  p-4">
      <div className="relative shrink-0 overflow-visible">
        <div className="group relative overflow-visible rounded-2xl border border-black/10 bg-black/5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-white/5">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <Image
              src={getDefaultLanguageImage(visibleLanguage?.imageUrl)}
              alt={visibleLanguage?.name ?? "Language default"}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover opacity-70 transition duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.24),transparent_28%),radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.24),transparent_22%),linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.55)_58%,rgba(2,6,23,0.92)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(34,211,238,0.08)_20%,rgba(34,211,238,0.28)_34%,rgba(34,211,238,0.06)_48%,transparent_66%)] opacity-90 mix-blend-screen" />
          </div>

          <div className="relative flex min-h-35 flex-col justify-between p-4 sm:min-h-40 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70 backdrop-blur-sm">
                Linguagem ativa
              </div>
              <LanguageOptionsMenu
                setCustomization={setCustomization}
                setSelectedSlug={setSelectedSlug}
                selectedSlug={selectedSlug}
                languages={languages}
              />
            </div>

            <LanguageDescription visibleLanguage={visibleLanguage} />

            <div className="mt-4 flex flex-wrap gap-2">
              {visibleLanguage?.customization
                ? getLanguageDNA(visibleLanguage.customization).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100 backdrop-blur-sm"
                    >
                      {item}
                    </span>
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 pb-4 pt-1">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Lexemas
          </p>
          <div className="space-y-3">
            {PREVIEW_CATEGORIES.map((category) => {
              const customization = visibleLanguage?.customization;

              if (!customization) return null;

              const lexemes = getCategoryLexemes(category.key, customization);

              return (
                <section
                  key={category.key}
                  className="rounded-2xl border border-black/10 bg-background p-3 dark:border-white/10"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <category.icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-semibold">
                        {category.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {category.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {lexemes.map((lexeme) => (
                      <button
                        key={`${category.key}-${lexeme}`}
                        type="button"
                        onClick={() => handleLexemeClick(lexeme)}
                        title={lexeme}
                        className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary dark:border-white/10 dark:bg-white/5"
                      >
                        {lexeme}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </PerfectScrollbar>
  );
}

function LanguageDescription({
  visibleLanguage,
}: {
  visibleLanguage: ReturnType<typeof loadSavedKeywordLanguage> | null;
}) {
  return (
    <div className="max-w-[83%]">
      <h2 className="truncate text-xl font-semibold text-white drop-shadow-sm sm:text-2xl">
        {visibleLanguage?.name ?? "Java--"}
      </h2>
      <p className="mt-1 truncate text-sm text-white/90">
        {visibleLanguage?.description ??
          "Uma linguagem de programação personalizada criada com o Java--."}
      </p>
    </div>
  );
}

interface LanguageOptionsMenuProps {
  setCustomization: (customization: LanguageCustomization) => void;
  setSelectedSlug: (slug: string) => void;
  selectedSlug: string;
  languages: SavedKeywordLanguageIndexEntry[];
}

function LanguageOptionsMenu(props: LanguageOptionsMenuProps) {
  const { setCustomization, setSelectedSlug, selectedSlug, languages } = props;
  const handleSelectLanguage = (slug: string) => {
    const loadedLanguage = loadSavedKeywordLanguage(slug);
    if (!loadedLanguage) return;

    setActiveSavedKeywordLanguage(slug);
    setCustomization(loadedLanguage.customization);
    setSelectedSlug(slug);
  };

  return (
    <div className="relative z-20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Abrir seleção de linguagem"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/90 backdrop-blur-sm transition hover:border-white/20 hover:bg-black/35"
          >
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-max max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
              Seleção de linguagem
            </p>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60 backdrop-blur-sm">
              {languages.length}
            </span>
          </div>

          <PerfectScrollbar axis="y" className="max-h-56 pr-1">
            <div className="flex flex-col gap-2">
              {languages.map((language) => {
                const isSelected = language.slug === selectedSlug;

                return (
                  <DropdownMenuItem key={language.slug} asChild>
                    <button
                      type="button"
                      onClick={() => handleSelectLanguage(language.slug)}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border px-3 py-2 text-left transition backdrop-blur-sm",
                        isSelected
                          ? "border-white/60 bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                          : "border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10",
                      )}
                    >
                      <div className="pointer-events-none absolute inset-0">
                        <Image
                          src={getDefaultLanguageImage(language.imageUrl)}
                          alt={language.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 320px"
                          className="object-cover opacity-35 transition duration-300 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.62)_100%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(34,211,238,0.05)_24%,rgba(34,211,238,0.16)_40%,rgba(34,211,238,0.04)_58%,transparent_78%)] opacity-80 mix-blend-screen" />
                      </div>

                      <div className="relative z-10 min-w-0">
                        <p className="text-sm font-medium leading-tight text-white">
                          {language.name}
                        </p>
                        <p className="text-xs text-white/65">{language.slug}</p>
                      </div>
                    </button>
                  </DropdownMenuItem>
                );
              })}
            </div>
          </PerfectScrollbar>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
