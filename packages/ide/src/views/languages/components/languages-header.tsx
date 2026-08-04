import { Plus } from "lucide-react";
import { HeroButton } from "@/components/buttons/hero";
import { GradientText } from "@/components/text/gradient";
import { Subtitle } from "@/components/text/subtitle";
import { Title } from "@/components/text/title";

export function LanguagesHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
      <div>
        <Title>
          <GradientText>Minhas Linguagens</GradientText>
        </Title>
        <Subtitle className="mt-1">
          Crie e mantenha suas próprias versões do Java--
        </Subtitle>
      </div>
      <HeroButton
        onClick={onCreate}
        aria-label="Nova linguagem"
        className="group gap-2 px-6 py-3"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        Nova Linguagem
      </HeroButton>
    </div>
  );
}
