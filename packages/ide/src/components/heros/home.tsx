// import Image from "next/image";
import { t } from "@/i18n";
import { TypingAnimation } from "../ui/typing-animation";
import { useRouter } from "next/router";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { cn } from "@/lib/utils";
import { markLanguageCreatorReturn } from "@/lib/language-creator-navigation";

export function HomeHero() {
  const router = useRouter();
  const { locale } = router;

  const openLanguageCreator = () => {
    markLanguageCreatorReturn();
    void router.push("/language-creator");
  };

  return (
    <div className="flex gap-6 items-center flex-col ">
      <div>
        <div className="flex flex-col gap-1 md:items-center text-center md:text-start">
          <h1 className="text-4xl font-bold">{t(locale, "ui.hero_title")}</h1>
        </div>
        <div className="flex gap-2 mt-1 items-end text-lg dark:text-gray-400 text-gray-500 text-center sm:text-start ">
          <AnimatedShinyTextDemo onClick={openLanguageCreator}>
            {t(locale, "ui.hero_create")}
          </AnimatedShinyTextDemo>{" "}
          {t(locale, "ui.hero_description")}
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
        </div>
      </div>
    </div>
  );
}

function AnimatedShinyTextDemo({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      data-tour="home-create-language"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group rounded-full border border-black/5 hover:bg-primary/40  text-base text-white transition-all ease-in hover:cursor-pointer bg-primary/10 dark:border-white/5 dark:bg-neutral-900/50 dark:hover:bg-neutral-800",
      )}
    >
      <AnimatedShinyText className="inline-flex items-center justify-center px-2 py-0.5  transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
        <span>✨ {children}</span>
      </AnimatedShinyText>
    </div>
  );
}
