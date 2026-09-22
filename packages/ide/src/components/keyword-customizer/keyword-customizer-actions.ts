import type {
  IDEBooleanLiteralMap,
  IDEKeywordCustomizationModes,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import {
  getDefaultCustomizationState,
} from "@/contexts/keyword/KeywordContext";
import { applyWizardPreset } from "./wizard-model";
import type {
  BlockDelimiters,
  StoredKeywordCustomization,
} from "@/contexts/keyword/types";

export function syncKeywordInDraft(
  draft: StoredKeywordCustomization,
  original: string,
  value: string,
): StoredKeywordCustomization {
  return {
    ...draft,
    mappings: draft.mappings.map((mapping) =>
      mapping.original === original ? { ...mapping, custom: value } : mapping,
    ),
  };
}

export function syncDocumentationInDraft(
  draft: StoredKeywordCustomization,
  id: string,
  value: string,
): StoredKeywordCustomization {
  return {
    ...draft,
    languageDocumentation: {
      ...draft.languageDocumentation,
      [id]: {
        description: value,
      },
    },
  };
}

export function syncModeInDraft<K extends keyof IDEKeywordCustomizationModes>(
  draft: StoredKeywordCustomization,
  key: K,
  value: IDEKeywordCustomizationModes[K],
): StoredKeywordCustomization {
  return {
    ...draft,
    modes: {
      ...draft.modes,
      [key]: value,
    },
  };
}

export function syncDelimiterInDraft(
  draft: StoredKeywordCustomization,
  field: keyof BlockDelimiters,
  value: string,
): StoredKeywordCustomization {
  return {
    ...draft,
    blockDelimiters: {
      ...draft.blockDelimiters,
      [field]: value,
    },
  };
}

export function syncBooleanLiteralInDraft(
  draft: StoredKeywordCustomization,
  field: keyof IDEBooleanLiteralMap,
  value: string,
): StoredKeywordCustomization {
  return {
    ...draft,
    booleanLiteralMap: {
      ...draft.booleanLiteralMap,
      [field]: value,
    },
  };
}

export function syncOperatorWordInDraft(
  draft: StoredKeywordCustomization,
  field: keyof IDEOperatorWordMap,
  value: string,
): StoredKeywordCustomization {
  return {
    ...draft,
    operatorWordMap: {
      ...draft.operatorWordMap,
      [field]: value,
    },
  };
}

export function syncStatementTerminatorInDraft(
  draft: StoredKeywordCustomization,
  value: string,
): StoredKeywordCustomization {
  return {
    ...draft,
    statementTerminatorLexeme: value,
  };
}

export function resetKeywordCustomizerDraft(): StoredKeywordCustomization {
  return applyWizardPreset(getDefaultCustomizationState(), "free");
}
