import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useKeywords } from "@/contexts/keyword/KeywordContext";
import {
  useActiveLanguage,
  useLanguagesList,
  useSetActiveLanguage,
} from "@/hooks/useLanguages";
import { languagesApi } from "@/lib/languages-api";
import {
  ACTIVE_KEYWORD_CUSTOMIZATION_STORAGE_KEY,
  ACTIVE_SAVED_KEYWORD_LANGUAGE_STORAGE_KEY,
  listSavedKeywordLanguages,
  loadActiveSavedKeywordLanguage,
  loadSavedKeywordLanguage,
  setActiveSavedKeywordLanguage,
} from "@/lib/keyword-language-storage";
import {
  DEFAULT_LANGUAGES,
  PORTUGOL_LANGUAGE_KEY,
  getDefaultLanguage,
  isDefaultLanguageKey,
} from "@/lib/default-languages";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";

export type LanguageChoice = {
  /** id numérico como string no backend, slug no localStorage. */
  key: string;
  name: string;
  imageUrl: string;
};

/** A linguagem ativa por inteiro — o painel do IDE precisa de mais que o resumo. */
export type ActiveLanguageDetail = {
  key: string;
  name: string;
  description: string;
  imageUrl: string;
  customization: StoredKeywordCustomization;
};

function getBrowserLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage ?? null;
}

/**
 * Fonte única das linguagens oferecidas no IDE.
 *
 * Logado, a verdade é o backend — o mesmo acervo que a página /languages
 * mostra. Deslogado, cai no localStorage, que é onde o wizard grava sem
 * sessão. Sem isso o seletor do IDE e a /languages mostrariam listas
 * diferentes para o mesmo usuário no mesmo app.
 *
 * `activeLanguage` vem separado da lista porque `LanguageSummary` não carrega
 * `customization`, e o painel do IDE precisa dela para derivar o "DNA" da
 * linguagem. No localStorage isso vinha de graça; no backend exige o detalhe.
 */
