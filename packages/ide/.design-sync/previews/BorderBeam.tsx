import "./_theme";
import { BorderBeam, Button } from "@ts-compilator-for-java/ide";
import { CalendarClock, ListChecks } from "lucide-react";

export const ExerciseCard = () => (
  <div className="flex justify-center p-6">
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card/85 p-6 dark:border-white/10 dark:bg-[#182f34]/40 shadow-2xl backdrop-blur-[3px]">
      <BorderBeam colorFrom="#0dccf2" colorTo="#34d399" duration={8} size={80} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ListChecks className="size-4 text-primary" /> Lista 3 · Estruturas de repetição
      </div>
      <h3 className="mt-3 text-lg font-semibold text-foreground">Fatorial com while</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Leia um inteiro n com scan e imprima n! usando um laço while.
      </p>
      <div className="mt-5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" /> Entrega até 12/11
        </span>
        <Button size="sm">Resolver</Button>
      </div>
    </div>
  </div>
);

export const DualBeamPanel = () => (
  <div className="flex justify-center p-6">
    <div className="relative flex h-48 w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card/40">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span className="size-2.5 rounded-full bg-red-400/90" />
        <span className="size-2.5 rounded-full bg-amber-400/90" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 font-mono">main.java</span>
      </div>
      <pre className="flex-1 p-4 font-mono text-sm leading-relaxed text-foreground">
        {"int main() {\n  int n = 5;\n  print(n * 2);\n}"}
      </pre>
      <BorderBeam duration={6} size={400} className="from-transparent via-sky-900 to-transparent" />
      <BorderBeam
        duration={6}
        delay={3}
        size={400}
        borderWidth={2}
        className="from-transparent via-slate-600 to-transparent"
      />
    </div>
  </div>
);

export const ColorsAndWidth = () => (
  <div className="flex flex-wrap justify-center gap-4 p-6">
    <div className="relative flex h-28 w-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-card/40 text-sm text-foreground">
      <BorderBeam size={60} duration={5} initialOffset={20} />
      Padrão
    </div>
    <div className="relative flex h-28 w-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-card/40 text-sm text-foreground">
      <BorderBeam size={60} duration={5} colorFrom="#0dccf2" colorTo="#34d399" borderWidth={2} initialOffset={45} />
      Ciano · 2px
    </div>
    <div className="relative flex h-28 w-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-card/40 text-sm text-foreground">
      <BorderBeam size={60} duration={5} colorFrom="#f87171" colorTo="#fbbf24" reverse initialOffset={70} />
      Reverso
    </div>
  </div>
);
