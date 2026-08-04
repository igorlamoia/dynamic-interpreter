import { useCallback } from "react";
import { isAxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateLanguage, useUpdateLanguage } from "@/hooks/useLanguages";
import { saveSavedKeywordLanguage } from "@/lib/keyword-language-storage";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { WizardPresetId } from "@/components/keyword-customizer/wizard-model";

export type LanguageSaveMode = "local" | "create" | "update";

export type LanguageSaveInput = {
  name: string;
  description: string;
  imageUrl: string;
  imageQuery: string;
  presetId: WizardPresetId;
  customization: StoredKeywordCustomization;
};

export type LanguageSaveResult =
  | { ok: true; mode: LanguageSaveMode; languageId: number | null }
  | { ok: false; reason: "duplicate-name" | "unknown" | "not-ready" };

/**
 * Decide onde a linguagem editada no wizard é persistida.
 *
 * Deslogado continua no localStorage, exatamente como antes — é o que
 * permite usar o wizard sem conta. Logado, a linguagem vai para o backend:
 * cria quando o wizard foi aberto em branco, atualiza quando foi aberto
 * com `?id=N`.
 */
export function useLanguagePersistence(editingLanguageId: number | null) {
  const { isAuthenticated, isHydrated, isProfileLoading } = useAuth();
  const createMut = useCreateLanguage();
  const updateMut = useUpdateLanguage();

  // `isHydrated` só diz que o token foi lido. `isAuthenticated` depende do
  // perfil, que chega uma requisição depois — nesse intervalo um usuário
  // logado ainda parece deslogado. Só com as duas coisas assentadas dá para
  // confiar no `mode`.
  const isReady = isHydrated && !isProfileLoading;

  const mode: LanguageSaveMode = !isAuthenticated
    ? "local"
    : editingLanguageId !== null
      ? "update"
      : "create";

  const persist = useCallback(
    async (input: LanguageSaveInput): Promise<LanguageSaveResult> => {
      // `isAuthenticated` fica falso até o AuthContext hidratar o token e o
      // perfil chegar. Sem essa guarda, um save disparado antes disso cairia
      // no branch "local" mesmo para um usuário logado, gravando só no
      // localStorage e nunca na conta dele.
      if (!isReady) {
        return { ok: false, reason: "not-ready" };
      }

      if (mode === "local") {
        saveSavedKeywordLanguage({
          name: input.name,
          slug: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          imageQuery: input.imageQuery,
          presetId: input.presetId,
          customization: input.customization,
        });
        return { ok: true, mode, languageId: null };
      }

      const payload = {
        name: input.name,
        description: input.description,
        customization: input.customization,
        imageUrl: input.imageUrl,
        imageQuery: input.imageQuery,
        presetId: input.presetId,
      };

      try {
        if (mode === "update" && editingLanguageId !== null) {
          await updateMut.mutateAsync({ id: editingLanguageId, input: payload });
          return { ok: true, mode, languageId: editingLanguageId };
        }

        const created = await createMut.mutateAsync(payload);
        return { ok: true, mode, languageId: created.id };
      } catch (error: unknown) {
        // UNIQUE (owner_id, name) no backend. Vale distinguir do resto porque
        // é o único erro que o usuário consegue corrigir sozinho.
        const status = isAxiosError(error) ? error.response?.status : undefined;
        return {
          ok: false,
          reason: status === 409 ? "duplicate-name" : "unknown",
        };
      }
    },
    [createMut, editingLanguageId, isReady, mode, updateMut],
  );

  return {
    mode,
    isReady,
    persist,
    isPending: createMut.isPending || updateMut.isPending,
  };
}
