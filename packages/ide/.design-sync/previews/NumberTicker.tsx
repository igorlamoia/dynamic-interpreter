import "./_theme";
import { NumberTicker } from "@ts-compilator-for-java/ide";
import { Send, Users, GraduationCap, Target } from "lucide-react";

const metrics = [
  { icon: <Send className="size-4" />, label: "Submissões", value: 1248, decimals: 0, suffix: "" },
  { icon: <GraduationCap className="size-4" />, label: "Turmas ativas", value: 12, decimals: 0, suffix: "" },
  { icon: <Users className="size-4" />, label: "Alunos", value: 342, decimals: 0, suffix: "" },
  { icon: <Target className="size-4" />, label: "Taxa de acerto", value: 87.5, decimals: 1, suffix: "%" },
];

export const ClassMetrics = () => (
  <div className="grid max-w-3xl grid-cols-2 gap-3 p-6 md:grid-cols-4">
    {metrics.map((m) => (
      <div key={m.label} className="rounded-xl border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-primary">{m.icon}</span>
          {m.label}
        </div>
        <div className="mt-2 text-3xl font-bold">
          <NumberTicker value={m.value} decimalPlaces={m.decimals} />
          {m.suffix}
        </div>
      </div>
    ))}
  </div>
);

export const TokenCount = () => (
  <div className="p-6">
    <p className="text-center text-xl font-medium whitespace-pre-wrap">
      <NumberTicker value={57} startValue={0} /> Tokens Gerados
    </p>
  </div>
);

export const CountDown = () => (
  <div className="flex justify-center p-6">
    <div className="w-72 rounded-xl border border-border bg-card/60 p-5 text-center">
      <p className="text-sm text-muted-foreground">Exercícios pendentes na lista</p>
      <NumberTicker
        value={6}
        startValue={4}
        direction="down"
        className="mt-1 text-5xl font-bold"
      />
      <p className="mt-1 text-xs text-muted-foreground">Prazo: sexta-feira, 23:59</p>
    </div>
  </div>
);
