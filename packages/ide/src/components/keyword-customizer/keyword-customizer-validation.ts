import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { WizardStepId } from "./wizard-model";

export type KeywordCustomizerErrorState = {
  currentError: string | null;
  delimiterError: string | null;
  statementTerminatorError: string | null;
  booleanLiteralError: string | null;
  operatorError: string | null;
};

type WizardStepValidationContext = KeywordCustomizerErrorState & {
  draftCustomization: StoredKeywordCustomization;
};

export function resolveStepAfterKeywordValidationFailure(
  original: string,
): WizardStepId {
  if (["print", "scan"].includes(original)) return "IO";
  if (["int", "float", "bool", "string", "variable"].includes(original)) {
    return "types";
  }
  if (["void", "function"].includes(original)) return "structure";
  if (
    [
      "if",
      "else",
      "while",
      "for",
      "return",
      "break",
      "continue",
      "switch",
      "case",
      "default",
    ].includes(original)
  ) {
    return "flow";
  }

  return "identity";
}

export function getActiveWizardStepError(
  stepId: WizardStepId,
  errors: KeywordCustomizerErrorState,
): string | null {
  if (stepId === "structure") {
    return errors.delimiterError || errors.statementTerminatorError || null;
  }

  if (stepId === "rules") {
    return errors.booleanLiteralError || errors.operatorError || null;
  }

  return errors.currentError;
}

export function getValidationErrorForWizardStep(
  stepId: WizardStepId,
  context: WizardStepValidationContext,
): string | null {
  if (stepId === "IO" || stepId === "types") {
    return context.currentError;
  }

  if (stepId === "structure") {
    return context.delimiterError || context.statementTerminatorError || null;
  }

  if (stepId === "rules") {
    return context.booleanLiteralError || context.operatorError || null;
  }

  return null;
}
