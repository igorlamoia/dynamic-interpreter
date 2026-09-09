import type { Exercise } from "@/types/api";

export function StatsBar({ exercises }: { exercises: Exercise[] }) {
  const totalTests = exercises.reduce((s, e) => s + e.testCases.length, 0);

  const stats = [
    {
      label: "Total de Exercícios",
      value: exercises.length,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    {
      label: "Casos de Teste",
      value: totalTests,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl ${stat.bgColor}`}
        >
          <span className={`text-3xl font-black tabular-nums ${stat.color}`}>
            {stat.value}
          </span>
          <span className="text-xs text-muted-foreground font-medium leading-tight">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