export function useLanguageChoices() {
  const { isAuthenticated } = useAuth();
  const { externalLanguageOverlay, setCustomization } = useKeywords();
  const listQuery = useLanguagesList(isAuthenticated);
  const activeQuery = useActiveLanguage(isAuthenticated);
  const setActiveMut = useSetActiveLanguage();

  const [localChoices, setLocalChoices] = useState<LanguageChoice[]>([]);
  const [localActive, setLocalActive] = useState<ActiveLanguageDetail | null>(
    null,
  );
  const [activeDefaultKey, setActiveDefaultKey] = useState<string | null>(null);

  const defaultChoices = useMemo<LanguageChoice[]>(
    () =>
      DEFAULT_LANGUAGES.map((language) => ({
        key: language.key,
        name: language.name,
        imageUrl: language.imageUrl,
      })),
    [],
  );

  useEffect(() => {
    if (isAuthenticated) return;

    setLocalChoices(
      listSavedKeywordLanguages().map((entry) => ({
        key: entry.slug,
        name: entry.name,
        imageUrl: entry.imageUrl,
      })),
    );

    const saved = loadActiveSavedKeywordLanguage();
    const activeStorageKey = getBrowserLocalStorage()?.getItem(
      ACTIVE_SAVED_KEYWORD_LANGUAGE_STORAGE_KEY,
    );

    if (!saved && activeStorageKey && isDefaultLanguageKey(activeStorageKey)) {
      setActiveDefaultKey(activeStorageKey);
    } else if (!saved) {
      setActiveDefaultKey(PORTUGOL_LANGUAGE_KEY);
    } else {
      setActiveDefaultKey(null);
    }

    setLocalActive(
      saved
        ? {
            key: saved.slug,
            name: saved.name,
            description: saved.description ?? "",
            imageUrl: saved.imageUrl,
            customization: saved.customization,
          }
        : null,
    );
  }, [isAuthenticated]);

  const choices = useMemo<LanguageChoice[]>(() => {
    if (externalLanguageOverlay) {
      return [
        {
          key: String(externalLanguageOverlay.id),
          name: externalLanguageOverlay.name,
          imageUrl: externalLanguageOverlay.imageUrl,
        },
      ];
    }

    if (!isAuthenticated) return [...defaultChoices, ...localChoices];

    return [
      ...defaultChoices,
      ...(listQuery.data ?? []).map((language) => ({
        key: String(language.id),
        name: language.name,
        imageUrl: language.imageUrl ?? "",
      })),
    ];
  }, [
    defaultChoices,
    externalLanguageOverlay,
    isAuthenticated,
    listQuery.data,
    localChoices,
  ]);

  const activeLanguage = useMemo<ActiveLanguageDetail | null>(() => {
    if (externalLanguageOverlay) {
      return {
        key: String(externalLanguageOverlay.id),
        name: externalLanguageOverlay.name,
        description: externalLanguageOverlay.description,
        imageUrl: externalLanguageOverlay.imageUrl,
        customization: externalLanguageOverlay.customization,
      };
    }

    if (activeDefaultKey) {
      const language = getDefaultLanguage(activeDefaultKey);
      return {
        key: language.key,
        name: language.name,
        description: language.description,
        imageUrl: language.imageUrl,
        customization: language.customization,
      };
    }

    if (!isAuthenticated) return localActive;

    const language = activeQuery.data;
    if (!language) {
      const fallbackLanguage = getDefaultLanguage(PORTUGOL_LANGUAGE_KEY);
      return {
        key: fallbackLanguage.key,
        name: fallbackLanguage.name,
        description: fallbackLanguage.description,
        imageUrl: fallbackLanguage.imageUrl,
        customization: fallbackLanguage.customization,
      };
    }

    return {
      key: String(language.id),
      name: language.name,
      description: language.description ?? "",
      imageUrl: language.imageUrl ?? "",
      customization: language.customization,
    };
  }, [
    activeDefaultKey,
    activeQuery.data,
    externalLanguageOverlay,
    isAuthenticated,
    localActive,
  ]);

  const activeKey = activeLanguage?.key ?? "";
  const isSelectionLocked = externalLanguageOverlay !== null;

  const selectLanguage = useCallback(
    async (key: string) => {
      if (externalLanguageOverlay) return;

      if (isDefaultLanguageKey(key)) {
        const language = getDefaultLanguage(key);
        const storage = getBrowserLocalStorage();
        if (storage) {
          storage.setItem(ACTIVE_SAVED_KEYWORD_LANGUAGE_STORAGE_KEY, key);
          storage.setItem(
            ACTIVE_KEYWORD_CUSTOMIZATION_STORAGE_KEY,
            JSON.stringify(language.customization),
          );
        }
        setActiveDefaultKey(key);
        setLocalActive(null);
        setCustomization(language.customization);
        return;
      }

      if (isAuthenticated) {
        const languageId = Number.parseInt(key, 10);
        if (!Number.isInteger(languageId)) return;

        // O detalhe traz a `customization`, que o resumo da lista não tem.
        const language = await languagesApi.get(languageId);
        await setActiveMut.mutateAsync(languageId);
        setActiveDefaultKey(null);
        setCustomization(language.customization);
        return;
      }

      const language = loadSavedKeywordLanguage(key);
      if (!language) return;

      setActiveSavedKeywordLanguage(key);
      setActiveDefaultKey(null);
      setCustomization(language.customization);
      setLocalActive({
        key: language.slug,
        name: language.name,
        description: language.description ?? "",
        imageUrl: language.imageUrl,
        customization: language.customization,
      });
    },
    [externalLanguageOverlay, isAuthenticated, setActiveMut, setCustomization],
  );

  return {
    choices,
    activeKey,
    activeLanguage,
    isSelectionLocked,
    selectLanguage,
  };
}
