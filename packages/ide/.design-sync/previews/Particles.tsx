import "./_theme";
import { Meteors, Particles } from "@ts-compilator-for-java/ide";

export const HeroBackground = () => (
  <div className="flex justify-center p-6">
    <div className="relative flex h-80 w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
      <Particles className="absolute inset-0" quantity={160} size={0.6} />
      <div className="relative text-center">
        <h2 className="text-4xl font-bold text-foreground">Interpretador dinâmico</h2>
        <p className="mt-2 text-muted-foreground">Compile e execute Java-- direto no navegador</p>
      </div>
    </div>
  </div>
);

export const ColorAndDensity = () => (
  <div className="grid max-w-2xl grid-cols-2 gap-4 p-6">
    <div className="relative flex h-48 items-end overflow-hidden rounded-xl border border-border bg-background p-4">
      <Particles className="absolute inset-0" quantity={220} size={0.4} color="#ffffff" />
      <p className="relative text-sm text-muted-foreground">Padrão: 220 partículas brancas</p>
    </div>
    <div className="relative flex h-48 items-end overflow-hidden rounded-xl border border-border bg-background p-4">
      <Particles className="absolute inset-0" quantity={60} size={1.2} color="#0dccf2" />
      <p className="relative text-sm text-muted-foreground">Ciano da marca, maiores e esparsas</p>
    </div>
  </div>
);

export const SpaceBackground = () => (
  <div className="relative flex h-80 items-center justify-center overflow-hidden bg-linear-to-t dark:from-neutral-950 dark:to-slate-950">
    <Meteors number={6} minDelay={0} maxDelay={0.5} minDuration={3} maxDuration={8} />
    <Particles className="absolute inset-0" quantity={120} />
    <div className="relative text-center">
      <p className="text-xs uppercase tracking-widest text-primary">Turma Compiladores 2026</p>
      <h2 className="mt-2 text-3xl font-bold text-foreground">Crie sua própria linguagem</h2>
    </div>
  </div>
);
