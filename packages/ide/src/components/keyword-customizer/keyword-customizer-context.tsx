import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import {
  useKeywords,
} from "@/contexts/keyword/KeywordContext";
import type { BlockDelimiters, KeywordMapping, StoredKeywordCustomization } from "@/contexts/keyword/types";
import type {
  IDEBooleanLiteralMap,
  IDEKeywordCustomizationState,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import { consumeLanguageCreatorReturn } from "@/lib/language-creator-navigation";
import { normalizeLanguageDocumentationMap } from "@/lib/compiler-config";
import { saveSavedKeywordLanguage } from "@/lib/keyword-language-storage";
import {
  OPERATOR_WORD_FIELDS,
  validateOperatorWordMap,
} from "@/lib/operator-word-map";
import {
  validateBooleanLiteralAliases,
  validateStatementTerminatorLexeme,
} from "@/contexts/keyword/keyword-validator";
import { buildWizardPreview } from "./preview-data";
import {
  applyWizardPreset,
  WIZARD_STEPS,
  type WizardPresetId,
  type WizardStepId,
} from "./wizard-model";
import {
  resetKeywordCustomizerDraft,
  syncBooleanLiteralInDraft,
  syncDelimiterInDraft,
  syncDocumentationInDraft,
  syncKeywordInDraft,
  syncModeInDraft,
  syncOperatorWordInDraft,
  syncStatementTerminatorInDraft,
} from "./keyword-customizer-actions";
import {
  getActiveWizardStepError,
  getValidationErrorForWizardStep,
  resolveStepAfterKeywordValidationFailure,
  type KeywordCustomizerErrorState,
} from "./keyword-customizer-validation";
import type { KeywordCustomizerContextValue } from "./keyword-customizer-types";
import type { IdentityImageSearchResult } from "./steps/identity-step";

const KeywordCustomizerContext =
  createContext<KeywordCustomizerContextValue | null>(null);

function resolveNextValue<T>(value: T | ((current: T) => T), current: T): T {
  return typeof value === "function"
    ? (value as (current: T) => T)(current)
    : value;
}

export function KeywordCustomizerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const {
    customization,
    setCustomization,
    validateKeyword,
    validateBlockDelimiters,
  } = useKeywords();
  const [draftCustomization, setDraftCustomization] =
    useState<IDEKeywordCustomizationState>(customization);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [delimiterError, setDelimiterError] = useState<string | null>(null);
  const [booleanLiteralError, setBooleanLiteralError] = useState<string | null>(
    null,
  );
  const [statementTerminatorError, setStatementTerminatorError] = useState<
    string | null
  >(null);
  const [operatorError, setOperatorError] = useState<string | null>(null);
  const [activeWizardStepId, setActiveWizardStepId] =
    useState<WizardStepId>("identity");
  const [visitedWizardStepIds, setVisitedWizardStepIds] = useState<
    WizardStepId[]
  >(["identity"]);
  const [selectedPresetId, setSelectedPresetId] =
    useState<WizardPresetId>("free");
  const [languageName, setLanguageNameState] = useState("");
  const [languageDescription, setLanguageDescription] = useState("");
  const [languageImageUrl, setLanguageImageUrl] = useState("");
  const [languageImageQuery, setLanguageImageQuery] = useState("");
  const [languageImageResults, setLanguageImageResults] = useState<
    IdentityImageSearchResult[]
  >([]);
  const [isSearchingLanguageImages, setIsSearchingLanguageImages] =
    useState(false);
  const [languageImageSearchError, setLanguageImageSearchError] = useState<
    string | null
  >(null);
  const { mutateAsync: searchLanguageImagesMutation } = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(
        `/api/language-images/search?q=${encodeURIComponent(query)}`,
      );
      const payload = (await response.json()) as
        | { images?: IdentityImageSearchResult[]; error?: string }
        | undefined;

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Nao foi possivel buscar imagens agora.",
        );
      }

      return payload?.images ?? [];
    },
  });
  const wizardSessionBaseCustomization = useRef(customization);
  const shouldReturnOnExit = useRef(false);
  const form = useForm<StoredKeywordCustomization>({
    defaultValues: customization,
  });

  const syncDraftCustomization = useCallback(
    (
      value:
        | StoredKeywordCustomization
        | ((current: StoredKeywordCustomization) => StoredKeywordCustomization),
    ) => {
      setDraftCustomization((current) => {
        const next = resolveNextValue(value, current);
        form.reset(next);
        return next;
      });
    },
    [form],
  );

  useEffect(() => {
    shouldReturnOnExit.current = consumeLanguageCreatorReturn();
  }, []);

  useEffect(() => {
    wizardSessionBaseCustomization.current = customization;
    syncDraftCustomization(customization);
    setCurrentError(null);
    setDelimiterError(null);
    setBooleanLiteralError(null);
    setStatementTerminatorError(null);
    setOperatorError(null);
    setActiveWizardStepId("identity");
    setVisitedWizardStepIds(["identity"]);
    setSelectedPresetId("free");
    setLanguageNameState("");
    setLanguageDescription("");
    setLanguageImageUrl("");
    setLanguageImageQuery("");
    setLanguageImageResults([]);
    setIsSearchingLanguageImages(false);
    setLanguageImageSearchError(null);
  }, [customization, syncDraftCustomization]);

  const getOperatorValidationDelimiters = useCallback(
    (): BlockDelimiters =>
      draftCustomization.modes.block === "delimited"
        ? draftCustomization.blockDelimiters
        : { open: "", close: "" },
    [draftCustomization.blockDelimiters, draftCustomization.modes.block],
  );

  useEffect(() => {
    if (draftCustomization.modes.block === "indentation") {
      setDelimiterError(null);
      return;
    }

    setDelimiterError(
      validateBlockDelimiters(draftCustomization.blockDelimiters),
    );
  }, [
    draftCustomization.blockDelimiters,
    draftCustomization.modes.block,
    validateBlockDelimiters,
  ]);

  useEffect(() => {
    setBooleanLiteralError(
      validateBooleanLiteralAliases(
        draftCustomization.booleanLiteralMap,
        draftCustomization.mappings,
        draftCustomization.operatorWordMap,
        getOperatorValidationDelimiters(),
      ),
    );
  }, [
    draftCustomization.booleanLiteralMap,
    draftCustomization.mappings,
    draftCustomization.operatorWordMap,
    getOperatorValidationDelimiters,
  ]);

  useEffect(() => {
    setOperatorError(
      validateOperatorWordMap(
        draftCustomization.operatorWordMap,
        draftCustomization.mappings,
        getOperatorValidationDelimiters(),
      ),
    );
  }, [
    draftCustomization.operatorWordMap,
    draftCustomization.mappings,
    getOperatorValidationDelimiters,
  ]);

  useEffect(() => {
    const normalizedValue = draftCustomization.statementTerminatorLexeme.trim();
    if (!normalizedValue) {
      setStatementTerminatorError(null);
      return;
    }

    setStatementTerminatorError(
      validateStatementTerminatorLexeme(normalizedValue, {
        ...draftCustomization,
        blockDelimiters: getOperatorValidationDelimiters(),
      }),
    );
  }, [
    draftCustomization,
    draftCustomization.statementTerminatorLexeme,
    getOperatorValidationDelimiters,
  ]);

  const hasChanges = useMemo(() => {
    const currentDocumentation = normalizeLanguageDocumentationMap(
      customization.languageDocumentation,
    );
    const draftDocumentation = normalizeLanguageDocumentationMap(
      draftCustomization.languageDocumentation,
    );
    const documentationKeys = new Set([
      ...Object.keys(currentDocumentation),
      ...Object.keys(draftDocumentation),
    ]);
    const hasDocumentationChanges = Array.from(documentationKeys).some(
      (key) =>
        (draftDocumentation[key]?.description ?? "") !==
        (currentDocumentation[key]?.description ?? ""),
    );

    return (
      draftCustomization.mappings.some(
        (mapping: KeywordMapping) => mapping.original !== mapping.custom,
      ) ||
      OPERATOR_WORD_FIELDS.some(
        ({ key }) =>
          draftCustomization.operatorWordMap[key] !== customization.operatorWordMap[key],
      ) ||
      draftCustomization.booleanLiteralMap.true !==
        customization.booleanLiteralMap.true ||
      draftCustomization.booleanLiteralMap.false !==
        customization.booleanLiteralMap.false ||
      draftCustomization.statementTerminatorLexeme !==
        customization.statementTerminatorLexeme ||
      draftCustomization.blockDelimiters.open !==
        customization.blockDelimiters.open ||
      draftCustomization.blockDelimiters.close !==
        customization.blockDelimiters.close ||
      draftCustomization.modes.semicolon !== customization.modes.semicolon ||
      draftCustomization.modes.block !== customization.modes.block ||
      draftCustomization.modes.typing !== customization.modes.typing ||
      draftCustomization.modes.array !== customization.modes.array ||
      hasDocumentationChanges
    );
  }, [customization, draftCustomization]);

  const validateDraftKeyword = useCallback(
    (
      original: string,
      custom: string,
      mappingsToValidate: KeywordMapping[] = draftCustomization.mappings,
    ) => validateKeyword(original, custom, mappingsToValidate),
    [draftCustomization.mappings, validateKeyword],
  );

  const syncKeyword = useCallback(
    (original: string, value: string) => {
      const nextDraft = syncKeywordInDraft(draftCustomization, original, value);
      const nextMapping = nextDraft.mappings.find(
        (mapping) => mapping.original === original,
      );

      syncDraftCustomization(nextDraft);
      setCurrentError(
        nextMapping
          ? validateDraftKeyword(original, nextMapping.custom, nextDraft.mappings)
          : null,
      );
    },
    [draftCustomization, syncDraftCustomization, validateDraftKeyword],
  );

  const syncDocumentation = useCallback(
    (id: string, value: string) => {
      syncDraftCustomization((current) =>
        syncDocumentationInDraft(current, id, value),
      );
    },
    [syncDraftCustomization],
  );

  const syncMode = useCallback(
    <K extends keyof StoredKeywordCustomization["modes"]>(
      key: K,
      value: StoredKeywordCustomization["modes"][K],
    ) => {
      syncDraftCustomization((current) => syncModeInDraft(current, key, value));
    },
    [syncDraftCustomization],
  );

  const syncDelimiter = useCallback(
    (field: keyof BlockDelimiters, value: string) => {
      syncDraftCustomization((current) => syncDelimiterInDraft(current, field, value));
    },
    [syncDraftCustomization],
  );

  const syncBooleanLiteral = useCallback(
    (field: keyof IDEBooleanLiteralMap, value: string) => {
      syncDraftCustomization((current) =>
        syncBooleanLiteralInDraft(current, field, value),
      );
    },
    [syncDraftCustomization],
  );

  const syncOperatorWord = useCallback(
    (field: keyof IDEOperatorWordMap, value: string) => {
      syncDraftCustomization((current) =>
        syncOperatorWordInDraft(current, field, value),
      );
    },
    [syncDraftCustomization],
  );

  const syncStatementTerminator = useCallback(
    (value: string) => {
      syncDraftCustomization((current) =>
        syncStatementTerminatorInDraft(current, value),
      );
    },
    [syncDraftCustomization],
  );

  const validateWizardKeywordGroup = useCallback(
    (originals: string[]) => {
      for (const original of originals) {
        const mapping = draftCustomization.mappings.find(
          (item) => item.original === original,
        );
        if (!mapping) continue;

        const error = validateDraftKeyword(
          mapping.original,
          mapping.custom,
          draftCustomization.mappings,
        );
        if (error) {
          setCurrentError(error);
          return error;
        }
      }

      setCurrentError(null);
      return null;
    },
    [draftCustomization.mappings, validateDraftKeyword],
  );

  const visibleSteps = WIZARD_STEPS;
  const activeStepIndex = visibleSteps.findIndex(
    (step) => step.id === activeWizardStepId,
  );
  const activeStep =
    visibleSteps.find((step) => step.id === activeWizardStepId) ??
    visibleSteps[0];

  const errors: KeywordCustomizerErrorState = {
    currentError,
    delimiterError,
    statementTerminatorError,
    booleanLiteralError,
    operatorError,
  };

  const preview = useMemo(
    () =>
      buildWizardPreview(draftCustomization, {
        activeStepId: activeStep.id,
        presetId: selectedPresetId,
        languageName,
        languageImageUrl,
      }),
    [
      activeStep.id,
      draftCustomization,
      languageImageUrl,
      languageName,
      selectedPresetId,
    ],
  );

  const goToWizardStep = useCallback((stepId: WizardStepId) => {
    setVisitedWizardStepIds((current) =>
      current.includes(stepId) ? current : [...current, stepId],
    );
    setActiveWizardStepId(stepId);
  }, []);

  const goToPreviousWizardStep = useCallback(() => {
    const previousStep = visibleSteps[activeStepIndex - 1];
    if (!previousStep) return;
    setActiveWizardStepId(previousStep.id);
  }, [activeStepIndex, visibleSteps]);

  const goToNextWizardStep = useCallback(() => {
    if (activeStep.id === "IO") {
      const keywordError = validateWizardKeywordGroup(["print", "scan"]);
      if (keywordError) return;
    }

    if (activeStep.id === "types") {
      const visibleVariableKeywords =
        draftCustomization.modes.typing === "typed"
          ? ["int", "float", "bool", "string"]
          : ["variavel"];
      const keywordError = validateWizardKeywordGroup(visibleVariableKeywords);
      if (keywordError) return;
    }

    const stepError = getValidationErrorForWizardStep(activeStep.id, {
      draftCustomization,
      ...errors,
    });
    if (stepError) return;

    const nextStep = visibleSteps[activeStepIndex + 1];
    if (!nextStep) return;

    setVisitedWizardStepIds((current) =>
      current.includes(nextStep.id) ? current : [...current, nextStep.id],
    );
    setActiveWizardStepId(nextStep.id);
  }, [
    activeStep.id,
    activeStepIndex,
    draftCustomization,
    errors,
    validateWizardKeywordGroup,
    visibleSteps,
  ]);

  const applyPreset = useCallback(
    (presetId: WizardPresetId) => {
      setSelectedPresetId(presetId);
      syncDraftCustomization(
        applyWizardPreset(wizardSessionBaseCustomization.current, presetId),
      );
    },
    [syncDraftCustomization],
  );

  const setLanguageName = useCallback((value: string) => {
    setLanguageNameState(value);
    if (value.trim()) {
      setCurrentError((current) =>
        current === "Informe um nome para a linguagem." ? null : current,
      );
    }
  }, []);

  const setImageSearchQuery = useCallback((value: string) => {
    setLanguageImageQuery(value);
  }, []);

  const searchLanguageImages = useCallback(async () => {
    const trimmedQuery = languageImageQuery.trim();
    if (!trimmedQuery) {
      setLanguageImageSearchError("Digite um termo para buscar imagens.");
      setLanguageImageResults([]);
      return;
    }

    setIsSearchingLanguageImages(true);
    setLanguageImageSearchError(null);

    try {
      const images = await searchLanguageImagesMutation(trimmedQuery);
      setLanguageImageResults(images);
    } catch (error) {
      setLanguageImageResults([]);
      setLanguageImageSearchError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel buscar imagens agora.",
      );
    } finally {
      setIsSearchingLanguageImages(false);
    }
  }, [languageImageQuery, searchLanguageImagesMutation]);

  const selectLanguageImage = useCallback((imageUrl: string) => {
    setLanguageImageUrl(imageUrl);
  }, []);

  const resetDraft = useCallback(() => {
    const nextCustomization = resetKeywordCustomizerDraft();

    syncDraftCustomization(nextCustomization);
    setCustomization(nextCustomization);
    wizardSessionBaseCustomization.current = nextCustomization;
    setCurrentError(null);
    setDelimiterError(null);
    setBooleanLiteralError(null);
    setStatementTerminatorError(null);
    setOperatorError(null);
    setActiveWizardStepId("identity");
    setVisitedWizardStepIds(["identity"]);
    setSelectedPresetId("free");
    setLanguageNameState("");
    setLanguageDescription("");
    setLanguageImageUrl("");
    setLanguageImageQuery("");
    setLanguageImageResults([]);
    setIsSearchingLanguageImages(false);
    setLanguageImageSearchError(null);
  }, [setCustomization, syncDraftCustomization]);

  const exit = useCallback(() => {
    if (shouldReturnOnExit.current) {
      router.back();
      return;
    }

    void router.push("/");
  }, [router]);

  const save = useCallback(() => {
    const trimmedLanguageName = languageName.trim();
    if (!trimmedLanguageName) {
      setCurrentError("Informe um nome para a linguagem.");
      setActiveWizardStepId("identity");
      return;
    }

    for (const mapping of draftCustomization.mappings) {
      const error = validateDraftKeyword(mapping.original, mapping.custom);
      if (error) {
        setCurrentError(error);
        setActiveWizardStepId(
          resolveStepAfterKeywordValidationFailure(mapping.original),
        );
        return;
      }
    }

    if (draftCustomization.modes.block === "delimited") {
      const blockError = validateBlockDelimiters(
        draftCustomization.blockDelimiters,
      );
      if (blockError) {
        setDelimiterError(blockError);
        setActiveWizardStepId("structure");
        return;
      }
    } else {
      setDelimiterError(null);
    }

    const nextOperatorError = validateOperatorWordMap(
      draftCustomization.operatorWordMap,
      draftCustomization.mappings,
      getOperatorValidationDelimiters(),
    );
    if (nextOperatorError) {
      setOperatorError(nextOperatorError);
      setActiveWizardStepId("rules");
      return;
    }

    const nextBooleanLiteralError = validateBooleanLiteralAliases(
      draftCustomization.booleanLiteralMap,
      draftCustomization.mappings,
      draftCustomization.operatorWordMap,
      getOperatorValidationDelimiters(),
    );
    if (nextBooleanLiteralError) {
      setBooleanLiteralError(nextBooleanLiteralError);
      setActiveWizardStepId("rules");
      return;
    }

    const normalizedStatementTerminator =
      draftCustomization.statementTerminatorLexeme.trim();
    if (normalizedStatementTerminator) {
      const nextStatementTerminatorError = validateStatementTerminatorLexeme(
        normalizedStatementTerminator,
        {
          ...draftCustomization,
          blockDelimiters: getOperatorValidationDelimiters(),
        },
      );
      if (nextStatementTerminatorError) {
        setStatementTerminatorError(nextStatementTerminatorError);
        setActiveWizardStepId("structure");
        return;
      }
    }

    const nextCustomization: IDEKeywordCustomizationState = {
      ...draftCustomization,
      booleanLiteralMap: {
        true: draftCustomization.booleanLiteralMap.true?.trim() ?? "",
        false: draftCustomization.booleanLiteralMap.false?.trim() ?? "",
      },
      statementTerminatorLexeme: normalizedStatementTerminator,
      blockDelimiters: {
        open: draftCustomization.blockDelimiters.open.trim(),
        close: draftCustomization.blockDelimiters.close.trim(),
      },
      languageDocumentation: normalizeLanguageDocumentationMap(
        draftCustomization.languageDocumentation,
      ),
      modes: {
        semicolon: draftCustomization.modes.semicolon,
        block: draftCustomization.modes.block,
        typing: draftCustomization.modes.typing,
        array: draftCustomization.modes.array,
      },
    };

    setDraftCustomization(nextCustomization);
    saveSavedKeywordLanguage({
      name: trimmedLanguageName,
      slug: trimmedLanguageName,
      description: languageDescription.trim(),
      imageUrl: languageImageUrl,
      imageQuery: languageImageQuery.trim(),
      presetId: selectedPresetId,
      customization: nextCustomization,
    });
    setCustomization(nextCustomization);
    setCurrentError(null);
    setDelimiterError(null);
    setBooleanLiteralError(null);
    setStatementTerminatorError(null);
    setOperatorError(null);
    exit();
  }, [
    draftCustomization,
    exit,
    getOperatorValidationDelimiters,
    languageImageQuery,
    languageImageUrl,
    languageDescription,
    languageName,
    selectedPresetId,
    setCustomization,
    validateBlockDelimiters,
    validateDraftKeyword,
  ]);

  const value: KeywordCustomizerContextValue = {
    form,
    draftCustomization,
    preview,
    errors: {
      ...errors,
      currentError: getActiveWizardStepError(activeStep.id, errors) ?? currentError,
    },
    activeStep,
    activeStepIndex,
    visibleSteps,
    visitedStepIds: visitedWizardStepIds,
    selectedPresetId,
    languageName,
    languageDescription,
    languageImageUrl,
    languageImageQuery,
    languageImageResults,
    isSearchingLanguageImages,
    languageImageSearchError,
    hasChanges,
    actions: {
      syncKeyword,
      syncDocumentation,
      syncMode,
      syncDelimiter,
      syncBooleanLiteral,
      syncOperatorWord,
      syncStatementTerminator,
      goToWizardStep,
      goToNextWizardStep,
      goToPreviousWizardStep,
      applyPreset,
      setLanguageName,
      setLanguageDescription,
      setImageSearchQuery,
      searchLanguageImages,
      selectLanguageImage,
      resetDraft,
      save,
      exit,
    },
  };

  return (
    <KeywordCustomizerContext.Provider value={value}>
      {children}
    </KeywordCustomizerContext.Provider>
  );
}

export function useKeywordCustomizer() {
  const context = useContext(KeywordCustomizerContext);
  if (!context) {
    throw new Error(
      "useKeywordCustomizer must be used within KeywordCustomizerProvider",
    );
  }

  return context;
}
