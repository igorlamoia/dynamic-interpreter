import { HeroButton } from "../buttons/hero";
import type { LanguageSaveMode } from "@/hooks/useLanguagePersistence";

const SAVE_LABELS: Record<LanguageSaveMode, string> = {
  local: "Salvar e Aplicar",
  create: "Salvar como nova",
  update: "Salvar alterações",
};

export type KeywordCustomizerFooterProps = {
  activeStepIndex: number;
  totalSteps: number;
  saveMode: LanguageSaveMode;
  isSaveReady: boolean;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
};

export function KeywordCustomizerFooter({
  activeStepIndex,
  totalSteps,
  saveMode,
  isSaveReady,
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
            // Antes da sessão hidratar, `saveMode` ainda diz "local" mesmo para
            // quem está logado. Desabilitar por esse instante evita prometer no
            // rótulo um destino que o save não usaria.
            <HeroButton type="button" onClick={onSave} disabled={!isSaveReady}>
              {SAVE_LABELS[saveMode]}
            </HeroButton>
          )}
        </div>
      </div>
    </div>
  );
}
