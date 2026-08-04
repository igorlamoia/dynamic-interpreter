import { useCallback } from "react";
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
  | { ok: false; reason: "duplicate-name" | "unknown" };

/**
 * Decide onde a linguagem editada no wizard é persistida.
 *
 * Deslogado continua no localStorage, exatamente como antes — é o que
 * permite usar o wizard sem conta. Logado, a linguagem vai para o backend:
 * cria quando o wizard foi aberto em branco, atualiza quando foi aberto
 * com `?id=N`.
 */
export function useLanguagePersistence(editingLanguageId: number | null) {
  const { isAuthenticated } = useAuth();
  const createMut = useCreateLanguage();
  const updateMut = useUpdateLanguage();

  const mode: LanguageSaveMode = !isAuthenticated
    ? "local"
    : editingLanguageId !== null
      ? "update"
      : "create";

  const persist = useCallback(
    async (input: LanguageSaveInput): Promise<LanguageSaveResult> => {
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
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        return {
          ok: false,
          reason: status === 409 ? "duplicate-name" : "unknown",
        };
      }
    },
    [createMut, editingLanguageId, mode, updateMut],
  );

  return {
    mode,
    persist,
    isPending: createMut.isPending || updateMut.isPending,
  };
}
