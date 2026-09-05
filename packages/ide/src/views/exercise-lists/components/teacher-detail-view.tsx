import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HeroButton } from "@/components/buttons/hero";
import { BookOpen, Plus, Send } from "lucide-react";
import type { ExerciseList } from "@/types/api";
import type { ClassOption, SubmissionRecord } from "./types";
import { PublishModal } from "./publish-modal";
import { AddExerciseModal } from "./add-exercise-modal";
import { SubmissionsPanel } from "./submissions-panel";
import { ExerciseRow } from "./exercise-row";
import { ListLanguagePanel } from "./list-language-panel";
import {
  useExerciseListSubmissionsQuery,
  useExercisesQuery,
  useRemoveExerciseFromListMutation,
} from "@/hooks/use-api-queries";

export function deadlineInfo(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: "Prazo encerrado", cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (days === 0) return { text: "Hoje!", cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (days <= 3) return { text: `Faltam ${days}d`, cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (days <= 7) return { text: `Faltam ${days}d`, cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
  return { text: `Faltam ${days}d`, cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
}

export function TeacherDetailView({
  list,
  classes,
}: {
  list: ExerciseList;
  classes: ClassOption[];
}) {
  const { showToast } = useToast();
  const [showPublish, setShowPublish] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const submissionsQuery = useExerciseListSubmissionsQuery(
    list.id,
    showSubmissions,
  );
  const removeExercise = useRemoveExerciseFromListMutation(list.id);

  const existingIds = new Set(list.items.map((i) => i.exerciseId));
  const submissions = (submissionsQuery.data ?? []) as SubmissionRecord[];

  // Os itens da lista só trazem { id, title }; a política de cada exercício
  // vem da listagem do professor, que já está em cache.
  const exercisesQuery = useExercisesQuery();
  const lockedItemCount = (exercisesQuery.data ?? []).filter(
    (ex) =>
      ex.languagePolicy === "LOCKED" &&
      list.items.some((item) => item.exerciseId === ex.id),
  ).length;

  const handleToggleSubmissions = () => {
    setShowSubmissions((v) => !v);
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    try {
      await removeExercise.mutateAsync(exerciseId);
      showToast({ type: "success", message: "Exercício removido." });
    } catch {
      showToast({ type: "error", message: "Erro ao remover exercício." });
    } finally {
      setRemoveTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* header card */}
      <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{list.title}</h1>
            {list.description && (
              <p className="text-slate-400 text-sm mt-1">{list.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <HeroButton
              onClick={() => setShowPublish(true)}
              className="gap-2 px-4 py-2 text-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Publicar
            </HeroButton>
          </div>
        </div>
      </div>

      <ListLanguagePanel list={list} lockedItemCount={lockedItemCount} />

      {/* exercises panel */}
      <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0dccf2]" />
            <h2 className="font-semibold text-slate-200">
              Exercícios nesta lista
            </h2>
            <span className="text-xs text-slate-500 ml-1">
              ({list.items.length})
            </span>
          </div>
          <HeroButton
            variant="outline"
            onClick={() => setShowAddExercise(true)}
            className="gap-1.5 px-3 py-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </HeroButton>
        </div>

        {list.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <BookOpen className="w-8 h-8 mb-3 opacity-40" />
            <p className="text-sm">Nenhum exercício adicionado ainda.</p>
          </div>
        ) : (
          <ul>
            {list.items
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((item, idx) => (
                <ExerciseRow
                  key={item.exerciseId}
                  item={item}
                  index={idx}
                  onRemove={() => setRemoveTarget(String(item.exerciseId))}
                />
              ))}
          </ul>
        )}

      </div>

      <SubmissionsPanel
        submissions={submissions}
        showSubmissions={showSubmissions}
        loadingSubmissions={submissionsQuery.isPending}
        onToggle={handleToggleSubmissions}
      />

      {/* modals */}
      <PublishModal
        open={showPublish}
        onOpenChange={setShowPublish}
        listId={String(list.id)}
        classes={classes}
      />
      <AddExerciseModal
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        listId={String(list.id)}
        existingIds={existingIds}
      />
      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover exercício?</AlertDialogTitle>
            <AlertDialogDescription>
              Este exercício será removido da lista. As submissões existentes não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeTarget && handleRemoveExercise(removeTarget)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
