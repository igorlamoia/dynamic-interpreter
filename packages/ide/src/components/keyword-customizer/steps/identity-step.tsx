"use client";

import { Atom, Code, Languages, Sparkles, ChevronDown } from "lucide-react";
import { OptionCard, OptionCardIconColor } from "../option-card";
import type { WizardPresetId } from "../wizard-model";
import { Step } from "./components/step";

import { useState, type ReactNode } from "react";
import {
  InputWithActions,
  InputActionButton,
} from "@/components/ui/input-with-actions";
import { Button } from "@/components/ui/button";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";
import { HeroButton } from "@/components/buttons/hero";
import { Overlay } from "@/components/effect/overlay";
export type IdentityImageSearchResult = {
  id: number;
  provider: "pixabay" | "unsplash";
  previewURL: string;
  webformatURL: string;
  tags: string;
};

function getImageAttributionLabel(
  providers: IdentityImageSearchResult["provider"][],
): string {
  const uniqueProviders = Array.from(new Set(providers));

  if (
    uniqueProviders.length === 2 &&
    uniqueProviders.includes("pixabay") &&
    uniqueProviders.includes("unsplash")
  ) {
    return "Resultados de imagem fornecidos por Pixabay e Unsplash.";
  }

  if (uniqueProviders[0] === "unsplash") {
    return "Resultados de imagem fornecidos por Unsplash.";
  }

  return "Resultados de imagem fornecidos por Pixabay.";
}

export type IdentityStepProps = {
  values: {
    selectedPresetId: WizardPresetId;
    languageName: string;
    languageDescription: string;
    imageSearchQuery: string;
    imageSearchResults: IdentityImageSearchResult[];
    selectedImageUrl: string;
    isSearchingImages: boolean;
    imageSearchError: string | null;
  };
  actions: {
    selectPreset: (presetId: WizardPresetId) => void;
    setLanguageName: (value: string) => void;
    setLanguageDescription: (value: string) => void;
    setImageSearchQuery: (value: string) => void;
    searchImages: () => void;
    selectImage: (imageUrl: string) => void;
  };
};

const stringClass = "text-[#AD7B68]";
const functionClass = "font-semibold text-emerald-300";
const blockClass = "text-rose-300";
const typeClass = "text-blue-400";
const normalClass = "text-slate-200";
const conditionalClass = "text-amber-300";

const ADVANCED_PRESETS: WizardPresetId[] = [
  "minimal",
  "ruby-like",
  "mineres-like",
];

