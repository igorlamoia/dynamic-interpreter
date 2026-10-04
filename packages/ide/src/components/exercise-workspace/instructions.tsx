import { formatDate } from "@/utils/format";

export function Instructions({
  exercise,
  lastSubmission,
}: {
  exercise: {
    description: string;
    gradeWeight?: number | null;
  };
  lastSubmission?: {
    score?: number | null;
    status?: string;
    submittedAt: string;
    teacherFeedback?: string | null;
  };
}) {
  const isGraded = lastSubmission?.status === "GRADED";

  return (
    <div className="w-90 shrink-0 border-r border-border bg-card/80 backdrop-blur-md overflow-y-auto dark:border-white/5 dark:bg-[#0d1a1d]/60">
      <div className="p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
          Instrucoes
        </h2>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Descricao
        </h3>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {exercise.description}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex justify-between rounded-lg bg-muted/70 p-3 text-xs text-muted-foreground dark:bg-white/5">
            <span>Peso da Nota</span>
            <span className="font-medium text-foreground">
              {exercise.gradeWeight ?? "-"}
            </span>
          </div>
          {lastSubmission && (
            <div className="flex justify-between rounded-lg bg-muted/70 p-3 text-xs text-muted-foreground dark:bg-white/5">
              <span>Ultima Submissao</span>
              <span className="font-medium text-foreground">
                {formatDate(lastSubmission.submittedAt)}
              </span>
            </div>
          )}
          {isGraded && (
            <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
              <div className="flex justify-between gap-3 text-xs text-emerald-700 dark:text-emerald-300">
                <span>Nota do professor</span>
                <span className="font-bold text-foreground">
                  {lastSubmission.score ?? "-"}
                </span>
              </div>
              {lastSubmission.teacherFeedback && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Feedback
                  </p>
                  <p className="whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                    {lastSubmission.teacherFeedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
