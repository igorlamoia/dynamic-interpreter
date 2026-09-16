import { formatDate } from "@/utils/format";

export function Instructions({
  exercise,
  lastSubmission,
}: {
  exercise: {
    description: string;
    gradeWeight: number;
  };
  lastSubmission?: {
    submittedAt: string;
  };
}) {
  return (
    <div className="w-90 shrink-0 border-r border-border bg-card/80 backdrop-blur-md overflow-y-auto dark:border-white/5 dark:bg-[#0d1a1d]/60">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
          Instruções
        </h2>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {exercise.description}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground p-3 bg-muted/70 dark:bg-white/5 rounded-lg">
            <span>Peso da Nota</span>
            <span className="text-foreground font-medium">
              {exercise.gradeWeight}
            </span>
          </div>
          {lastSubmission && (
            <div className="flex justify-between text-xs text-muted-foreground p-3 bg-muted/70 dark:bg-white/5 rounded-lg">
              <span>Última Submissão</span>
              <span className="text-foreground font-medium">
                {formatDate(lastSubmission.submittedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
