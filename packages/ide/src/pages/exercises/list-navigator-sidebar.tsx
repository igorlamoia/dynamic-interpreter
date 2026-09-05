import { ExerciseList } from "@/types/api";
import { CheckCircle2, ChevronRight, Circle, ListChecks } from "lucide-react";
import Link from "next/link";

export function ListNavigatorSidebar({
  list,
  currentExerciseId,
  classId,
}: {
  list: ExerciseList;
  currentExerciseId: string | number;
  classId?: string;
}) {
  const sorted = list.items.slice().sort((a, b) => a.orderIndex - b.orderIndex);

  const submittedSet = new Set<number>(list.submittedExerciseIds ?? []);

  const completedCount = sorted.filter((i) =>
    submittedSet.has(i.exerciseId),
  ).length;

  return (
    <div className="w-52 shrink-0 border-r border-white/5 bg-[#0b1719]/80 backdrop-blur-md flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <ListChecks className="w-3.5 h-3.5 text-[#0dccf2] shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0dccf2]">
            Lista
          </span>
        </div>
        <p className="text-xs text-slate-300 font-medium leading-tight line-clamp-2">
          {list.title}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {sorted.map((item, idx) => {
          const isActive = item.exerciseId === currentExerciseId;
          const isSubmitted = submittedSet.has(item.exerciseId);
          const href = `/exercises/${item.exerciseId}${classId ? `?listId=${list.id}&classId=${classId}` : `?listId=${list.id}`}`;
          return (
            <Link
              key={item.exerciseId}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all group ${
                isActive
                  ? "bg-[#0dccf2]/10 border-l-2 border-[#0dccf2] text-[#0dccf2]"
                  : isSubmitted
                    ? "border-l-2 border-emerald-500/50 text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/5"
                    : "border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/3"
              }`}
            >
              <span className="shrink-0">
                {isActive ? (
                  <ChevronRight className="w-3 h-3" />
                ) : isSubmitted ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Circle className="w-3 h-3 opacity-40" />
                )}
              </span>
              <span className="font-mono text-[10px] opacity-50 shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="truncate leading-tight">
                {item.exercise.title}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-white/5">
        <div className="text-[10px] text-slate-500 mb-1.5">
          {completedCount}/{sorted.length} concluídos
        </div>
        <div className="h-1 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#0dccf2] to-[#10b981] rounded-full transition-all duration-500"
            style={{
              width: `${sorted.length > 0 ? (completedCount / sorted.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
