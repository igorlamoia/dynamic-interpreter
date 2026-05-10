import {
  getBooleanDocumentationId,
  getDefaultDocumentationDescription,
  getKeywordDocumentationId,
  getOperatorDocumentationId,
} from "@/lib/language-documentation";
import type { SelectedGrammarModes } from "@/features/grammarGraph/grammarGraphAdapter";
import { OPERATOR_WORD_FIELDS } from "@/lib/operator-word-map";
import type { KeywordCustomizerContextValue } from "./keyword-customizer-types";
import type { IdentityStepProps } from "./steps/identity-step";
import type { FlowStepProps } from "./steps/flow-step";
import type { ReviewStepProps } from "./steps/review-step";
import type { RulesStepProps } from "./steps/rules-step";
import type { StructureStepProps } from "./steps/structure-step";
import type { IOStepProps } from "./steps/io-step";
import type { TypeStepProps } from "./steps/type-step";
import {
  buildDynamicArraySnippet,
  buildDelimiterSnippet,
  buildFixedArraySnippet,
  buildIdentationSnippet,
  buildOptionalTerminatorSnippet,
  buildRequiredTerminatorSnippet,
  typedVariableSnippet,
  untypedVariableSnippet,
} from "./preview-builder";

function getKeywordValue(
  context: KeywordCustomizerContextValue,
  original: string,
): string {
  return (
    context.draftCustomization.mappings.find(
      (mapping) => mapping.original === original,
    )?.custom ?? original
  );
}

function getKeywordDescription(
  context: KeywordCustomizerContextValue,
  original: string,
): string {
  return getDocumentationDescription(
    context,
    getKeywordDocumentationId(original),
  );
}

function getDocumentationDescription(
  context: KeywordCustomizerContextValue,
  id: string,
): string {
  const customDescription =
    context.draftCustomization.languageDocumentation[id]?.description?.trim();

  return customDescription || getDefaultDocumentationDescription(id);
}

export function buildIdentityStepProps(
  context: KeywordCustomizerContextValue,
): IdentityStepProps {
  return {
    values: {
      selectedPresetId: context.selectedPresetId,
      languageName: context.languageName,
      languageDescription: context.languageDescription,
      imageSearchQuery: context.languageImageQuery,
      imageSearchResults: context.languageImageResults,
      selectedImageUrl: context.languageImageUrl,
      isSearchingImages: context.isSearchingLanguageImages,
      imageSearchError: context.languageImageSearchError,
    },
    actions: {
      selectPreset: context.actions.applyPreset,
      setLanguageName: context.actions.setLanguageName,
      setLanguageDescription: context.actions.setLanguageDescription,
      setImageSearchQuery: context.actions.setImageSearchQuery,
      searchImages: context.actions.searchLanguageImages,
      selectImage: context.actions.selectLanguageImage,
    },
  };
}

export function buildTypeStepProps(
  context: KeywordCustomizerContextValue,
): TypeStepProps {
  const variableKeywords =
    context.draftCustomization.modes.typing === "untyped"
      ? (["variavel", "funcao"] as const)
      : (["int", "float", "bool", "string", "void"] as const);

  return {
    values: {
      snippet: context.preview.snippet,
      typedSnippet: typedVariableSnippet(context.draftCustomization),
      untypedSnippet: untypedVariableSnippet(context.draftCustomization),
      typingMode: context.draftCustomization.modes.typing,
      printKeyword: getKeywordValue(context, "print"),
      typingBeamKeywords: {
        variavel: getKeywordValue(context, "variavel"),
        string: getKeywordValue(context, "string"),
        float: getKeywordValue(context, "float"),
        int: getKeywordValue(context, "int"),
        bool: getKeywordValue(context, "bool"),
      },
      variableKeywords: variableKeywords.map((key) => ({
        key,
        value: getKeywordValue(context, key),
        description: getKeywordDescription(context, key),
      })),
    },
    actions: {
      syncTypingMode: (mode) => context.actions.syncMode("typing", mode),
      syncKeyword: (original, value) =>
        context.actions.syncKeyword(original, value),
      syncKeywordDescription: (original, value) =>
        context.actions.syncDocumentation(
          getKeywordDocumentationId(original),
          value,
        ),
    },
  };
}

