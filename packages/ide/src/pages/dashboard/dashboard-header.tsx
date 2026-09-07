import { Plus } from "lucide-react";
import { HeroButton } from "@/components/buttons/hero";
import { useAuth } from "@/contexts/AuthContext";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { Subtitle } from "@/components/text/subtitle";

export function DashboardHeader({
  onCreateClass,
}: {
  onCreateClass: () => void;
}) {
  const { isTeacher } = useAuth();

  if (!isTeacher) {
    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Minhas Turmas</h1>
          <p className="text-slate-400 text-sm">Gerencie seu progresso acadêmico.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button className="px-6 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
            Semestre Atual
          </button>
          <button className="px-6 py-2 rounded-lg text-slate-400 text-sm font-semibold hover:text-slate-200 transition-colors">
            Arquivadas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
      <div>
        <Title>
          <GradientText>Painel do Professor</GradientText>
        </Title>
        <Subtitle className="mt-1">
          Gerencie suas turmas, crie exercícios e acompanhe alunos
        </Subtitle>
      </div>
      <div className="flex gap-3">
        <HeroButton
          onClick={onCreateClass}
          className="group gap-2 px-6 py-3"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          Nova Turma
        </HeroButton>
      </div>
    </div>
  );
}
