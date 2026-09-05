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
    <div className="w-90 shrink-0 border-r border-white/5 bg-[#0d1a1d]/60 backdrop-blur-md overflow-y-auto">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-[#0dccf2] uppercase tracking-wider mb-4">
          Instruções
        </h2>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {exercise.description}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex justify-between text-xs text-slate-500 p-3 bg-white/5 rounded-lg">
            <span>Peso da Nota</span>
            <span className="text-white font-medium">
              {exercise.gradeWeight}
            </span>
          </div>
          {lastSubmission && (
            <div className="flex justify-between text-xs text-slate-500 p-3 bg-white/5 rounded-lg">
              <span>Última Submissão</span>
              <span className="text-white font-medium">
                {formatDate(lastSubmission.submittedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