export function buildIOStepProps(
  context: KeywordCustomizerContextValue,
): IOStepProps {
  return {
    values: {
      snippet: context.preview.snippet,
      printKeyword: getKeywordValue(context, "print"),
      printDescription: getKeywordDescription(context, "print"),
      scanKeyword: getKeywordValue(context, "scan"),
      scanDescription: getKeywordDescription(context, "scan"),
    },
    actions: {
      syncKeyword: (original, value) =>
        context.actions.syncKeyword(original, value),
      syncKeywordDescription: (original, value) =>
        context.actions.syncDocumentation(
          getKeywordDocumentationId(original),
          value,
        ),
    },
  };
}

export function buildStructureStepProps(
  context: KeywordCustomizerContextValue,
): StructureStepProps {
  const { draftCustomization } = context;

  return {
    values: {
      snippet: context.preview.snippet,
      optionalTerminatorSnippet: buildOptionalTerminatorSnippet(
        context.draftCustomization,
      ),
      requiredTerminatorSnippet: buildRequiredTerminatorSnippet(
        context.draftCustomization,
      ),
      delimiterSnippet: buildDelimiterSnippet(context.draftCustomization),
      identationSnippet: buildIdentationSnippet(context.draftCustomization),
      fixedArraySnippet: buildFixedArraySnippet(context.draftCustomization),
      dynamicArraySnippet: buildDynamicArraySnippet(context.draftCustomization),
      semicolonMode: draftCustomization.modes.semicolon,
      arrayMode: draftCustomization.modes.array,
      blockMode: draftCustomization.modes.block,
      usesCustomDelimiters:
        draftCustomization.blockDelimiters.open.trim().length > 0 ||
        draftCustomization.blockDelimiters.close.trim().length > 0,
      statementTerminator: {
        value: draftCustomization.statementTerminatorLexeme,
        description: getDocumentationDescription(
          context,
          "terminator.statement",
        ),
      },
      keywords: [],
      delimiters: {
        open: {
          value: draftCustomization.blockDelimiters.open,
          description: getDocumentationDescription(context, "delimiter.open"),
        },
        close: {
          value: draftCustomization.blockDelimiters.close,
          description: getDocumentationDescription(context, "delimiter.close"),
        },
      },
    },
    errors: {
      delimiter: context.errors.delimiterError,
      statementTerminator: context.errors.statementTerminatorError,
    },
    actions: {
      syncBlockMode: (mode) => context.actions.syncMode("block", mode),
      syncDelimiter: context.actions.syncDelimiter,
      syncDelimiterDescription: (field, value) =>
        context.actions.syncDocumentation(
          field === "open" ? "delimiter.open" : "delimiter.close",
          value,
        ),
      syncStatementTerminator: context.actions.syncStatementTerminator,
      syncStatementTerminatorDescription: (value) =>
        context.actions.syncDocumentation("terminator.statement", value),
      syncSemicolonMode: (mode) => context.actions.syncMode("semicolon", mode),
      syncArrayMode: (mode) => context.actions.syncMode("array", mode),
      syncKeyword: (original, value) =>
        context.actions.syncKeyword(original, value),
      syncKeywordDescription: (original, value) =>
        context.actions.syncDocumentation(
          getKeywordDocumentationId(original),
          value,
        ),
    },
  };
}

