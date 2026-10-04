import {
  getDefaultKeywordMappings,
  normalizeStoredKeywordCustomization,
} from "@/contexts/keyword/KeywordContext";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { IDEPartialCompilerConfigPayload } from "@/entities/compiler-config";
import { getDefaultLanguageCustomization } from "@/lib/default-languages";
import type { SubmissionLanguageSnapshot } from "@/types/submissions";

function hasStoredCustomizationShape(
  snapshot:
    | SubmissionLanguageSnapshot
    | Record<string, unknown>
    | null
    | undefined,
): snapshot is StoredKeywordCustomization {
  return Boolean(
    snapshot &&
      Array.isArray((snapshot as { mappings?: unknown }).mappings),
  );
}

export function submissionSnapshotToCustomization(
  snapshot: SubmissionLanguageSnapshot | null | undefined,
): StoredKeywordCustomization {
  if (hasStoredCustomizationShape(snapshot)) {
    return normalizeStoredKeywordCustomization(snapshot);
  }

  const defaults = getDefaultLanguageCustomization();
  const keywordMap = snapshot?.keywordMap ?? {};
  const customByTokenId = new Map<number, string>();

  for (const [custom, tokenId] of Object.entries(keywordMap)) {
    const numericTokenId = Number(tokenId);
    if (Number.isFinite(numericTokenId) && custom.trim().length > 0) {
      customByTokenId.set(numericTokenId, custom);
    }
  }

  const defaultMappings = getDefaultKeywordMappings();

  return normalizeStoredKeywordCustomization({
    mappings: defaultMappings.map((mapping) => ({
      ...mapping,
      custom: customByTokenId.get(mapping.tokenId) ?? mapping.custom,
    })),
    operatorWordMap: snapshot?.operatorWordMap ?? defaults.operatorWordMap,
    booleanLiteralMap: snapshot?.booleanLiteralMap ?? defaults.booleanLiteralMap,
    statementTerminatorLexeme:
      snapshot?.statementTerminatorLexeme ??
      (snapshot?.grammar?.semicolonMode === "required"
        ? ";"
        : defaults.statementTerminatorLexeme),
    blockDelimiters:
      snapshot?.blockDelimiters ?? defaults.blockDelimiters,
    modes: {
      semicolon:
        snapshot?.grammar?.semicolonMode ?? defaults.modes.semicolon,
      block: snapshot?.grammar?.blockMode ?? defaults.modes.block,
      typing: snapshot?.grammar?.typingMode ?? defaults.modes.typing,
      array: snapshot?.grammar?.arrayMode ?? defaults.modes.array,
    },
    languageDocumentation:
      snapshot?.languageDocumentation ?? defaults.languageDocumentation,
  });
}

export function submissionSnapshotToCompilerPayload(
  snapshot: SubmissionLanguageSnapshot | null | undefined,
): IDEPartialCompilerConfigPayload {
  if (!snapshot) return {};

  if (hasStoredCustomizationShape(snapshot)) {
    const customization = submissionSnapshotToCustomization(snapshot);
    const keywordMap = customization.mappings.reduce<Record<string, number>>(
      (acc, mapping) => {
        acc[mapping.custom] = mapping.tokenId;
        return acc;
      },
      {},
    );

    return {
      keywordMap,
      operatorWordMap: customization.operatorWordMap,
      booleanLiteralMap: customization.booleanLiteralMap,
      statementTerminatorLexeme: customization.statementTerminatorLexeme,
      blockDelimiters: customization.blockDelimiters,
      indentationBlock: customization.modes.block === "indentation",
      grammar: {
        semicolonMode: customization.modes.semicolon,
        blockMode: customization.modes.block,
        typingMode: customization.modes.typing,
        arrayMode: customization.modes.array,
      },
      languageDocumentation: customization.languageDocumentation,
    };
  }

  return {
    keywordMap: snapshot.keywordMap,
    operatorWordMap: snapshot.operatorWordMap,
    booleanLiteralMap: snapshot.booleanLiteralMap,
    statementTerminatorLexeme: snapshot.statementTerminatorLexeme,
    blockDelimiters: snapshot.blockDelimiters ?? undefined,
    indentationBlock: snapshot.indentationBlock,
    grammar: snapshot.grammar,
    languageDocumentation: snapshot.languageDocumentation,
  };
}
