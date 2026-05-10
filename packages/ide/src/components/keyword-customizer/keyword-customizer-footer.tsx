import { HeroButton } from "../buttons/hero";

export type KeywordCustomizerFooterProps = {
  activeStepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
};

export function KeywordCustomizerFooter({
  activeStepIndex,
  totalSteps,
  onBack,
  onNext,
  onSave,
}: KeywordCustomizerFooterProps) {
  return (
    <div className="mt-auto p-5 backdrop-blur-sm ">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex items-center gap-2">
          <HeroButton
            variant="ghost"
            onClick={onBack}
            type="button"
            disabled={activeStepIndex === 0}
          >
            Voltar
          </HeroButton>

          {activeStepIndex < totalSteps - 1 ? (
            <HeroButton type="button" variant="outline" onClick={onNext}>
              Continuar
            </HeroButton>
          ) : (
            <HeroButton type="button" onClick={onSave}>
              Salvar e Aplicar
            </HeroButton>
          )}
        </div>
      </div>
    </div>
  );
}
