import { useState } from "react";
import { Library } from "lucide-react";
import { GradientText } from "@/components/text/gradient";
import { Subtitle } from "@/components/text/subtitle";
import { Title } from "@/components/text/title";
import { Button } from "@/components/ui/button";
import { LanguageLibraryModal } from "@/components/language-library/LanguageLibraryModal";
import { useAuth } from "@/contexts/AuthContext";
import { WizardStep } from "./keyword-customizer-types";
import { WizardStepId } from "./wizard-model";

export type KeywordCustomizerHeaderProps = {
  steps: readonly WizardStep[];
  activeStepId: WizardStepId;
};
export function KeywordCustomizerHeader({
  steps,
  activeStepId,
}: KeywordCustomizerHeaderProps) {
  const activeIndex = steps.findIndex((step) => step.id === activeStepId);
  const progress = Math.round(((activeIndex + 1) / steps.length) * 100);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const auth = useAuth();

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center -mt-4">
        <Title as="h4" id="keyword-customizer-title">
          <GradientText>Explorador Universal</GradientText>
        </Title>
        <div className="backdrop-blur-[2px] p-2 bg-slate-400/10 rounded-md ml-2 mt-1">
          <Subtitle id="keyword-customizer-description">
            Torne a experiência de codar tão única quanto você.
          </Subtitle>
        </div>
        {auth?.isAuthenticated && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-3"
            onClick={() => setLibraryOpen(true)}
          >
            <Library className="size-4" />
            <span className="ml-2">Minhas Linguagens</span>
          </Button>
        )}
        <LanguageLibraryModal open={libraryOpen} onOpenChange={setLibraryOpen} />
        {/* <div className="pr-2">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Etapa {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                de {steps.length} etapas
              </p>
            </div>
            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-300">
              {progress}%
            </p>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-emerald-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div> */}
      </div>
      {/* <div className="flex items-center gap-3">
        <HeroButton type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </HeroButton>
        <HeroButton
          onClick={onReset}
          type="button"
          variant="outline"
          disabled={!hasChanges}
        >
          Restaurar Padrão
        </HeroButton>
      </div> */}
    </div>
  );
}
