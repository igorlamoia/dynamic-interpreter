import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/contexts/ToastContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HeroButton } from "@/components/buttons/hero";
import { Loader2 } from "lucide-react";
import type { Exercise } from "@/types/api";
import {
  useAddExerciseToListMutation,
  useExercisesQuery,
} from "@/hooks/use-api-queries";
import { t } from "@/i18n";
import { CreateExerciseModal } from "@/views/exercises/components/create-exercise-modal";
import { Plus } from "lucide-react";

export function AddExerciseModal({
  open,
  onOpenChange,
  listId,
  existingIds,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string;
  existingIds: Set<number>;
  onAdded?: () => void;
}) {
  const { locale } = useRouter();
  const { showToast } = useToast();
  const [adding, setAdding] = useState<string | null>(null);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const exercisesQuery = useExercisesQuery(undefined, open);
  const addExercise = useAddExerciseToListMutation(listId);
  const exercises = exercisesQuery.data ?? [];

  useEffect(() => {
    if (exercisesQuery.error) {
      showToast({
        type: "error",
        message: t(locale, "ui.class_load_exercises_error"),
      });
    }
  }, [exercisesQuery.error, locale, showToast]);

  const handleAdd = async (exerciseId: string) => {
    setAdding(exerciseId);
    try {
      await addExercise.mutateAsync(exerciseId);
      showToast({
        type: "success",
        message: t(locale, "ui.exercise_lists_add_exercise_success"),
      });
      onAdded?.();
    } catch {
      showToast({
        type: "error",
        message: t(locale, "ui.exercise_lists_add_exercise_error"),
      });
    } finally {
      setAdding(null);
    }
  };

  const available = exercises.filter((e: Exercise) => !existingIds.has(e.id));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle>
              {t(locale, "ui.exercise_lists_add_exercise_title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t(locale, "ui.exercise_lists_add_exercise_description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-2">
            <HeroButton
              onClick={() => {
                onOpenChange(false);
                setShowCreateExercise(true);
              }}
              className="gap-2 px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              {t(locale, "ui.dashboard_create_exercise_submit")}
            </HeroButton>
          </div>
          <div className="max-h-[50vh] overflow-y-auto space-y-2 py-2 px-4">
            {exercisesQuery.isPending ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : available.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                {exercises.length === 0
                  ? t(locale, "ui.exercise_lists_no_created_exercises")
                  : t(locale, "ui.exercise_lists_all_exercises_added")}
              </p>
            ) : (
              available.map((ex: Exercise) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card/80 dark:bg-white/3 border border-border dark:border-white/8 hover:border-primary/25 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {ex.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(
                        locale,
                        ex.testCases.length === 1
                          ? "ui.exercises_test_case_singular"
                          : "ui.exercises_test_case_plural",
                        { count: ex.testCases.length },
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAdd(String(ex.id))}
                    disabled={adding === String(ex.id)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {adding === String(ex.id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      t(locale, "ui.exercise_lists_add")
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
          <DialogFooter className="bg-muted/60 border-t border-border dark:bg-white/5 dark:border-white/10">
            <HeroButton
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border bg-card/80 text-foreground hover:bg-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              {t(locale, "ui.close")}
            </HeroButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CreateExerciseModal
        open={showCreateExercise}
        onOpenChange={(nextOpen) => {
          setShowCreateExercise(nextOpen);
          if (!nextOpen) {
            onOpenChange(true);
          }
        }}
        onCreated={async () => {
          await exercisesQuery.refetch();
        }}
      />
    </>
  );
}
