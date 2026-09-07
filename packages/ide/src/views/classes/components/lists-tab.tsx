import Link from "next/link";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";

function formatDeadline(deadline: string | undefined) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  const formatted = d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const isOverdue = diffMs < 0;
  const color = isOverdue
    ? "text-red-400"
    : diffDays <= 3
      ? "text-amber-400"
      : diffDays <= 7
        ? "text-yellow-300"
        : "text-slate-400";
  const label = isOverdue
    ? "Encerrado"
    : diffDays === 0
      ? "Hoje"
      : diffDays === 1
        ? "Amanhã"
        : `${diffDays} dias`;
  return { formatted, color, label, isOverdue };
}

export function ListsTab({
  exerciseLists,
  loadingLists,
  isTeacher,
  classId,
}: {
  exerciseLists: any[];
  loadingLists: boolean;
  isTeacher: boolean;
  classId: string | string[] | undefined;
}) {
  if (loadingLists) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <span className="text-sm font-medium">Carregando listas...</span>
      </div>
    );
  }

  if (exerciseLists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-card/70 dark:bg-white/2 rounded-3xl border border-border dark:border-white/5 backdrop-blur-xl">
        <div className="w-20 h-20 mb-5 rounded-full bg-linear-to-br from-primary/10 to-[#10b981]/10 flex items-center justify-center border border-border dark:border-white/10">
          <BookOpen className="w-10 h-10 text-slate-600" />
        </div>
        <p className="text-foreground text-lg font-bold">
          Nenhuma lista publicada
        </p>
        <p className="text-muted-foreground text-sm mt-2 max-w-xs text-center leading-relaxed">
          {isTeacher
            ? "Publique uma lista de exercícios para esta turma em 'Minhas Listas'."
            : "Seu professor ainda não publicou listas para esta turma."}
        </p>
      </div>
    );
  }

  if (isTeacher) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exerciseLists.map((entry: any) => (
          <div
            key={entry.exerciseListId}
            className="overflow-hidden group relative bg-card/80 dark:bg-white/3 backdrop-blur-xl border border-border dark:border-white/8 rounded-2xl p-5 hover:border-primary/35 hover:shadow-[0_4px_24px_rgba(13,204,242,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-primary to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
            <h3 className="font-bold text-foreground leading-snug line-clamp-2">
              {entry.exerciseList.title}
            </h3>
            {entry.exerciseList.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {entry.exerciseList.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary/60" />
                {entry.totalCount} exercício{entry.totalCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                Mínimo: {entry.minRequired}
              </span>
            </div>
            {(() => {
              const dl = formatDeadline(entry.deadline);
              if (!dl) return null;
              return (
                <div
                  className={`flex items-center gap-1.5 text-xs ${dl.color}`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dl.formatted}</span>
                  <span className="text-[10px] opacity-75">({dl.label})</span>
                </div>
              );
            })()}
            <div className="mt-auto pt-3 border-t border-border dark:border-white/5">
              <Link
                href={`/exercise-lists/${entry.exerciseListId}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                Gerenciar
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {exerciseLists.map((entry: any) => {
        const progress =
          entry.totalCount > 0
            ? Math.round((entry.completedCount / entry.totalCount) * 100)
            : 0;
        const statusCls =
          entry.completedCount >= entry.minRequired
            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
            : entry.completedCount > 0
              ? "bg-blue-500/15 text-blue-300 border-blue-500/25"
              : "bg-slate-500/15 text-slate-400 border-slate-500/25";
        const statusText =
          entry.completedCount >= entry.minRequired
            ? "Concluída"
            : entry.completedCount > 0
              ? "Em andamento"
              : "Não iniciada";

        return (
          <div
            key={entry.exerciseListId}
            className="group bg-card/80 dark:bg-white/3 backdrop-blur-xl border border-border dark:border-white/8 rounded-2xl p-5 hover:border-primary/30 hover:shadow-[0_4px_24px_rgba(13,204,242,0.08)] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-bold text-foreground leading-snug">
                {entry.exerciseList.title}
              </h3>
              <span
                className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusCls}`}
              >
                {statusText}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/70 dark:bg-white/5 border border-border dark:border-white/8 px-2.5 py-1 rounded-full">
                Mínimo: {entry.minRequired} exercício
                {entry.minRequired !== 1 ? "s" : ""}
              </span>
              {(() => {
                const dl = formatDeadline(entry.deadline);
                if (!dl) return null;
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs bg-muted/70 dark:bg-white/5 border border-border dark:border-white/8 px-2.5 py-1 rounded-full ${dl.color}`}
                  >
                    <Calendar className="w-3 h-3" />
                    {dl.label} — {dl.formatted}
                  </span>
                );
              })()}
            </div>
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
      })}
    </div>
  );
}
