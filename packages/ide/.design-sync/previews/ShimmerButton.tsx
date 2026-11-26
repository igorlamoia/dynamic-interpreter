import "./_theme";
import { ShimmerButton } from "@ts-compilator-for-java/ide";
import { ArrowRight } from "lucide-react";

export const Default = () => (
  <div className="flex flex-wrap items-center gap-4 p-8">
    <ShimmerButton>
      <span className="text-sm font-medium">Experimentar a IDE</span>
    </ShimmerButton>
  </div>
);

export const CustomColors = () => (
  <div className="flex flex-wrap items-center gap-4 p-8">
    <ShimmerButton shimmerColor="#0dccf2" background="rgba(8, 47, 73, 1)">
      <span className="text-sm font-medium">Entrar na turma</span>
    </ShimmerButton>
    <ShimmerButton shimmerColor="#34d399" background="rgba(6, 40, 30, 1)">
      <span className="text-sm font-medium">Enviar submissão</span>
    </ShimmerButton>
    <ShimmerButton shimmerColor="#facc15" shimmerDuration="1.5s">
      <span className="text-sm font-medium">Ver ranking</span>
    </ShimmerButton>
  </div>
);

export const Shapes = () => (
  <div className="flex flex-wrap items-center gap-4 p-8">
    <ShimmerButton borderRadius="8px">
      <span className="text-sm font-medium">Criar exercício</span>
    </ShimmerButton>
    <ShimmerButton className="gap-2" shimmerSize="0.1em">
      <span className="text-sm font-medium">Começar a programar</span>
      <ArrowRight className="h-4 w-4" />
    </ShimmerButton>
  </div>
);
