import Link from "next/link";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import type { SubmissionRecord } from "./types";

function SubmissionRow({ submission }: { submission: SubmissionRecord }) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Pendente", cls: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
    SUBMITTED: { label: "Submetido", cls: "bg-blue-500/15 text-blue-300 border-blue-500/25" },
    GRADED: { label: "Avaliado", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
    LATE: { label: "Atrasado", cls: "bg-red-500/15 text-red-300 border-red-500/25" },
  };
  const s = statusMap[submission.status] ?? statusMap.PENDING;

  return (
    <tr className="border-b border-white/5 hover:bg-white/2 transition-colors">
      <td className="px-6 py-3.5 text-slate-300 font-medium">
        {submission.student?.name || submission.student?.email || String(submission.studentId).slice(0, 8)}
      </td>
      <td className="px-6 py-3.5 text-slate-400 text-sm">
        {submission.exercise?.title ?? String(submission.exerciseId).slice(0, 8)}
      </td>
      <td className="px-6 py-3.5 text-slate-500 text-xs">
        {new Date(submission.submittedAt).toLocaleString("pt-BR", {
          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
        })}
      </td>
      <td className="px-6 py-3.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
          {s.label}
        </span>
      </td>
      <td className="px-6 py-3.5 text-slate-300 font-mono text-sm">
        {submission.score != null ? submission.score : "—"}
      </td>
      <td className="px-6 py-3.5 text-right">
        <Link
          href={`/submissions/${submission.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 hover:border-[#0dccf2]/40 transition-colors"
        >
          <span>Corrigir</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </td>
    </tr>
  );
}

export function SubmissionsPanel({
  submissions,
  showSubmissions,
  loadingSubmissions,
  onToggle,
}: {
  submissions: SubmissionRecord[];
  showSubmissions: boolean;
  loadingSubmissions: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-200">Submissões</h2>
          {submissions.length > 0 && (
            <span className="text-xs text-slate-500">({submissions.length})</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${showSubmissions ? "rotate-180" : ""}`}
        />
      </button>

      {showSubmissions && (
        <div className="border-t border-white/8">
          {loadingSubmissions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#0dccf2]" />
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-8">
              Nenhuma submissão ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-white/5">
                    <th className="px-6 py-3 text-left">Aluno</th>
                    <th className="px-6 py-3 text-left">Exercício</th>
                    <th className="px-6 py-3 text-left">Enviado</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Nota</th>
                    <th className="px-6 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <SubmissionRow key={sub.id} submission={sub} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
