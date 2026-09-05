import { formatDate } from "@/utils/format";
import Link from "next/link";

export function Header({
  handleSubmit,
  submitted,
  isAlreadySubmitted,
  lastSubmission,
  exercise,
  list,
  classId,
  error,
  deadlineStr,
  isOverdue,
  validateSubmission,
}: {
  handleSubmit: () => void;
  submitted: boolean;
  isAlreadySubmitted: boolean;
  lastSubmission: any;
  exercise: any;
  list: any;
  classId: string | undefined;
  error: string;
  deadlineStr: string | undefined;
  isOverdue: boolean;
  validateSubmission: any;
}) {
  return (
    <header className="relative z-10 flex justify-between items-center px-6 py-3 bg-[#101f22]/90 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4">
        <Link
          href={
            list
              ? `/exercise-lists/${list.id}${classId ? `?classId=${classId}` : ""}`
              : "/dashboard"
          }
          className="text-xs text-slate-500 hover:text-white transition-colors"
        >
          {list ? `← ${list.title}` : "← Painel"}
        </Link>
        <div className="h-4 w-px bg-white/10" />
        <div>
          <h1 className="text-lg font-bold bg-linear-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent">
            {exercise.title}
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-500">
              Turma: {exercise.class?.name}
            </span>
            {deadlineStr && (
              <span
                className={`text-xs ${isOverdue ? "text-red-400" : "text-slate-500"}`}
              >
                Prazo: {formatDate(deadlineStr)}
              </span>
            )}
            {isOverdue && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                Atrasado
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {error && <span className="text-xs text-red-400">{error}</span>}
        {(submitted || isAlreadySubmitted) && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs text-emerald-300 font-medium">
              ✓ Enviado
            </span>
            {lastSubmission?.score != null && (
              <span className="text-xs font-bold text-[#0dccf2]">
                Nota: {lastSubmission.score}
              </span>
            )}
          </div>
        )}
        {isOverdue ? (
          <div className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 bg-white/5 border border-white/10 cursor-not-allowed">
            Prazo encerrado
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={validateSubmission.isPending}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-linear-to-r from-[#0dccf2] to-[#10b981] text-slate-800 shadow-[0_0_15px_rgba(13,204,242,0.3)] hover:shadow-[0_0_25px_rgba(13,204,242,0.5)] hover:opacity-90 transition-all disabled:opacity-50"
          >
            {validateSubmission.isPending
              ? "Submetendo..."
              : isAlreadySubmitted || submitted
                ? "Resubmeter"
                : "Submeter Resposta"}
          </button>
        )}
      </div>
    </header>
  );
}
