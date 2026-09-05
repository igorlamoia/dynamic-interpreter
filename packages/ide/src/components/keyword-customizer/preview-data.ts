import { Lexer } from "@ts-compilator-for-java/compiler/src/lexer";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import { buildEffectiveKeywordMap } from "@/lib/keyword-map";
import {
  DEFAULT_BOOLEAN_LITERAL_MAP,
  DEFAULT_OPERATOR_WORD_MAP,
} from "@/lib/keyword-map";
import { buildLexerConfigFromCustomization } from "@/lib/keyword-customization";
import { buildPreviewSource } from "./preview-builder";
import {
  WIZARD_PRESET_LABELS,
  type WizardPresetId,
  type WizardStepId,
} from "./wizard-model";

export type BuildPreviewOptions = {
  activeStepId: WizardStepId;
  presetId: WizardPresetId;
  name?: string;
  languageImageUrl?: string;
};

type PreviewToken = {
  lexeme: string;
  type: number;
};

type PreviewLexemeChange = {
  original: string;
  custom: string;
};

export type WizardPreview = {
  name: string;
  basedOnLabel: string;
  languageImageUrl: string;
  dna: string[];
  baselineSnippet: string;
  snippet: string;
  tokenPreview: PreviewToken[];
  chosenLexemes: PreviewLexemeChange[];
};

function tokenizePreview(
  draft: StoredKeywordCustomization,
  snippet: string,
): PreviewToken[] {
  const config = buildLexerConfigFromCustomization(draft);

  try {
    return new Lexer(snippet, {
      customKeywords: buildEffectiveKeywordMap(config.keywordMap),
      operatorWordMap: config.operatorWordMap,
      booleanLiteralMap: config.booleanLiteralMap,
      statementTerminatorLexeme: config.statementTerminatorLexeme,
      blockDelimiters: config.blockDelimiters,
      indentationBlock: config.indentationBlock,
    })
      .scanTokens()
      .slice(0, 8)
      .map((token) => ({
        lexeme: token.lexeme,
        type: token.type,
      }));
  } catch {
    return [];
  }
}

function collectPreviewLexemeChanges(
  draft: StoredKeywordCustomization,
): PreviewLexemeChange[] {
  const hiddenKeywordChanges =
    draft.modes.typing === "untyped"
      ? new Set(["int", "float", "bool", "string", "void"])
      : new Set<string>();

  const keywordChanges = draft.mappings
    .filter(
      (item) =>
        item.custom !== item.original &&
        !hiddenKeywordChanges.has(item.original),
    )
    .map((item) => ({ original: item.original, custom: item.custom }));

  const operatorWordChanges = (
    Object.keys(DEFAULT_OPERATOR_WORD_MAP) as Array<
      keyof typeof DEFAULT_OPERATOR_WORD_MAP
    >
  ).flatMap((key) => {
    const original = DEFAULT_OPERATOR_WORD_MAP[key]?.trim();
    const custom = draft.operatorWordMap[key]?.trim();

    if (!original || !custom || custom === original) {
      return [];
    }

    return [{ original, custom }];
  });

  const booleanLiteralChanges = (
    Object.keys(DEFAULT_BOOLEAN_LITERAL_MAP) as Array<
      keyof typeof DEFAULT_BOOLEAN_LITERAL_MAP
    >
  ).flatMap((key) => {
    const original = DEFAULT_BOOLEAN_LITERAL_MAP[key]?.trim();
    const custom = draft.booleanLiteralMap[key]?.trim();

    if (!original || !custom || custom === original) {
      return [];
    }

    return [{ original, custom }];
  });

  const statementTerminator = draft.statementTerminatorLexeme.trim();
  const statementTerminatorChange =
    statementTerminator && statementTerminator !== ";"
      ? [{ original: ";", custom: statementTerminator }]
      : [];

  const blockOpen = draft.blockDelimiters.open.trim();
  const blockClose = draft.blockDelimiters.close.trim();
  const blockDelimiterChanges: PreviewLexemeChange[] = [];

  if (blockOpen && blockOpen !== "{") {
    blockDelimiterChanges.push({ original: "{", custom: blockOpen });
  }

  if (blockClose && blockClose !== "}") {
    blockDelimiterChanges.push({ original: "}", custom: blockClose });
  }

  return [
    ...keywordChanges,
    ...operatorWordChanges,
    ...booleanLiteralChanges,
    ...statementTerminatorChange,
    ...blockDelimiterChanges,
  ];
}

export function buildWizardPreview(
  draft: StoredKeywordCustomization,
  options: BuildPreviewOptions,
): WizardPreview {
  const baselineSnippet = buildPreviewSource(
    getDefaultCustomizationState(),
    options.activeStepId,
  );
  const snippet = buildPreviewSource(draft, options.activeStepId);

  return {
    name:
      options.name?.trim() || WIZARD_PRESET_LABELS[options.presetId],
    basedOnLabel: WIZARD_PRESET_LABELS[options.presetId],
    languageImageUrl: options.languageImageUrl?.trim() ?? "",
    dna: [
      draft.modes.typing === "typed" ? "tipada" : "nao tipada",
      draft.modes.block === "delimited"
        ? "blocos com delimitadores"
        : "blocos por indentacao",
      draft.modes.semicolon === "required"
        ? "terminador obrigatorio"
        : "fim de linha opcional",
      draft.modes.array === "fixed" ? "vetores fixos" : "vetores dinâmicos",
    ],
    baselineSnippet,
    snippet,
    tokenPreview: tokenizePreview(draft, snippet),
    chosenLexemes: collectPreviewLexemeChanges(draft),
  };
}
