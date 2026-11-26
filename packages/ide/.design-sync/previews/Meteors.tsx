import "./_theme";
import { Button, Meteors } from "@ts-compilator-for-java/ide";
import { Rocket } from "lucide-react";

export const WelcomeCard = () => (
  <div className="flex justify-center p-6">
    <div className="relative flex h-80 w-full max-w-xl flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card/60 p-8">
      <Meteors number={40} minDelay={0} maxDelay={0.4} minDuration={2} maxDuration={6} />
      <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Rocket className="size-5" />
      </span>
      <h3 className="text-2xl font-bold text-foreground">Bem-vindo à turma Algoritmos I</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Sua primeira lista de exercícios já está disponível. Compile, execute e envie direto pelo navegador.
      </p>
      <Button className="mt-4 self-start">Começar agora</Button>
    </div>
  </div>
);

export const SpaceBackdrop = () => (
  <div className="relative flex h-80 items-center justify-center overflow-hidden bg-linear-to-t dark:from-neutral-950 dark:to-slate-950">
    <Meteors number={8} minDelay={0} maxDelay={0.5} minDuration={3} maxDuration={8} />
    <div className="relative text-center">
      <h2 className="text-4xl font-bold text-foreground">Interpretador dinâmico</h2>
      <p className="mt-2 text-muted-foreground">Crie sua própria linguagem de programação</p>
    </div>
  </div>
);

export const Diagonal = () => (
  <div className="flex justify-center p-6">
    <div className="relative h-64 w-full max-w-md overflow-hidden rounded-xl border border-border bg-background p-6">
      <Meteors number={30} angle={235} minDelay={0} maxDelay={0.3} minDuration={2} maxDuration={5} />
      <p className="text-xs uppercase tracking-widest text-primary">Entrega concluída</p>
      <p className="mt-2 text-lg font-semibold text-foreground">Lista “Estruturas de repetição” enviada</p>
      <p className="mt-1 text-sm text-muted-foreground">6 de 6 exercícios aceitos pelo corretor.</p>
    </div>
  </div>
);