export function buildRulesStepProps(
  context: KeywordCustomizerContextValue,
): RulesStepProps {
  return {
    values: {
      booleanLiterals: (["true", "false"] as const).map((key) => ({
        key,
        label: `Literal ${key}`,
        value: context.draftCustomization.booleanLiteralMap[key] ?? "",
        description: getDocumentationDescription(
          context,
          getBooleanDocumentationId(key),
        ),
      })),
      operatorAliases: OPERATOR_WORD_FIELDS.map((field) => ({
        key: field.key,
        label: field.label,
        value: context.draftCustomization.operatorWordMap[field.key] ?? "",
        description: getDocumentationDescription(
          context,
          getOperatorDocumentationId(field.key),
        ),
        placeholder: field.symbol,
      })),
    },
    errors: {
      booleanLiteral: context.errors.booleanLiteralError,
      operator: context.errors.operatorError,
    },
    actions: {
      syncBooleanLiteral: context.actions.syncBooleanLiteral,
      syncOperatorAlias: context.actions.syncOperatorWord,
      syncBooleanLiteralDescription: (field, value) =>
        context.actions.syncDocumentation(
          getBooleanDocumentationId(field),
          value,
        ),
      syncOperatorAliasDescription: (field, value) =>
        context.actions.syncDocumentation(
          getOperatorDocumentationId(field),
          value,
        ),
    },
  };
}

const FLOW_FIELDS = [
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
] as const;

const TYPE_FIELDS = [
  "variavel",
  "funcao",
  "int",
  "float",
  "bool",
  "string",
  "void",
] as const;

const IO_FIELDS = ["print", "scan"] as const;

export function buildFlowStepProps(
  context: KeywordCustomizerContextValue,
): FlowStepProps {
  return {
    values: {
      snippet: context.preview.snippet,
      fields: FLOW_FIELDS.map((key) => ({
        key,
        value: getKeywordValue(context, key),
        description: getKeywordDescription(context, key),
      })),
    },
    actions: {
      syncKeyword: (original, value) =>
        context.actions.syncKeyword(original, value),
      syncKeywordDescription: (original, value) =>
        context.actions.syncDocumentation(
          getKeywordDocumentationId(original),
          value,
        ),
    },
  };
}

export function buildReviewStepProps(
  context: KeywordCustomizerContextValue,
): ReviewStepProps {
  const { modes } = context.draftCustomization;
  const statementTerminator =
    context.draftCustomization.statementTerminatorLexeme.trim() || ";";
  const blockOpen =
    context.draftCustomization.blockDelimiters.open.trim() || "{";
  const blockClose =
    context.draftCustomization.blockDelimiters.close.trim() || "}";

  const typeLexemes = TYPE_FIELDS.map((key) => getKeywordValue(context, key));
  const ioLexemes = IO_FIELDS.map((key) => getKeywordValue(context, key));
  const flowLexemes = FLOW_FIELDS.map((key) => getKeywordValue(context, key));
  const operatorLexemes = OPERATOR_WORD_FIELDS.map(
    (field) =>
      context.draftCustomization.operatorWordMap[field.key]?.trim() ||
      field.symbol,
  );
  const booleanLexemes = (["true", "false"] as const).map(
    (key) => context.draftCustomization.booleanLiteralMap[key]?.trim() || key,
  );
  const grammarModes: SelectedGrammarModes = {
    typingMode: modes.typing,
    blockMode: modes.block,
    semicolonMode: modes.semicolon,
    arrayMode: modes.array,
  };

  return {
    values: {
      preview: context.preview,
      grammarModes,
      vocabularySections: [
        {
          title: "Tipos",
          items: typeLexemes,
        },
        {
          title: "I/O",
          items: ioLexemes,
        },
        {
          title: "Estrutura",
          items: [
            `terminador: ${statementTerminator}`,
            `abrir: ${blockOpen}`,
            `fechar: ${blockClose}`,
          ],
        },
        {
          title: "Booleanos",
          items: booleanLexemes,
        },
        {
          title: "Operadores",
          items: operatorLexemes,
        },
        {
          title: "Fluxo",
          items: flowLexemes,
        },
      ],
      visitedStepIds: context.visitedStepIds,
    },
    actions: {
      selectStep: context.actions.goToWizardStep,
    },
  };
}
