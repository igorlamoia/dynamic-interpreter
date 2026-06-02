import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveLanguage } from "@/hooks/useLanguages";
import { useEditor } from "@/hooks/useEditor";
import { updateJavaMMKeywords } from "@/utils/compiler/editor/editor-language";
import { normalizeLanguageDocumentationMap } from "@/lib/compiler-config";
import { buildLexerConfigFromCustomization } from "@/lib/keyword-customization";
import { loadActiveSavedKeywordLanguage } from "@/lib/keyword-language-storage";
import type {
  IDEBooleanLiteralMap,
  IDECompilerConfigPayload,
  IDEKeywordCustomizationModes,
  IDELanguageDocumentationMap,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import {
  DEFAULT_BOOLEAN_LITERAL_MAP,
  DEFAULT_OPERATOR_WORD_MAP,
  sanitizeBooleanLiteralMap,
  sanitizeOperatorWordMap,
} from "@/lib/keyword-map";
import {
  validateCustomKeyword,
  validateBlockDelimiters,
} from "./keyword-validator";
import { CUSTOMIZABLE_KEYWORDS, ORIGINAL_KEYWORDS } from ".";
import {
  KeywordContextType,
  KeywordMapping,
  BlockDelimiters,
  StoredKeywordCustomization,
} from "./types";

const KeywordContext = createContext<KeywordContextType>(
  {} as KeywordContextType,
);

export function useKeywords() {
  return useContext(KeywordContext);
}

const STORAGE_KEY = "keyword-customization";
const LEGACY_MAPPINGS_STORAGE_KEY = "keyword-mappings";

export function getDefaultBooleanLiteralMap(): IDEBooleanLiteralMap {
  return { ...DEFAULT_BOOLEAN_LITERAL_MAP };
}

export function getDefaultKeywordMappings(): KeywordMapping[] {
  return ORIGINAL_KEYWORDS.map((word) => ({
    original: word,
    custom: word,
    tokenId: CUSTOMIZABLE_KEYWORDS[word],
  }));
}

export function migrateStoredMappings(
  parsed: KeywordMapping[],
): KeywordMapping[] | null {
  const defaultsByOriginal = new Map(
    getDefaultKeywordMappings().map((mapping) => [mapping.original, mapping]),
  );
  const nextMappings: KeywordMapping[] = [];

  for (const original of ORIGINAL_KEYWORDS) {
    const storedMapping = parsed.find(
      (mapping) => mapping.original === original,
    );
    const defaultMapping = defaultsByOriginal.get(original);
    if (!defaultMapping) {
      return null;
    }

    if (!storedMapping) {
      nextMappings.push(defaultMapping);
      continue;
    }

    if (
      typeof storedMapping.custom !== "string" ||
      typeof storedMapping.original !== "string"
    ) {
      return null;
    }

    nextMappings.push({
      original: defaultMapping.original,
      custom: storedMapping.custom,
      tokenId: defaultMapping.tokenId,
    });
  }

  return nextMappings;
}

function getDefaultBlockDelimiters(): BlockDelimiters {
  return {
    open: "",
    close: "",
  };
}

function getDefaultOperatorWordMap(): IDEOperatorWordMap {
  return { ...DEFAULT_OPERATOR_WORD_MAP };
}

function getDefaultStatementTerminatorLexeme(): string {
  return "";
}

function getDefaultLanguageDocumentationMap(): IDELanguageDocumentationMap {
  return {};
}

function getDefaultModes(): IDEKeywordCustomizationModes {
  return {
    semicolon: "optional-eol",
    block: "delimited",
    typing: "typed",
    array: "fixed",
  };
}

export function getDefaultCustomizationState(): StoredKeywordCustomization {
  return {
    mappings: getDefaultKeywordMappings(),
    operatorWordMap: getDefaultOperatorWordMap(),
    booleanLiteralMap: getDefaultBooleanLiteralMap(),
    statementTerminatorLexeme: getDefaultStatementTerminatorLexeme(),
    blockDelimiters: getDefaultBlockDelimiters(),
    modes: getDefaultModes(),
    languageDocumentation: getDefaultLanguageDocumentationMap(),
  };
}

type LegacyCustomizationPayload = Partial<StoredKeywordCustomization> & {
  semicolonMode?: IDEKeywordCustomizationModes["semicolon"];
  blockMode?: IDEKeywordCustomizationModes["block"];
  typingMode?: IDEKeywordCustomizationModes["typing"];
  arrayMode?: IDEKeywordCustomizationModes["array"];
  ui?: unknown;
};

function normalizeModes(
  parsed: LegacyCustomizationPayload,
  defaults: StoredKeywordCustomization,
): IDEKeywordCustomizationModes {
  return {
    semicolon:
      parsed.modes?.semicolon ??
      parsed.semicolonMode ??
      defaults.modes.semicolon,
    block: parsed.modes?.block ?? parsed.blockMode ?? defaults.modes.block,
    typing: parsed.modes?.typing ?? parsed.typingMode ?? defaults.modes.typing,
    array: parsed.modes?.array ?? parsed.arrayMode ?? defaults.modes.array,
  };
}

function normalizeCustomization(
  parsed: LegacyCustomizationPayload,
  defaults: StoredKeywordCustomization,
): StoredKeywordCustomization | null {
  const mappings = Array.isArray(parsed.mappings) ? parsed.mappings : [];
  const migratedMappings = migrateStoredMappings(mappings);

  if (!migratedMappings) return null;

  const delimiters = parsed.blockDelimiters;

  return {
    mappings: migratedMappings,
    operatorWordMap: sanitizeOperatorWordMap(parsed.operatorWordMap),
    booleanLiteralMap: sanitizeBooleanLiteralMap(parsed.booleanLiteralMap),
    statementTerminatorLexeme:
      typeof parsed.statementTerminatorLexeme === "string"
        ? parsed.statementTerminatorLexeme.trim()
        : defaults.statementTerminatorLexeme,
    blockDelimiters:
      delimiters &&
      typeof delimiters.open === "string" &&
      typeof delimiters.close === "string"
        ? delimiters
        : defaults.blockDelimiters,
    modes: normalizeModes(parsed, defaults),
    languageDocumentation: normalizeLanguageDocumentationMap(
      parsed.languageDocumentation,
    ),
  };
}

function loadLegacyKeywordMappings(): KeywordMapping[] | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(LEGACY_MAPPINGS_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return null;

    return migrateStoredMappings(parsed as KeywordMapping[]);
  } catch {
    return null;
  }
}

