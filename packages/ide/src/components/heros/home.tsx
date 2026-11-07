import { t } from "@/i18n";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { useTutorial } from "@/components/tutorial/tutorial-provider";
import { HeroLink } from "../buttons/hero";
import { BookOpenText } from "lucide-react";

export function HomeHero() {
  const router = useRouter();
  const { locale } = router;
  const { startTutorial } = useTutorial();

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-4xl font-bold">{t(locale, "ui.hero_title")}</h1>
      <p className="max-w-2xl text-lg text-gray-500 dark:text-gray-400">
        {t(locale, "ui.hero_description")}{" "}
        <code className="dark:text-gray-400">
          main.
          <TypingAnimation
            words={["?", "java", "c", "js", "py"]}
            typeSpeed={100}
            deleteSpeed={100}
            pauseDelay={2000}
            loop
          />
        </code>
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <HeroLink href="/language-creator" data-tour="home-create-language">
          {t(locale, "ui.hero_create")}
        </HeroLink>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex cursor-pointer transform items-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
          onClick={() => startTutorial("ide-basics")}
        >
          <BookOpenText />
          {t(locale, "ui.hero_get_started")}
        </Button>
      </div>
    </div>
  );
}
