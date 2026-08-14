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
  listSavedKeywordLanguages,
  loadActiveSavedKeywordLanguage,
  loadSavedKeywordLanguage,
  setActiveSavedKeywordLanguage,
} from "@/lib/keyword-language-storage";
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
  const { setCustomization } = useKeywords();
  const listQuery = useLanguagesList(isAuthenticated);
  const activeQuery = useActiveLanguage(isAuthenticated);
  const setActiveMut = useSetActiveLanguage();

  const [localChoices, setLocalChoices] = useState<LanguageChoice[]>([]);
  const [localActive, setLocalActive] = useState<ActiveLanguageDetail | null>(
    null,
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
    if (!isAuthenticated) return localChoices;

    return (listQuery.data ?? []).map((language) => ({
      key: String(language.id),
      name: language.name,
      imageUrl: language.imageUrl ?? "",
    }));
  }, [isAuthenticated, listQuery.data, localChoices]);

  const activeLanguage = useMemo<ActiveLanguageDetail | null>(() => {
    if (!isAuthenticated) return localActive;

    const language = activeQuery.data;
    if (!language) return null;

    return {
      key: String(language.id),
      name: language.name,
      description: language.description ?? "",
      imageUrl: language.imageUrl ?? "",
      customization: language.customization,
    };
  }, [activeQuery.data, isAuthenticated, localActive]);

  const activeKey = activeLanguage?.key ?? "";

  const selectLanguage = useCallback(
    async (key: string) => {
      if (isAuthenticated) {
        const languageId = Number.parseInt(key, 10);
        if (!Number.isInteger(languageId)) return;

        // O detalhe traz a `customization`, que o resumo da lista não tem.
        const language = await languagesApi.get(languageId);
        await setActiveMut.mutateAsync(languageId);
        setCustomization(language.customization);
        return;
      }

      const language = loadSavedKeywordLanguage(key);
      if (!language) return;

      setActiveSavedKeywordLanguage(key);
      setCustomization(language.customization);
      setLocalActive({
        key: language.slug,
        name: language.name,
        description: language.description ?? "",
        imageUrl: language.imageUrl,
        customization: language.customization,
      });
    },
    [isAuthenticated, setActiveMut, setCustomization],
  );

  return { choices, activeKey, activeLanguage, selectLanguage };
}
