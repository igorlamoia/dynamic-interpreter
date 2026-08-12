import { useState } from "react";
import { Languages, Lock, Unlock } from "lucide-react";
import { HeroButton } from "@/components/buttons/hero";
import {
  LanguagePolicyField,
  type LanguagePolicyValue,
} from "@/components/language-policy-field";
import { useToast } from "@/contexts/ToastContext";
import { useUpdateExerciseListMutation } from "@/hooks/use-api-queries";
import { useLanguagesList } from "@/hooks/useLanguages";
import type { ExerciseList } from "@/types/api";

export function ListLanguagePanel({
  list,
  lockedItemCount,
}: {
  list: ExerciseList;
  lockedItemCount: number;
}) {
  const { showToast } = useToast();
  const languagesQuery = useLanguagesList();
  const updateList = useUpdateExerciseListMutation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LanguagePolicyValue>({
    policy: list.languagePolicy,
    lockedLanguageId: list.lockedLanguageId,
  });

  const publishedCount = list.classes.length;

  const handleSave = async () => {
    if (draft.policy === "LOCKED" && draft.lockedLanguageId === null) {
      showToast({ type: "error", message: "Escolha uma linguagem." });
      return;
    }
    try {
      // Destravar exige mandar lockedLanguageId: null explicito — o merge
      // parcial do backend preserva o id atual e devolve 400 sem ele.
      await updateList.mutateAsync({
        listId: list.id,
        languagePolicy: draft.policy,
        lockedLanguageId:
          draft.policy === "LOCKED" ? draft.lockedLanguageId : null,
      });
      showToast({ type: "success", message: "Linguagem da lista atualizada." });
      setEditing(false);
    } catch {
      showToast({ type: "error", message: "Erro ao atualizar a linguagem." });
    }
  };

  return (
    <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Languages className="w-4 h-4 text-[#0dccf2] shrink-0" />
          <h2 className="font-semibold text-slate-200">Linguagem da lista</h2>
        </div>
        {!editing && (
          <HeroButton
            variant="outline"
            aria-label="Alterar linguagem"
            onClick={() => {
              // Parte sempre do que o servidor devolveu: um refetch entre duas
              // edicoes deixaria o rascunho anterior desatualizado.
              setDraft({
                policy: list.languagePolicy,
                lockedLanguageId: list.lockedLanguageId,
              });
              setEditing(true);
            }}
            className="px-3 py-1.5 text-xs"
          >
            Alterar
          </HeroButton>
        )}
      </div>

      {!editing && (
        <p className="flex items-center gap-2 text-sm text-slate-300">
          {list.languagePolicy === "LOCKED" && list.lockedLanguage ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium">{list.lockedLanguage.name}</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Aberta — o aluno usa a própria linguagem</span>
            </>
          )}
        </p>
      )}

      {editing && (
        <div className="space-y-3">
          <LanguagePolicyField
            value={draft}
            onChange={setDraft}
            languages={languagesQuery.data ?? []}
            disabled={updateList.isPending}
          />
          <div className="flex gap-2">
            <HeroButton
              aria-label="Salvar linguagem"
              onClick={() => void handleSave()}
              disabled={updateList.isPending}
              className="px-3 py-1.5 text-xs"
            >
              Salvar
            </HeroButton>
            <HeroButton
              variant="outline"
              aria-label="Cancelar alteracao de linguagem"
              onClick={() => {
                setDraft({
                  policy: list.languagePolicy,
                  lockedLanguageId: list.lockedLanguageId,
                });
                setEditing(false);
              }}
              className="px-3 py-1.5 text-xs"
            >
              Cancelar
            </HeroButton>
          </div>
        </div>
      )}

      {/* A consequência da precedência, dita onde o professor decide. */}
      {list.languagePolicy === "LOCKED" && lockedItemCount > 0 && (
        <p className="text-xs text-amber-300/80">
          {lockedItemCount}{" "}
          {lockedItemCount === 1 ? "exercício tem" : "exercícios têm"} trava
          própria e {lockedItemCount === 1 ? "mantém" : "mantêm"} a linguagem
          dele{lockedItemCount === 1 ? "" : "s"}.
        </p>
      )}

      {publishedCount > 0 && (
        <p className="text-xs text-slate-500">
          Esta lista está publicada em {publishedCount}{" "}
          {publishedCount === 1 ? "turma" : "turmas"}. Alterar a linguagem vale
          para quem ainda não entregou; o que já foi enviado não muda.
        </p>
      )}
    </div>
  );
}