const PRESET_OPTIONS: Array<{
  id: WizardPresetId;
  title: string;
  subtitle: string;
  description: string;
  snippet: ReactNode;
  icon: ReactNode;
  iconColor?: OptionCardIconColor;
}> = [
  {
    id: "free",
    title: "Livre",
    subtitle: "CUSTOM DNA",
    description: "Deixa a configuração manual começar sem sugestão fixa.",
    snippet: (
      <span className="flex flex-col gap-1">
        <p className="inline-flex flex-wrap gap-1">
          <span className={typeClass}>int</span>
          <span className={functionClass}>main</span>
          <span className={normalClass}>(</span>
          <span className={normalClass}>)</span>
          <span className={blockClass}>&#123;</span>
        </p>
        <p>
          <span className={`${functionClass} pl-2`}>print</span>
          <span className="text-slate-200">(</span>
          <span className={stringClass}>&quot;Olá mundo&quot;</span>
          <span className="text-slate-200">)</span>
          <span className={normalClass}>;</span>
        </p>
        <span className={blockClass}>&#125;</span>
      </span>
    ),
    icon: <Atom className="h-5 w-5" />,
    iconColor: "cyan",
  },
  {
    id: "didactic-pt",
    title: "Didatica em Portugues",
    subtitle: "PT-BR LOGIC",
    description:
      "Traz o vocabulário de controle, tipos e blocos para português.",
    snippet: (
      <span className="flex flex-col gap-1">
        <p className="inline-flex flex-wrap gap-1">
          <span className={typeClass}>inteiro</span>
          <span className={functionClass}>main</span>
          <span className={normalClass}>(</span>
          <span className={normalClass}>)</span>
          <span className={blockClass}>inicio</span>
        </p>
        <span className="block pl-2">
          <span className="text-emerald-300">escreva</span>
          <span className="text-slate-200">(</span>
          <span className="text-amber-300">&quot;Olá mundo&quot;</span>
          <span className="text-slate-200">)</span>
          <span className={normalClass}>;</span>
        </span>
        <span className="text-rose-300">fim</span>
      </span>
    ),
    icon: <Languages className="h-5 w-5" />,
    iconColor: "violet",
  },
  {
    id: "python-like",
    title: "Pythonica",
    subtitle: "INDENTED FLOW",
    description:
      "Troca blocos por indentacao e remove terminadores explicitos.",
    snippet: (
      <span className="flex flex-col gap-1">
        <p className="inline-flex flex-wrap gap-1">
          <span className={typeClass}>int</span>
          <span className={functionClass}>main</span>
          <span className={normalClass}>(</span>
          <span className={normalClass}>)</span>
          <span className={blockClass}>:</span>
        </p>
        <p>
          <span className={`${functionClass} pl-2`}>print</span>
          <span className="text-slate-200">(</span>
          <span className={stringClass}>&quot;Olá mundo&quot;</span>
          <span className="text-slate-200">)</span>
        </p>
      </span>
    ),
    icon: <Sparkles className="h-5 w-5" />,
    iconColor: "rose",
  },
  {
    id: "minimal",
    title: "Minimalista",
    subtitle: "ZERO SURFACE",
    description: "Mantém todos os comandos visíveis, mas com aliases curtos.",
    snippet: (
      <>
        <span className="flex flex-col gap-1">
          <p className="inline-flex flex-wrap gap-1">
            <span className={typeClass}>int</span>
            <span className={functionClass}>main</span>
            <span className={normalClass}>(</span>
            <span className={normalClass}>)</span>
            <span className={blockClass}>&#123;</span>
          </p>
          <p>
            <span className={`${functionClass} pl-2`}>out</span>
            <span className="text-slate-200">(</span>
            <span className={stringClass}>&quot;Olá mundo&quot;</span>
            <span className="text-slate-200">)</span>
            <span className={normalClass}>;</span>
          </p>
          <span className={blockClass}>&#125;</span>
        </span>
      </>
    ),
    icon: <Code className="h-5 w-5" />,
    iconColor: "emerald",
  },

  {
    id: "ruby-like",
    title: "Ruby-like",
    subtitle: "BEGIN / END",
    description: "Usa blocos com inicio e fim, com nomes proximos do Ruby.",
    snippet: (
      <span className="flex flex-col gap-1">
        <span className="flex flex-col gap-1">
          <p className="inline-flex flex-wrap gap-1">
            <span className={typeClass}>int</span>
            <span className={functionClass}>main</span>
            <span className={normalClass}>(</span>
            <span className={normalClass}>)</span>
            <span className="text-rose-300">inicio</span>
          </p>
        </span>
        <div className="pl-2">
          <span className="inline-flex flex-wrap items-center gap-1">
            <span className={conditionalClass}>if_then</span>
            <span className="text-slate-200">(</span>
            <span className="text-cyan-300">true_word</span>
            <span className="text-slate-200">)</span>
            <span className="text-rose-300">inicio</span>
          </span>
          <span className="block pl-2">
            <span className="text-emerald-300">puts</span>
            <span className="text-slate-200">(</span>
            <span className={stringClass}>&quot;Olá mundo&quot;</span>
            <span className="text-slate-200">)</span>
          </span>
          <span className="text-rose-300">fim</span>
        </div>

        <span className="text-rose-300">fim</span>
      </span>
    ),
    icon: <Code className="h-5 w-5" />,
    iconColor: "rose",
  },
  {
    id: "mineres-like",
    title: "Mineres",
    subtitle: "TREM BUNITO",
    description:
      "Puxa o vocabulário para um dialeto regional em tudo que o modelo suporta.",
    snippet: (
      <span className="flex flex-col gap-1">
        <span className="flex flex-col gap-1">
          <p className="inline-flex flex-wrap gap-1">
            <span className={typeClass}>trem_di_numeru</span>
            <span className={functionClass}>main</span>
            <span className={normalClass}>(</span>
            <span className={normalClass}>)</span>
            <span className="text-rose-300">simbora</span>
          </p>
        </span>
        <span className="block pl-2">
          <span className="text-emerald-300">oia_proce_ve</span>
          <span className="text-slate-200">(</span>
          <span className={stringClass}>&quot;Olá mundo&quot;</span>
          <span className="text-slate-200">)</span>
          <span className="text-slate-200">uai</span>
        </span>
        <span className="text-rose-300">cabo uai</span>
      </span>
    ),
    icon: <Languages className="h-5 w-5" />,
    iconColor: "amber",
  },
];

