import {
  Calendar,
  Code2,
  Eye,
  FlaskConical,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Exercise } from "@/types/api";

export function ExerciseCard({
  exercise,
  onView,
  onEdit,
  onDelete,
}: {
  exercise: Exercise;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const createdDate = new Date(exercise.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="overflow-hidden group relative bg-card/80 dark:bg-white/3 backdrop-blur-xl border border-border dark:border-white/8 rounded-2xl p-5 hover:border-[#0dccf2]/35 hover:shadow-[0_4px_24px_rgba(13,204,242,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
      {/* top accent on hover */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#0dccf2]/10 border border-[#0dccf2]/20 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-[#0dccf2]" />
          </div>
          <h3 className="font-bold text-foreground leading-snug line-clamp-2 text-[15px]">
            {exercise.title}
          </h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {exercise.description}
      </p>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-emerald-400/60" />
          {exercise.testCases.length} caso
          {exercise.testCases.length !== 1 ? "s" : ""} de teste
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500/60" />
          {createdDate}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border dark:border-white/5">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          Visualizar
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors cursor-pointer"
          aria-label={`Editar ${exercise.title}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
          aria-label={`Excluir ${exercise.title}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
