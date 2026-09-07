import { useAuth } from "@/contexts/AuthContext";
import type { ClassSummary } from "@/types/api";
import { StudentClassCard, JoinClassCard } from "./student-class-card";
import { TeacherClassCard } from "./teacher-class-card";

export function ClassesGrid({
  classes,
  loading,
  onJoinClass,
}: {
  classes: ClassSummary[];
  loading: boolean;
  onJoinClass: () => void;
}) {
  const { isTeacher } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
        <span className="font-medium tracking-wide">Carregando turmas...</span>
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <StudentClassCard
            key={cls.id}
            cls={cls}
            onJoinClick={onJoinClass}
          />
        ))}
        <JoinClassCard onJoinClick={onJoinClass} />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <div className="w-24 h-24 mb-6 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10 dark:shadow-[inner_0_0_20px_rgba(13,204,242,0.1)]">
          <span className="text-5xl opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            📚
          </span>
        </div>
        <p className="text-slate-200 text-xl font-bold tracking-tight">
          Nenhuma turma encontrada
        </p>
        <p className="text-slate-500 text-sm mt-3 max-w-sm text-center leading-relaxed">
          Você ainda não criou nenhuma turma. Clique no botão acima para começar a gerenciar seus alunos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => (
        <TeacherClassCard
          key={cls.id}
          cls={cls}
        />
      ))}
    </div>
  );
}
