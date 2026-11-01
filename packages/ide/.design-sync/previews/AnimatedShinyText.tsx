import "./_theme";
import { AnimatedShinyText } from "@ts-compilator-for-java/ide";
import { ArrowRight } from "lucide-react";

export const HeroPill = () => (
  <div className="flex justify-center p-6">
    <div className="group rounded-full border border-black/5 bg-primary/10 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-primary/40 dark:border-white/5 dark:bg-neutral-900/50 dark:hover:bg-neutral-800">
      <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
        <span>✨ Crie sua própria linguagem</span>
        <ArrowRight className="ml-1 size-3" />
      </AnimatedShinyText>
    </div>
  </div>
);

export const ShimmerWidths = () => (
  <div className="flex flex-col items-center gap-4 p-6">
    <AnimatedShinyText shimmerWidth={60} className="text-sm">
      Compilando main.java…
    </AnimatedShinyText>
    <AnimatedShinyText className="text-base">Analisando tokens do programa</AnimatedShinyText>
    <AnimatedShinyText shimmerWidth={200} className="text-lg font-medium">
      Corrigindo envios da turma Algoritmos I
    </AnimatedShinyText>
  </div>
);
