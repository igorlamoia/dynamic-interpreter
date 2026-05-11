import { describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import {
  buildIdentityStepProps,
  buildIOStepProps,
  buildReviewStepProps,
  buildRulesStepProps,
  buildStructureStepProps,
  buildTypeStepProps,
} from "./keyword-customizer-step-props";
import type { KeywordCustomizerContextValue } from "./keyword-customizer-types";

function buildContext(
  override: Partial<KeywordCustomizerContextValue> = {},
): KeywordCustomizerContextValue {
  const draft = getDefaultCustomizationState();

  return {
    draftCustomization: draft,
    preview: { snippet: "live-preview" },
    errors: {
      delimiterError: null,
      statementTerminatorError: null,
      booleanLiteralError: null,
      operatorError: null,
    },
    visitedStepIds: [],
    selectedPresetId: "free",
    languageName: "",
    languageDescription: "",
    languageImageUrl: "",
    languageImageQuery: "",
    languageImageResults: [],
    isSearchingLanguageImages: false,
    languageImageSearchError: null,
    hasChanges: false,
    activeStep: "structure",
    activeStepIndex: 0,
    visibleSteps: [],
    form: {} as never,
    actions: {
      goToWizardStep: () => undefined,
      goToNextWizardStep: () => undefined,
      goToPreviousWizardStep: () => undefined,
      applyPreset: () => undefined,
      setLanguageName: () => undefined,
      setLanguageDescription: () => undefined,
      setImageSearchQuery: () => undefined,
      searchLanguageImages: async () => undefined,
      selectLanguageImage: () => undefined,
      resetDraft: () => undefined,
      save: () => undefined,
      exit: () => undefined,
      syncKeyword: () => undefined,
      syncDocumentation: () => undefined,
      syncMode: () => undefined,
      syncDelimiter: () => undefined,
      syncBooleanLiteral: () => undefined,
      syncOperatorWord: () => undefined,
      syncStatementTerminator: () => undefined,
    },
    ...override,
  } as KeywordCustomizerContextValue;
}

describe("buildIdentityStepProps", () => {
  it("passes through the language description value and setter", () => {
    const setLanguageDescription = () => undefined;

    const props = buildIdentityStepProps(
      buildContext({
        languageDescription: "Uma linguagem para aulas de logica.",
        actions: {
          ...buildContext().actions,
          setLanguageDescription,
        },
      }),
    );

    expect(props.values.languageDescription).toBe(
      "Uma linguagem para aulas de logica.",
    );
    expect(props.actions.setLanguageDescription).toBe(setLanguageDescription);
  });
});

describe("buildStructureStepProps", () => {
  it("fills the structure snippets from the draft", () => {
    const context = buildContext();

    const props = buildStructureStepProps(context);

    expect(props.values.delimiterSnippet).toContain("funcao main()");
    expect(props.values.identationSnippet).toContain("funcao main():");
    expect(props.values.optionalTerminatorSnippet).toBe('print("ok")');
    expect(props.values.requiredTerminatorSnippet).toBe('print("ok");');
    expect(props.values.fixedArraySnippet).toBe(
      'string animes[2] = ["Naruto", "AOT"]',
    );
    expect(props.values.dynamicArraySnippet).toBe(
      'string animes[] = ["Naruto", "AOT"]',
    );
  });

  it("fills documented fields with default semantic definitions", () => {
    const props = buildStructureStepProps(buildContext());

    expect(props.values.statementTerminator.description).toBe(
      "Marca o fim de uma instrução na linguagem.",
    );
    expect(props.values.delimiters.open.description).toBe(
      "Marca a abertura de um bloco delimitado.",
    );
    expect(props.values.delimiters.close.description).toBe(
      "Marca o fechamento de um bloco delimitado.",
    );
  });
});

describe("buildTypeStepProps", () => {
  it("fills keyword reference table descriptions with defaults", () => {
    const props = buildTypeStepProps(buildContext());

    expect(props.values.variableKeywords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "int",
          description: "Declara valores inteiros na linguagem.",
        }),
        expect.objectContaining({
          key: "string",
          description: "Declara textos.",
        }),
      ]),
    );
  });
});

describe("buildIOStepProps", () => {
  it("fills documented IO fields with default semantic definitions", () => {
    const props = buildIOStepProps(buildContext());

    expect(props.values.printDescription).toBe(
      "Exibe valores na saída da linguagem.",
    );
    expect(props.values.scanDescription).toBe(
      "Lê valores de entrada para o programa.",
    );
  });

  it("keeps user edited semantic definitions when present", () => {
    const draft = getDefaultCustomizationState();
    draft.languageDocumentation = {
      "keyword.print": {
        description: "Mostra texto no console customizado.",
      },
    };

    const props = buildIOStepProps(buildContext({ draftCustomization: draft }));

    expect(props.values.printDescription).toBe(
      "Mostra texto no console customizado.",
    );
  });
});

describe("buildRulesStepProps", () => {
  it("fills boolean and operator descriptions with defaults", () => {
    const props = buildRulesStepProps(buildContext());

    expect(props.values.booleanLiterals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "true",
          description: "Representa o valor lógico verdadeiro.",
        }),
      ]),
    );
    expect(props.values.operatorAliases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "logical_and",
          description:
            "Retorna verdadeiro quando todas as condições são verdadeiras.",
        }),
      ]),
    );
  });
});

describe("buildReviewStepProps", () => {
  it("maps customizer modes to grammar graph mode names", () => {
    const draft = getDefaultCustomizationState();
    draft.modes = {
      typing: "untyped",
      block: "indentation",
      semicolon: "optional-eol",
      array: "dynamic",
    };

    const props = buildReviewStepProps(
      buildContext({ draftCustomization: draft }),
    );

    expect(props.values.grammarModes).toEqual({
      typingMode: "untyped",
      blockMode: "indentation",
      semicolonMode: "optional-eol",
      arrayMode: "dynamic",
    });
  });
});
