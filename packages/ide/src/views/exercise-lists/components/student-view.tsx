import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { Subtitle } from "@/components/text/subtitle";
import { ChevronRight, ListChecks } from "lucide-react";
import { LoadingSpinner, EmptyState } from "./shared";
import {
  useClassExerciseListsQuery,
  useClassesQuery,
} from "@/hooks/use-api-queries";

type ClassOption = { id: number; name: string };

type ClassExerciseListEntry = {
  exerciseListId: number;
  classId: number;
  totalGrade: number;
  minRequired: number;
  exerciseList: {
    id: number;
    title: string;
    description: string;
    items: {
      exerciseId: number;
      exercise: { id: number; title: string };
      submitted: boolean;
    }[];
  };
  completedCount: number;
  totalCount: number;
};

function listProgress(completed: number, total: number) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function studentListStatus(entry: ClassExerciseListEntry) {
  if (entry.completedCount >= entry.minRequired)
    return {
      text: "Concluída",
      cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-300",
    };
  if (entry.completedCount > 0)
    return {
      text: "Em andamento",
      cls: "bg-blue-500/15 text-blue-700 border-blue-500/25 dark:text-blue-300",
    };
  return {
    text: "Não iniciada",
    cls: "bg-slate-500/15 text-slate-700 border-slate-500/25 dark:text-slate-400",
  };
}

export function StudentListCard({
  entry,
  classId,
}: {
  entry: ClassExerciseListEntry;
  classId: number | "";
}) {
  const status = studentListStatus(entry);
  const progress = listProgress(entry.completedCount, entry.totalCount);

  return (
    <div className="group bg-card/80 dark:bg-white/3 backdrop-blur-xl border border-border dark:border-white/8 rounded-2xl p-5 hover:border-primary/30 hover:shadow-[0_4px_24px_rgba(13,204,242,0.08)] transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-foreground leading-snug">
          {entry.exerciseList.title}
        </h3>
        <span
          className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${status.cls}`}
        >
          {status.text}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/70 dark:bg-white/5 border border-border dark:border-white/8 px-2.5 py-1 rounded-full">
          Mínimo: {entry.minRequired} exercício
          {entry.minRequired !== 1 ? "s" : ""}
        </span>
      </div>

      {/* progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>
            {entry.completedCount} de {entry.totalCount} concluídos
          </span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-[#10b981] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Link
        href={`/exercise-lists/${entry.exerciseListId}?classId=${classId}`}
        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 hover:shadow-[0_0_12px_rgba(13,204,242,0.2)] transition-all"
      >
        Abrir Lista
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export function StudentView() {
  const { showToast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const classesQuery = useClassesQuery();
  const listsQuery = useClassExerciseListsQuery(
    selectedClassId || undefined,
    Boolean(selectedClassId),
  );
  const classes = (classesQuery.data ?? []) as ClassOption[];
  const entries = (listsQuery.data ?? []) as ClassExerciseListEntry[];

  useEffect(() => {
    if (!selectedClassId && classes[0]) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (classesQuery.error) {
      showToast({ type: "error", message: "Erro ao carregar turmas." });
    }
  }, [classesQuery.error, showToast]);

  useEffect(() => {
    if (listsQuery.error) {
      showToast({ type: "error", message: "Erro ao carregar listas." });
    }
  }, [listsQuery.error, showToast]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Title>
            <GradientText>Listas da Turma</GradientText>
          </Title>
          <Subtitle className="mt-1">
            Exercícios publicados pelo seu professor
          </Subtitle>
        </div>

        {/* class selector */}
        {classes.length > 1 && (
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className="bg-card/80 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-background">
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {classesQuery.isPending || listsQuery.isPending ? (
        <LoadingSpinner label="Carregando listas..." />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-10 h-10 text-slate-600" />}
          title="Nenhuma lista publicada"
          description="Seu professor ainda não publicou listas de exercícios para esta turma."
        />
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {entries.map((entry) => (
            <StudentListCard
              key={entry.exerciseListId}
              entry={entry}
              classId={selectedClassId}
            />
          ))}
        </div>
      )}
    </>
  );
}
