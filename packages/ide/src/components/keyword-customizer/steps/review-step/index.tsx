import type { WizardPreview } from "../../preview-data";
import { WIZARD_STEPS, type WizardStepId } from "../../wizard-model";
import { PreviewCodeComparison } from "../../preview-code-comparison";
import { TokenPreview } from "../../token-preview";
import Image from "next/image";
import LaserFlow from "../../../laser-flow";
import { Ast } from "@/components/Ast";
import { Overlay } from "@/components/effect/overlay";
import type { SelectedGrammarModes } from "@/features/grammarGraph/grammarGraphAdapter";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Step } from "../components/step";
import { CurrentVocabulary } from "./current-vocabulary";

export type ReviewStepProps = {
  values: {
    preview: WizardPreview;
    grammarModes: SelectedGrammarModes;
    vocabularySections: VocabularySection[];
    visitedStepIds: WizardStepId[];
  };
  actions: {
    selectStep: (stepId: WizardStepId) => void;
  };
};

export type VocabularySection = {
  title: string;
  items: string[];
};

function getCurrentVerticalOffset(
  current: ReturnType<typeof useBreakpoint>["current"],
) {
  if (current.isXl || current.is2xl || current.is3xl) return -0.16;
  return -0.12;
}

export function ReviewStep({ values, actions }: ReviewStepProps) {
  const { current } = useBreakpoint("xl");
  const verticalBeamOffset = getCurrentVerticalOffset(current);
  return (
    <section>
      <div className="relative overflow-hidden space-y-6 ">
        <div className="pointer-events-none absolute inset-0 z-0">
          <LaserFlow
            color="#22d3ee"
            horizontalBeamOffset={0.24}
            verticalBeamOffset={verticalBeamOffset}
            horizontalSizing={0.6}
            verticalSizing={2}
            wispDensity={1}
            wispSpeed={8}
            wispIntensity={25}
            flowSpeed={0.35}
            flowStrength={0.25}
            fogIntensity={0.45}
            fogScale={0.3}
            fogFallSpeed={0.6}
            decay={1.1}
            falloffStart={1.2}
          />
        </div>
        <div className="h-290 xl:h-210 3xl:h-170">
          <Step.Header>
            <Step.Index>Etapa 7</Step.Index>
            <Step.Title>Revisão</Step.Title>
            <Step.Description>
              Confira o resumo final antes de aplicar a configuração.
            </Step.Description>
          </Step.Header>
          <div className="relative z-10 space-y-6 mt-3">
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-lg border border-slate-200/80 bg-white/85 p-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Nome da linguagem
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {values.preview.languageImageUrl ? (
                    <Image
                      src={values.preview.languageImageUrl}
                      alt={values.preview.languageLabel}
                      width={64}
                      height={64}
                      className="rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  ) : null}
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {values.preview.languageLabel}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Baseado em {values.preview.basedOnLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-white/85 p-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Resumo das regras
                </p>
                <div className="mt-3 flex flex-wrap gap-2 overflow-x">
                  {values.preview.dna.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <p>
                    As regras visíveis aqui já fazem parte do fluxo atual da
                    linguagem.
                  </p>
                </div>
              </div>
            </div>
            <CurrentVocabulary values={values} />
          </div>
        </div>
      </div>
      <div className="-mt-114  xl:-mt-75 3xl:-mt-62 relative z-10">
        <BoxResult values={values} actions={actions} />
        <Overlay side="bottom" />
        <Overlay side="left" size={20} />
      </div>
      <Overlay side="bottom" />
      <Overlay side="bottom" />
    </section>
  );
}

function BoxResult({ values, actions }: ReviewStepProps) {
  const stepLabels = new Map(
    WIZARD_STEPS.map((step) => [step.id, step.title] as const),
  );
  return (
    <div
      className="pb-15 space-y-6 rounded-t-xl border-t-2 border-x-2 border-slate-200/80 bg-white/90 p-4 backdrop-blur dark:border-cyan-500 dark:bg-slate-900/70
      shadow-[10px_-20px_50px_-15px_rgba(34,211,238,0.3)]
    "
    >
      <PreviewCodeComparison
        title="Comparação do código final"
        beforeCode={values.preview.baselineSnippet}
        afterCode={values.preview.snippet}
      />
      <TokenPreview tokens={values.preview.tokenPreview} />
      <Ast selectedModes={values.grammarModes} height={620} />
      <div className="rounded-lg border border-slate-200/80 bg-white/90 p-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/80">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Voltar para editar
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {values.visitedStepIds
            .filter((stepId) => stepId !== "review")
            .map((stepId) => (
              <button
                key={stepId}
                type="button"
                onClick={() => actions.selectStep(stepId)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
              >
                {stepLabels.get(stepId) ?? stepId}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