export function IdentityStep({ values, actions }: IdentityStepProps) {
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const isAdvancedModeSelected = ADVANCED_PRESETS.includes(
    values.selectedPresetId,
  );
  const isAdvancedMode = showAdvancedMode || isAdvancedModeSelected;
  const visiblePresets = isAdvancedMode
    ? PRESET_OPTIONS
    : PRESET_OPTIONS.slice(0, 3);

  return (
    <section className="space-y-6">
      <Step.Header>
        <Step.Index>Etapa 1</Step.Index>
        <Step.Title>Que tipo de linguagem você quer criar?</Step.Title>
        <Step.Description>
          Escolha um ponto de partida. A seleção apenas sugere lexemas iniciais
          e continua totalmente editável.
        </Step.Description>
      </Step.Header>

      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visiblePresets.map((preset) => (
            <OptionCard
              key={preset.id}
              title={preset.title}
              subtitle={preset.subtitle}
              description={preset.description}
              snippet={preset.snippet}
              icon={preset.icon}
              iconColor={preset.iconColor}
              selected={preset.id === values.selectedPresetId}
              onClick={() => actions.selectPreset(preset.id)}
            />
          ))}
        </div>

        {isAdvancedMode ? (
          <button
            type="button"
            onClick={() => setShowAdvancedMode(false)}
            className="ml-auto rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-950 flex items-center justify-center gap-2"
          >
            <span>Mostrar menos</span>
            <ChevronDown className="h-4 w-4 rotate-180" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdvancedMode(true)}
            className="ml-auto rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-950 flex items-center justify-center gap-2"
          >
            <span>Mostrar mais</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="space-y-3 rounded-lg border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="space-y-1">
            <label
              htmlFor="language-name"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
            >
              Nome da linguagem
            </label>
            <input
              id="language-name"
              aria-label="Nome da linguagem"
              value={values.languageName}
              onChange={(event) => actions.setLanguageName(event.target.value)}
              placeholder="Ex.: Didatica Neon"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition-colors focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Esse nome será usado no preview, no salvamento e no seletor da
              IDE.
            </p>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="language-description"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
            >
              Descrição da linguagem
            </label>
            <textarea
              id="language-description"
              aria-label="Descrição da linguagem"
              value={values.languageDescription}
              onChange={(event) =>
                actions.setLanguageDescription(event.target.value)
              }
              placeholder="Ex.: Uma linguagem didática inspirada em português para ensinar lógica de programação"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition-colors focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A descrição é opcional, mas pode ajudar a lembrar das escolhas
              feitas
            </p>
          </div>
        </div>

        <ImageSearchFeature values={values} actions={actions} />
      </div>
    </section>
  );
}

function ImageSearchFeature({
  values,
  actions,
}: {
  values: IdentityStepProps["values"];
  actions: IdentityStepProps["actions"];
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="flex flex-col gap-2 w-full">
        <label
          htmlFor="language-image-search"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
        >
          Buscar imagem
        </label>

        <div className="flex gap-2">
          <InputWithActions
            id="language-image-search"
            aria-label="Buscar imagem da linguagem"
            value={values.imageSearchQuery}
            onChange={(event) =>
              actions.setImageSearchQuery(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                actions.searchImages();
              }
            }}
            placeholder="Ex.: neon code"
            className="h-full w-full"
            actions={
              <InputActionButton
                icon={Sparkles}
                tooltip="Limpar"
                onClick={() => actions.setImageSearchQuery("")}
              />
            }
          />

          <HeroButton
            type="button"
            onClick={() => actions.searchImages()}
            disabled={values.isSearchingImages}
            variant="ghost"
          >
            {values.isSearchingImages ? "Buscando..." : "Buscar"}
          </HeroButton>
        </div>
      </div>

      {values.imageSearchError && (
        <p className="text-sm text-rose-600 dark:text-rose-300">
          {values.imageSearchError}
        </p>
      )}

      {values.imageSearchResults.length > 0 && (
        <div className="relative">
          <PerfectScrollbar className="space-y-3 max-h-100">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {getImageAttributionLabel(
                values.imageSearchResults.map((image) => image.provider),
              )}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {values.imageSearchResults.map((image) => {
                const isSelected =
                  values.selectedImageUrl === image.webformatURL;

                return (
                  <button
                    key={`${image.provider}-${image.id}`}
                    type="button"
                    onClick={() =>
                      isSelected
                        ? actions.selectImage("")
                        : actions.selectImage(image.webformatURL)
                    }
                    className={[
                      "relative overflow-hidden rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-cyan-500 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]"
                        : "border-slate-200 dark:border-slate-700",
                    ].join(" ")}
                  >
                    <img
                      src={image.previewURL}
                      alt={image.tags}
                      className="h-28 w-full object-cover"
                    />
                    <div className="space-y-2 p-3">
                      <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                        {image.tags}
                      </p>
                      {isSelected && (
                        <span className="absolute top-1/2 left-1/2 backdrop-blur-xs rounded-lg p-4 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
                          Selecionada
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </PerfectScrollbar>
          <Overlay side="bottom" size={60} />
          <Overlay side="bottom" size={60} />
          {/* <div className="absolute pointer-events-none inset-0 bg-linear-to-b from-slate-950/5 via-slate-950/10 to-slate-950/80" /> */}
        </div>
      )}
    </div>
  );
}
