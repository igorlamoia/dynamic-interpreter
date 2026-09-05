"use client";

import Image from "next/image";
import { ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditor } from "@/hooks/useEditor";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";
import { cn } from "@/lib/utils";
import {
  useLanguageChoices,
  type ActiveLanguageDetail,
  type LanguageChoice,
} from "@/hooks/useLanguageChoices";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { PREVIEW_CATEGORIES } from "@/components/keyword-customizer/preview-panel/categories-list";
import { getCategoryLexemes } from "./category-lexemes";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export type LanguageCustomization = StoredKeywordCustomization;

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
  const router = useRouter();
  // Sem efeito de "aplicar a linguagem ativa ao montar": o KeywordContext já
  // faz isso nos dois caminhos, e duas fontes disputando o mesmo estado é
  // pedir para elas divergirem.
  const { choices, activeKey, activeLanguage, selectLanguage } =
    useLanguageChoices();

  const handleLexemeClick = (lexeme: string) => {
    editor.insertTextAtCursor(lexeme);
  };

  if (!choices.length) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
        Nenhuma linguagem salva foi encontrada.
      </div>
    );
  }

  return (
    <PerfectScrollbar className="flex h-full min-h-0 flex-col gap-4  p-4">
      <div className="relative shrink-0 overflow-visible">
        <div className="group mt-6 relative overflow-visible rounded-2xl border border-black/10 bg-black/5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-white/5">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <Image
              src={getDefaultLanguageImage(activeLanguage?.imageUrl)}
              alt={activeLanguage?.name ?? "Language default"}
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
                choices={choices}
                activeKey={activeKey}
                onSelect={selectLanguage}
              />
            </div>

            <LanguageDescription activeLanguage={activeLanguage} />

            <div className="mt-4 flex flex-wrap gap-2">
              {activeLanguage?.customization
                ? getLanguageDNA(activeLanguage.customization).map((item) => (
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
              const customization = activeLanguage?.customization;

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
      <div className="flex justify-center">
        <AddLanguageButton onClick={() => router.push("/language-creator")} />
      </div>
    </PerfectScrollbar>
  );
}

function LanguageDescription({
  activeLanguage,
}: {
  activeLanguage: ActiveLanguageDetail | null;
}) {
  const description =
    activeLanguage?.description ||
    "Uma linguagem de programação personalizada criada com o Java--.";

  return (
    <div className="max-w-[83%]">
      <h2 className="truncate text-xl font-semibold text-white drop-shadow-sm sm:text-2xl">
        {activeLanguage?.name ?? "Java--"}
      </h2>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="mt-1 truncate text-sm text-white/90 cursor-help">
              {description}
            </p>
          </TooltipTrigger>
          <TooltipContent>{description}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

interface LanguageOptionsMenuProps {
  choices: LanguageChoice[];
  activeKey: string;
  onSelect: (key: string) => Promise<void>;
}

function LanguageOptionsMenu({
  choices,
  activeKey,
  onSelect,
}: LanguageOptionsMenuProps) {
  const router = useRouter();
  return (
    <div className="relative z-20">
      <TooltipProvider>
        <Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir seleção de linguagem"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/90 backdrop-blur-sm transition hover:border-white/20 hover:bg-black/35"
                >
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </button>
              </TooltipTrigger>
            </DropdownMenuTrigger>
            <TooltipContent>Selecionar linguagem ativa</TooltipContent>

            <DropdownMenuContent
              align="end"
              className="w-max max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  Seleção de linguagem
                </p>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60 backdrop-blur-sm">
                  {choices.length}
                </span>
              </div>

              <PerfectScrollbar axis="y" className="max-h-56 pr-1">
                <div className="flex flex-col gap-2">
                  {choices.map((choice) => {
                    const isSelected = choice.key === activeKey;

                    return (
                      <DropdownMenuItem key={choice.key} asChild>
                        <button
                          type="button"
                          onClick={() => void onSelect(choice.key)}
                          className={cn(
                            "group relative overflow-hidden rounded-xl border px-3 py-2 text-left transition backdrop-blur-sm",
                            isSelected
                              ? "border-white/60 bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                              : "border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10",
                          )}
                        >
                          <div className="pointer-events-none absolute inset-0">
                            <Image
                              src={getDefaultLanguageImage(choice.imageUrl)}
                              alt={choice.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 320px"
                              className="object-cover opacity-35 transition duration-300 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.62)_100%)]" />
                            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(34,211,238,0.05)_24%,rgba(34,211,238,0.16)_40%,rgba(34,211,238,0.04)_58%,transparent_78%)] opacity-80 mix-blend-screen" />
                          </div>

                          <div className="relative z-10 min-w-0">
                            <p className="text-sm font-medium leading-tight text-white">
                              {choice.name}
                            </p>
                          </div>
                        </button>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </PerfectScrollbar>
              <div className="flex justify-center pt-3">
                <AddLanguageButton
                  onClick={() => router.push("/language-creator")}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function AddLanguageButton({ onClick }: { onClick: () => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Criar linguagem"
            onClick={onClick}
            className="rounded-full shadow-md hover:shadow-lg"
          >
            <Plus aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Criar linguagem</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
