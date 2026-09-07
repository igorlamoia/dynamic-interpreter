import { useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { BookOpen, CheckCircle2, ChevronRight, Circle } from "lucide-react";
import type { ExerciseList } from "@/types/api";
import type { ClassExerciseListEntry } from "./types";
import { useClassExerciseListsQuery } from "@/hooks/use-api-queries";

export function StudentDetailView({
  list,
  classId,
}: {
  list: ExerciseList;
  classId: string;
}) {
  const { showToast } = useToast();
  const classListsQuery = useClassExerciseListsQuery(classId, Boolean(classId));
  const entries = (classListsQuery.data ?? []) as ClassExerciseListEntry[];
  const classEntry =
    entries.find((entry) => entry.exerciseListId === list.id) ?? null;

  useEffect(() => {
    if (classListsQuery.error) {
      showToast({ type: "error", message: "Erro ao carregar progresso." });
    }
  }, [classListsQuery.error, showToast]);

  const submittedIds = new Set<number>(
    classEntry?.exerciseList.items.filter((i) => i.submitted).map((i) => i.exerciseId) ?? [],
  );

  const publication = list.classes.find((c) => c.classId === Number(classId));
  const totalCount = list.items.length;
  const completedCount = submittedIds.size;
  const minRequired = publication?.minRequired ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* header card */}
      <div className="bg-card/80 dark:bg-white/3 backdrop-blur-xl border border-border dark:border-white/8 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{list.title}</h1>
            {list.description && (
              <p className="text-muted-foreground text-sm mt-1">{list.description}</p>
            )}
          </div>

          {publication && (
            <div className="shrink-0 flex flex-col items-end gap-2">
              <span className="text-xs text-muted-foreground">
                Mínimo: {minRequired} exercício{minRequired !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* progress */}
        {!classListsQuery.isPending && (
          <div className="mt-5 pt-5 border-t border-border dark:border-white/8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                {completedCount} de {totalCount} exercícios concluídos
              </span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#0dccf2] to-[#10b981] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {completedCount >= minRequired && minRequired > 0 && (
              <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Requisito mínimo atingido!
              </p>
            )}
          </div>
        )}
      </div>

      {/* exercises list */}
      <div className="bg-card/80 dark:bg-white/3 backdrop-blur-xl border border-border dark:border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border dark:border-white/8">
          <BookOpen className="w-4 h-4 text-[#0dccf2]" />
          <h2 className="font-semibold text-foreground">Exercícios</h2>
        </div>
        {list.items.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">
            Nenhum exercício nesta lista.
          </p>
        ) : (
          <ul>
            {list.items
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((item, idx) => {
                const done = submittedIds.has(item.exerciseId);
                return (
                  <li
                    key={item.exerciseId}
                    className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-accent/70 transition-colors dark:border-white/5 dark:hover:bg-white/2"
                  >
                    <span className="w-5 shrink-0">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600" />
                      )}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground w-6 text-right shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-sm text-foreground">
                      {item.exercise.title}
                    </span>
                    <Link
                      href={`/exercises/${item.exerciseId}?listId=${list.id}&classId=${classId}`}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors"
                    >
                      {done ? "Ver solução" : "Resolver"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}
