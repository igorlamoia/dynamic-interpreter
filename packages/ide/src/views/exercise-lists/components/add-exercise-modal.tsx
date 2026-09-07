import { useState, useEffect } from "react";
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
  const { showToast } = useToast();
  const [adding, setAdding] = useState<string | null>(null);
  const exercisesQuery = useExercisesQuery(undefined, open);
  const addExercise = useAddExerciseToListMutation(listId);
  const exercises = exercisesQuery.data ?? [];

  useEffect(() => {
    if (exercisesQuery.error) {
      showToast({ type: "error", message: "Erro ao carregar exercícios." });
    }
  }, [exercisesQuery.error, showToast]);

  const handleAdd = async (exerciseId: string) => {
    setAdding(exerciseId);
    try {
      await addExercise.mutateAsync(exerciseId);
      showToast({ type: "success", message: "Exercício adicionado!" });
      onAdded?.();
    } catch {
      showToast({ type: "error", message: "Erro ao adicionar exercício." });
    } finally {
      setAdding(null);
    }
  };

  const available = exercises.filter((e: Exercise) => !existingIds.has(e.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar Exercício</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecione um exercício para adicionar a esta lista.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto space-y-2 py-2 px-1">
          {exercisesQuery.isPending ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#0dccf2]" />
            </div>
          ) : available.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              {exercises.length === 0
                ? "Você não possui exercícios criados."
                : "Todos os seus exercícios já estão nesta lista."}
            </p>
          ) : (
            available.map((ex: Exercise) => (
              <div
                key={ex.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card/80 dark:bg-white/3 border border-border dark:border-white/8 hover:border-[#0dccf2]/25 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{ex.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ex.testCases.length} caso{ex.testCases.length !== 1 ? "s" : ""} de teste
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(String(ex.id))}
                  disabled={adding === String(ex.id)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors disabled:opacity-50"
                >
                  {adding === String(ex.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Adicionar"}
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
            Fechar
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
