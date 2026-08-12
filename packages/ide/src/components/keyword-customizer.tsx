import { Form } from "@/components/ui/form";
import type { Language } from "@/lib/languages-api";
import { PreviewPanel } from "./keyword-customizer/preview-panel";
import { WizardStepper } from "./keyword-customizer/wizard-stepper";
import {
  KeywordCustomizerProvider,
  useKeywordCustomizer,
} from "./keyword-customizer/keyword-customizer-context";
import { KeywordCustomizerHeader } from "./keyword-customizer/keyword-customizer-header";
import { KeywordCustomizerFooter } from "./keyword-customizer/keyword-customizer-footer";
import { KeywordCustomizerStepContent } from "./keyword-customizer/keyword-customizer-step-content";

function KeywordCustomizerShell() {
  const {
    form,
    preview,
    activeStep,
    activeStepIndex,
    visibleSteps,
    actions,
    saveMode,
    isSaveReady,
  } = useKeywordCustomizer();
  return (
    <Form {...form}>
      <section className="flex flex-col gap-8 max-w-screen-3xl mx-auto">
        <form
          onSubmit={(event) => event.preventDefault()}
          aria-labelledby="keyword-customizer-title"
          aria-describedby="keyword-customizer-description"
          className="flex min-h-0 flex-col gap-8"
        >
          <WizardStepper
            steps={visibleSteps}
            activeStepId={activeStep.id}
            onStepClick={actions.goToWizardStep}
            preview={preview}
          />
          <main className="grid items-start lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] lg:pr-90">
            <div aria-hidden="true" className="hidden lg:block" />

            <div className="border-slate-200/70 dark:border-slate-800/80 lg:border-x border-t-0">
              <div className="min-h-0 flex-1 lg:p-5">
                <KeywordCustomizerHeader
                  steps={visibleSteps}
                  activeStepId={activeStep.id}
                />
                <KeywordCustomizerStepContent />
                <KeywordCustomizerFooter
                  activeStepIndex={activeStepIndex}
                  totalSteps={visibleSteps.length}
                  saveMode={saveMode}
                  isSaveReady={isSaveReady}
                  onBack={actions.goToPreviousWizardStep}
                  onNext={actions.goToNextWizardStep}
                  onSave={actions.save}
                />
              </div>
            </div>
            <PreviewPanel preview={preview} activeStepId={activeStep.id} />
          </main>
        </form>
      </section>
    </Form>
  );
}

export function KeywordCustomizer({
  editingLanguageId = null,
  initialLanguage = null,
}: {
  editingLanguageId?: number | null;
  initialLanguage?: Language | null;
} = {}) {
  return (
    <KeywordCustomizerProvider
      editingLanguageId={editingLanguageId}
      initialLanguage={initialLanguage}
    >
      <KeywordCustomizerShell />
    </KeywordCustomizerProvider>
  );
}
