import { useEffect, useState, useDeferredValue } from "react";
import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { HeroButton } from "@/components/buttons/hero";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { Subtitle } from "@/components/text/subtitle";
import { Plus, Search } from "lucide-react";
import type { Exercise } from "@/types/api";
import { Pagination } from "@/components/ui/pagination";
import { CreateExerciseModal } from "@/views/exercises/components/create-exercise-modal";
import { EditExerciseModal } from "@/views/exercises/components/edit-exercise-modal";
import { ExerciseCard } from "@/views/exercises/components/exercise-card";
import { ExerciseDetailModal } from "@/views/exercises/components/exercise-detail-modal";
import { DeleteConfirmModal } from "@/views/exercises/components/delete-confirm-modal";
import { StatsBar } from "@/views/exercises/components/stats-bar";
import {
  LoadingSpinner,
  EmptyState,
} from "@/views/exercises/components/shared";
import {
  useDeleteExerciseMutation,
  useExercisesQuery,
} from "@/hooks/use-api-queries";

const PAGE_SIZE = 12;

export default function ExercisesPage() {
  const { isTeacher, userId } = useAuth();
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [showCreate, setShowCreate] = useState(false);
  const [viewExercise, setViewExercise] = useState<Exercise | null>(null);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);

  const exercisesQuery = useExercisesQuery(
    { page, pageSize: PAGE_SIZE, q: deferredSearch || undefined },
    Boolean(userId),
  );
  const deleteExercise = useDeleteExerciseMutation();

  const exercises = Array.isArray(exercisesQuery.data)
    ? exercisesQuery.data
    : exercisesQuery.data?.items ?? [];
  const totalPages = Array.isArray(exercisesQuery.data)
    ? 1
    : exercisesQuery.data?.totalPages ?? 1;
  const totalItems = Array.isArray(exercisesQuery.data)
    ? exercisesQuery.data.length
    : exercisesQuery.data?.total ?? exercises.length;

  useEffect(() => {
    if (exercisesQuery.error) {
      showToast({ type: "error", message: "Erro ao carregar exercícios." });
    }
  }, [exercisesQuery.error, showToast]);

  const handleDelete = async () => {
    if (!deleteTarget || !userId) return;
    try {
      await deleteExercise.mutateAsync(deleteTarget.id);
      showToast({ type: "success", message: "Exercício excluído." });
      setDeleteTarget(null);
    } catch {
      showToast({ type: "error", message: "Erro ao excluir exercício." });
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const filtered = exercises;

  if (!userId) return null;

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-[#0A0A0F]">
      <SpaceBackground />
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <main className="max-w-7xl mx-auto px-6 py-12 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <Title>
                  <GradientText>Meus Exercícios</GradientText>
                </Title>
                <Subtitle className="mt-1">
                  Crie e gerencie exercícios para usar nas suas listas
                </Subtitle>
              </div>
              {isTeacher && (
                <HeroButton
                  onClick={() => setShowCreate(true)}
                  className="gap-2 px-5 py-2.5 shrink-0 group"
                >
                  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                  Novo Exercício
                </HeroButton>
              )}
            </div>

            {/* Stats */}
            {!exercisesQuery.isPending && exercises.length > 0 && (
              <StatsBar exercises={exercises} />
            )}

            {/* Search */}
            {!exercisesQuery.isPending && exercises.length > 0 && (
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Buscar exercícios..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#0dccf2]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            {exercisesQuery.isPending ? (
              <LoadingSpinner label="Carregando exercícios..." />
            ) : filtered.length === 0 && search ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                <Search className="w-8 h-8 text-slate-600" />
                <p className="text-sm font-medium">
                  Nenhum resultado para &ldquo;{search}&rdquo;
                </p>
              </div>
            ) : exercises.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((exercise: Exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onView={() => setViewExercise(exercise)}
                      onEdit={() => setEditTarget(exercise)}
                      onDelete={() => setDeleteTarget(exercise)}
                    />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={totalItems}
                  pageSize={PAGE_SIZE}
                  className="mt-6"
                />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <CreateExerciseModal open={showCreate} onOpenChange={setShowCreate} />

      <EditExerciseModal
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        exercise={editTarget}
        onUpdated={(exercise) => {
          setEditTarget(null);
          setViewExercise((current) =>
            current?.id === exercise.id ? exercise : current,
          );
        }}
      />

      <ExerciseDetailModal
        open={!!viewExercise}
        onOpenChange={(v) => !v && setViewExercise(null)}
        exercise={viewExercise}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        exerciseTitle={deleteTarget?.title ?? ""}
        onConfirm={handleDelete}
        isDeleting={deleteExercise.isPending}
      />
    </div>
  );
}

ExercisesPage.requireAuth = true;
