import { useMemo } from "react";
import { useKeywordCustomizer } from "./keyword-customizer-context";
import {
  buildIOStepProps,
  buildFlowStepProps,
  buildIdentityStepProps,
  buildReviewStepProps,
  buildRulesStepProps,
  buildStructureStepProps,
  buildTypeStepProps,
} from "./keyword-customizer-step-props";
import { IdentityStep } from "./steps/identity-step";
import { IOStep } from "./steps/io-step";
import { StructureStep } from "./steps/structure-step";
import { RulesStep } from "./steps/rules-step";
import { FlowStep } from "./steps/flow-step";
import { ReviewStep } from "./steps/review-step";
import { getActiveWizardStepError } from "./keyword-customizer-validation";
import { TypeStep } from "./steps/type-step";

export function KeywordCustomizerStepContent() {
  const context = useKeywordCustomizer();
  const activeStepError = getActiveWizardStepError(
    context.activeStep.id,
    context.errors,
  );

  const stepContent = useMemo(() => {
    switch (context.activeStep.id) {
      case "identity":
        return <IdentityStep {...buildIdentityStepProps(context)} />;
      case "types":
        return <TypeStep {...buildTypeStepProps(context)} />;
      case "IO":
        return <IOStep {...buildIOStepProps(context)} />;
      case "structure":
        return <StructureStep {...buildStructureStepProps(context)} />;
      case "rules":
        return <RulesStep {...buildRulesStepProps(context)} />;
      case "flow":
        return <FlowStep {...buildFlowStepProps(context)} />;
      case "review":
        return <ReviewStep {...buildReviewStepProps(context)} />;
      default:
        return null;
    }
  }, [context]);

  return (
    <>
      {activeStepError && (
        <div className="mb-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {activeStepError}
        </div>
      )}

      {stepContent}
    </>
  );
}
