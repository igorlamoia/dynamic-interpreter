import { Lexer } from "@ts-compilator-for-java/compiler/src/lexer";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import { t } from "@/i18n";
import { buildEffectiveKeywordMap } from "@/lib/keyword-map";
import {
  DEFAULT_BOOLEAN_LITERAL_MAP,
  DEFAULT_OPERATOR_WORD_MAP,
} from "@/lib/keyword-map";
import { buildLexerConfigFromCustomization } from "@/lib/keyword-customization";
import {
  applyWizardPreset,
  getWizardPresetLabel,
  type WizardPresetId,
  type WizardStepId,
} from "./wizard-model";
import {
  buildCompleteLanguageSample,
  buildLanguageCategorySample,
  type LexemeExampleCategory,
} from "@/views/ide/components/side-explorer/language-sample";

export type BuildPreviewOptions = {
  activeStepId: WizardStepId;
  presetId: WizardPresetId;
  name?: string;
  languageImageUrl?: string;
  locale?: string;
};

type PreviewToken = {
  lexeme: string;
  type: number;
};

type PreviewLexemeChange = {
  original: string;
  custom: string;
};

const NINJA_EXAMPLE_INPUT = ["Naruto"];
const NINJA_EXAMPLE_OUTPUT = ["Bem-vindo, Naturo"];

export type WizardPreview = {
  name: string;
  basedOnLabel: string;
  languageImageUrl: string;
  dna: string[];
  baselineSnippet: string;
  snippet: string;
  snippetInput?: string[];
  snippetOutput?: string[];
  tokenPreview: PreviewToken[];
  chosenLexemes: PreviewLexemeChange[];
};

function usesNinjaExample(stepId: WizardStepId): boolean {
  return stepId === "identity" || stepId === "IO";
}

function getKeyword(
  draft: StoredKeywordCustomization,
  original: string,
): string {
  return (
    draft.mappings.find((item) => item.original === original)?.custom ??
    original
  );
}

function endStatement(
  draft: StoredKeywordCustomization,
  statement: string,
): string {
  if (draft.modes.semicolon !== "required") return statement;

  const terminator = draft.statementTerminatorLexeme.trim() || ";";
  const separator = terminator === ";" ? "" : " ";

  return `${statement}${separator}${terminator}`;
}

function buildNinjaExampleSnippet(draft: StoredKeywordCustomization): string {
  return [
    endStatement(draft, `${getKeyword(draft, "scan")}(nome)`),
    endStatement(draft, `${getKeyword(draft, "print")}("Bem-vindo, ", nome)`),
  ].join("\n");
}

function getPreviewCategoryForStep(
  stepId: WizardStepId,
): LexemeExampleCategory | "review" {
  switch (stepId) {
    case "IO":
      return "entrada";
    case "types":
      return "tipos";
    case "structure":
      return "estrutura";
    case "rules":
      return "operadores";
    case "flow":
      return "fluxo";
    case "review":
      return "review";
    case "identity":
    default:
      return "entrada";
  }
}

function buildPreviewSource(
  draft: StoredKeywordCustomization,
  activeStepId: WizardStepId,
): string {
  if (usesNinjaExample(activeStepId)) {
    return buildNinjaExampleSnippet(draft);
  }

  const category = getPreviewCategoryForStep(activeStepId);

  if (category === "review") {
    return buildCompleteLanguageSample(draft);
  }

  return buildLanguageCategorySample(category, draft);
}

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
    applyWizardPreset(getDefaultCustomizationState(), "free"),
    options.activeStepId,
  );
  const snippet = buildPreviewSource(draft, options.activeStepId);
  const snippetInput = usesNinjaExample(options.activeStepId)
    ? NINJA_EXAMPLE_INPUT
    : undefined;
  const snippetOutput = usesNinjaExample(options.activeStepId)
    ? NINJA_EXAMPLE_OUTPUT
    : undefined;

  return {
    name:
      options.name?.trim() ||
      getWizardPresetLabel(options.presetId, options.locale),
    basedOnLabel: getWizardPresetLabel(options.presetId, options.locale),
    languageImageUrl: options.languageImageUrl?.trim() ?? "",
    dna: [
      t(
        options.locale,
        draft.modes.typing === "typed"
          ? "wizard.dna.typed"
          : "wizard.dna.untyped",
      ),
      draft.modes.block === "delimited"
        ? t(options.locale, "wizard.dna.delimited")
        : t(options.locale, "wizard.dna.indentation"),
      draft.modes.semicolon === "required"
        ? t(options.locale, "wizard.dna.requiredTerminator")
        : t(options.locale, "wizard.dna.optionalTerminator"),
      draft.modes.array === "fixed"
        ? t(options.locale, "wizard.dna.fixedArray")
        : t(options.locale, "wizard.dna.dynamicArray"),
    ],
    baselineSnippet,
    snippet,
    snippetInput,
    snippetOutput,
    tokenPreview: tokenizePreview(draft, snippet),
    chosenLexemes: collectPreviewLexemeChanges(draft),
  };
}