function loadCustomization(): StoredKeywordCustomization {
  const defaults = getDefaultCustomizationState();
  if (typeof window === "undefined") return defaults;

  try {
    const activeSavedLanguage = loadActiveSavedKeywordLanguage();
    if (activeSavedLanguage) {
      return activeSavedLanguage.customization;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as LegacyCustomizationPayload;
      const normalized = normalizeCustomization(parsed, defaults);
      if (normalized) return normalized;
    }

    const legacyMappings = loadLegacyKeywordMappings();
    if (legacyMappings) {
      return {
        ...defaults,
        mappings: legacyMappings,
      };
    }

    return defaults;
  } catch {
    return defaults;
  }
}

function persistCustomization(customization: StoredKeywordCustomization) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
}

function resolveNextValue<T>(value: T | ((current: T) => T), current: T): T {
  return typeof value === "function"
    ? (value as (current: T) => T)(current)
    : value;
}

export function KeywordProvider({ children }: { children: ReactNode }) {
  const [customization, setCustomizationState] =
    useState<StoredKeywordCustomization>(getDefaultCustomizationState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeLanguageId, setActiveLanguageId] = useState<number | null>(null);
  // Snapshot of the user's "own" customization, captured before a LOCKED
  // exercise overlay is applied. Restored when the overlay is dismissed.
  const overlaySavedRef = useRef<StoredKeywordCustomization | null>(null);
  const editor = useEditor();
  const monacoRef = editor?.monacoRef;
  const retokenize = editor?.retokenize;

  const auth = useAuth();
  const isLoggedIn = auth?.isAuthenticated ?? false;
  const activeLanguageQuery = useActiveLanguage(isLoggedIn);
  const activeLanguageData = activeLanguageQuery.data;

  // Carregar do localStorage após montar no client
  useEffect(() => {
    const loadedCustomization = loadCustomization();
    setCustomizationState(loadedCustomization);
    persistCustomization(loadedCustomization);
    setIsHydrated(true);
  }, []);

  // Hidrata a partir da linguagem ativa do backend quando logado.
  // O rascunho do localStorage segue sendo persistido — a "fonte da verdade"
  // do usuário logado é a linguagem ativa do backend.
  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn) {
      setActiveLanguageId(null);
      return;
    }
    if (activeLanguageData) {
      setActiveLanguageId(activeLanguageData.id);
      setCustomizationState(activeLanguageData.customization);
    } else if (activeLanguageData === null) {
      setActiveLanguageId(null);
    }
  }, [isHydrated, isLoggedIn, activeLanguageData]);

  // Persistir no localStorage quando mudar
  useEffect(() => {
    if (!isHydrated) return;
    persistCustomization(customization);
  }, [customization, isHydrated]);

  // Atualizar syntax highlighting do Monaco
  const updateMonacoHighlighting = useCallback(
    (config?: StoredKeywordCustomization) => {
      const configToUse = config ?? customization;
      if (monacoRef?.current) {
        updateJavaMMKeywords(monacoRef.current, configToUse.mappings, {
          blockMode: configToUse.modes.block,
          blockDelimiters: configToUse.blockDelimiters,
          operatorWordMap: configToUse.operatorWordMap,
          booleanLiteralMap: configToUse.booleanLiteralMap,
          languageDocumentation: configToUse.languageDocumentation,
          statementTerminatorLexeme: configToUse.statementTerminatorLexeme,
          typingMode: configToUse.modes.typing,
          arrayMode: configToUse.modes.array,
        });
        retokenize?.();
      }
    },
    [monacoRef, retokenize, customization],
  );

  // Atualizar Monaco quando a página é carregada
  useEffect(() => {
    if (isHydrated) updateMonacoHighlighting();
  }, [isHydrated, updateMonacoHighlighting]);

  const validateKeyword = useCallback(
    (
      original: string,
      custom: string,
      mappingsToValidate: KeywordMapping[] = customization.mappings,
    ): string | null => {
      return validateCustomKeyword(
        original,
        custom,
        mappingsToValidate,
        customization.booleanLiteralMap,
      );
    },
    [customization.booleanLiteralMap, customization.mappings],
  );

  const setCustomization = useCallback(
    (
      value:
        | StoredKeywordCustomization
        | ((current: StoredKeywordCustomization) => StoredKeywordCustomization),
    ) => {
      setCustomizationState((current) => resolveNextValue(value, current));
    },
    [],
  );

  const setModes = useCallback(
    (
      value:
        | IDEKeywordCustomizationModes
        | ((
            current: IDEKeywordCustomizationModes,
          ) => IDEKeywordCustomizationModes),
    ) => {
      setCustomizationState((current) => ({
        ...current,
        modes: resolveNextValue(value, current.modes),
      }));
    },
    [],
  );

  const setMappings = useCallback(
    (
      value:
        | KeywordMapping[]
        | ((current: KeywordMapping[]) => KeywordMapping[]),
    ) => {
      setCustomizationState((current) => ({
        ...current,
        mappings: resolveNextValue(value, current.mappings),
      }));
    },
    [],
  );

  const updateKeyword = useCallback(
    (original: string, custom: string) => {
      setMappings((prev: KeywordMapping[]) =>
        prev.map((m: KeywordMapping) =>
          m.original === original ? { ...m, custom } : m,
        ),
      );
    },
    [setMappings],
  );

  const resetCustomization = useCallback(() => {
    setCustomizationState(getDefaultCustomizationState());
  }, []);

  const applyExternalCustomization = useCallback(
    (next: StoredKeywordCustomization) => {
      // Save the current customization as the "user own" baseline only once
      // per overlay session (avoids clobbering it on re-applies).
      if (overlaySavedRef.current === null) {
        overlaySavedRef.current = customization;
      }
      setCustomizationState(next);
    },
    [customization],
  );

  const restoreActiveCustomization = useCallback(() => {
    const saved = overlaySavedRef.current;
    overlaySavedRef.current = null;
    if (saved) {
      setCustomizationState(saved);
    } else if (activeLanguageData) {
      setCustomizationState(activeLanguageData.customization);
    }
  }, [activeLanguageData]);

  const buildKeywordMap = useCallback((): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const m of customization.mappings) {
      map[m.custom] = m.tokenId;
    }
    return map;
  }, [customization.mappings]);

  const buildLexerConfig = useCallback((): IDECompilerConfigPayload => {
    return buildLexerConfigFromCustomization(customization);
  }, [customization]);

  const contextValue = useMemo(
    () => ({
      customization,
      activeLanguageId,
      applyExternalCustomization,
      restoreActiveCustomization,
      setCustomization,
      setModes,
      setMappings,
      updateKeyword,
      resetCustomization,
      buildKeywordMap,
      validateKeyword,
      validateBlockDelimiters,
      buildLexerConfig,
    }),
    [
      customization,
      activeLanguageId,
      applyExternalCustomization,
      restoreActiveCustomization,
      setCustomization,
      setModes,
      setMappings,
      updateKeyword,
      resetCustomization,
      buildKeywordMap,
      validateKeyword,
      buildLexerConfig,
    ],
  );

  return (
    <KeywordContext.Provider value={contextValue}>
      {children}
    </KeywordContext.Provider>
  );
}
