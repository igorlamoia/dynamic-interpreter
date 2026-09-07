import { ClipboardList, Users } from "lucide-react";
import { HeroLink } from "@/components/buttons/hero";
import { useAuth } from "@/contexts/AuthContext";
import type { ClassSummary } from "@/types/api";

export function TeacherClassCard({ cls }: { cls: ClassSummary }) {
  const { isTeacher } = useAuth();

  return (
    <div className="overflow-hidden group shadow-[0_1px_10px_rgba(0,0,0,0.08)] dark:shadow-none relative bg-card/80 dark:bg-white/3 backdrop-blur-2xl border border-border dark:border-white/10 rounded-3xl p-7 hover:border-[#0dccf2]/40 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(13,204,242,0.15)] hover:-translate-y-1 flex flex-col h-full">
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl shadow-[0_0_10px_rgba(13,204,242,0.5)]" />

      <div className="flex justify-between items-start mb-1">
        <h3 className="capitalize text-xl font-bold group-hover:text-[#0dccf2] transition-colors leading-tight pr-4">
          {cls.name}
        </h3>
        {cls._count && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/70 dark:bg-white/5 border border-border dark:border-white/10 backdrop-blur-md shadow-inner shrink-0">
            <Users className="w-4 h-4 text-[#10b981]" />{" "}
            <span className="text-xs font-bold text-foreground">
              {cls._count.members || 0}
            </span>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed flex-1">
        {cls.description}
      </p>

      {isTeacher && (
        <div className="mb-3 p-2 bg-muted/70 dark:bg-gray-400/20 rounded-2xl border border-border dark:border-white/5 backdrop-blur-md flex items-center justify-between group/code cursor-copy">
          <span className="text-xs text-muted-foreground font-semibold tracking-wider">
            CÓDIGO:
          </span>
          <span className="text-base font-mono font-bold text-[#0dccf2] tracking-widest drop-shadow-[0_0_8px_rgba(13,204,242,0.4)] group-hover/code:text-accent-foreground transition-colors">
            {cls.accessCode}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground font-medium mb-6 px-1">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#0dccf2]/70" />
          <span>
            {cls._count.exerciseLists} lista
            {cls._count.exerciseLists !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-linear-to-br from-[#0dccf2] to-[#10b981] flex items-center justify-center text-[10px] font-bold text-slate-800">
            {(cls.teacher?.name || "P")[0].toUpperCase()}
          </div>
          <span>{cls.teacher?.name || "Professor"}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-border dark:border-white/10 flex gap-3 mt-auto">
        <HeroLink
          variant="outline"
          href={`/classes/${cls.id}`}
          className="py-2 ml-auto"
        >
          Acessar Turma
        </HeroLink>
      </div>
    </div>
  );
}
