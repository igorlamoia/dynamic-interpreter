import { Plus } from "lucide-react";
import { HeroButton } from "@/components/buttons/hero";
import { GradientText } from "@/components/text/gradient";
import { Subtitle } from "@/components/text/subtitle";
import { Title } from "@/components/text/title";
import { t } from "@/i18n";
import { useRouter } from "next/router";

export function LanguagesHeader({ onCreate }: { onCreate: () => void }) {
  const { locale } = useRouter();

  return (
    <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
      <div>
        <Title>
          <GradientText>{t(locale, "ui.languages_my_languages")}</GradientText>
        </Title>
        <Subtitle className="mt-1">
          {t(locale, "ui.languages_subtitle")}
        </Subtitle>
      </div>
      <HeroButton
        onClick={onCreate}
        aria-label={t(locale, "ui.languages_new_language")}
        className="group gap-2 px-6 py-3"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        {t(locale, "ui.languages_new_language")}
      </HeroButton>
    </div>
  );
}
