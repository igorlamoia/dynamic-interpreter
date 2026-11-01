import "./_theme";
import { RainbowButton } from "@ts-compilator-for-java/ide";
import { Play, Rocket, Sparkles } from "lucide-react";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-4 p-8">
    <RainbowButton>Começar agora</RainbowButton>
    <RainbowButton variant="outline">Executar tudo</RainbowButton>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-4 p-8">
    <RainbowButton variant="outline" size="sm">
      Executar tudo
    </RainbowButton>
    <RainbowButton variant="outline">Executar tudo</RainbowButton>
    <RainbowButton variant="outline" size="lg">
      Executar tudo
    </RainbowButton>
    <RainbowButton variant="outline" size="icon" aria-label="Executar">
      <Play />
    </RainbowButton>
  </div>
);

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-4 p-8">
    <RainbowButton>
      <Rocket /> Criar minha linguagem
    </RainbowButton>
    <RainbowButton variant="outline">
      <Sparkles /> Personalizar palavras-chave
    </RainbowButton>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-4 p-8">
    <RainbowButton variant="outline" disabled>
      Executar tudo
    </RainbowButton>
    <RainbowButton disabled>Compilando…</RainbowButton>
  </div>
);
