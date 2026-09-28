import { useState } from "react";
import { useRouter } from "next/router";
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
import { t } from "@/i18n";

export function ListLanguagePanel({
  list,
  lockedItemCount,
}: {
  list: ExerciseList;
  lockedItemCount: number;
}) {
  const { locale } = useRouter();
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
      showToast({
        type: "error",
        message: t(locale, "ui.exercise_lists_choose_language"),
      });
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
      showToast({
        type: "success",
        message: t(locale, "ui.exercise_lists_language_update_success"),
      });
      setEditing(false);
    } catch {
      showToast({
        type: "error",
        message: t(locale, "ui.exercise_lists_language_update_error"),
      });
    }
  };

  return (
    <div className="bg-card/80 dark:bg-white/3 backdrop-blur-xl border border-border dark:border-white/8 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Languages className="w-4 h-4 text-primary shrink-0" />
          <h2 className="font-semibold text-foreground">
            {t(locale, "ui.exercise_lists_language_title")}
          </h2>
        </div>
        {!editing && (
          <HeroButton
            variant="outline"
            aria-label={t(locale, "ui.exercise_lists_change_language")}
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
            {t(locale, "ui.exercise_lists_change")}
          </HeroButton>
        )}
      </div>

      {!editing && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {list.languagePolicy === "LOCKED" && list.lockedLanguage ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium">{list.lockedLanguage.name}</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t(locale, "ui.exercise_lists_open_language")}</span>
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
              aria-label={t(locale, "ui.exercise_lists_save_language")}
              onClick={() => void handleSave()}
              disabled={updateList.isPending}
              className="px-3 py-1.5 text-xs"
            >
              {t(locale, "ui.exercise_lists_save")}
            </HeroButton>
            <HeroButton
              variant="outline"
              aria-label={t(locale, "ui.exercise_lists_cancel_language_change")}
              onClick={() => {
                setDraft({
                  policy: list.languagePolicy,
                  lockedLanguageId: list.lockedLanguageId,
                });
                setEditing(false);
              }}
              className="px-3 py-1.5 text-xs"
            >
              {t(locale, "ui.dashboard_cancel")}
            </HeroButton>
          </div>
        </div>
      )}

      {/* A consequência da precedência, dita onde o professor decide. */}
      {list.languagePolicy === "LOCKED" && lockedItemCount > 0 && (
        <p className="text-xs text-amber-300/80">
          {t(
            locale,
            lockedItemCount === 1
              ? "ui.exercise_lists_locked_items_note_singular"
              : "ui.exercise_lists_locked_items_note_plural",
            { count: lockedItemCount },
          )}
        </p>
      )}

      {publishedCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {t(
            locale,
            publishedCount === 1
              ? "ui.exercise_lists_published_note_singular"
              : "ui.exercise_lists_published_note_plural",
            { count: publishedCount },
          )}
        </p>
      )}
    </div>
  );
}
