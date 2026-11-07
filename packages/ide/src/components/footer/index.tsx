import Link from "next/link";
import { BookOpenText, Github, Info } from "lucide-react";
import { useRouter } from "next/router";

import { buttonVariants } from "@/components/ui/button";
import { Dock, DockIcon } from "@/components/ui/dock";
import { useTutorial } from "@/components/tutorial/tutorial-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { getTutorialDefinition, type TutorialId } from "@/lib/tutorials";

const GITHUB_URL = "https://github.com/igorlamoia/dynamic-interpreter";

export function Footer({
  onBeforeStartTutorial,
}: {
  onBeforeStartTutorial?: (tutorialId: TutorialId) => void;
}) {
  const router = useRouter();
  const { isAuthenticated, isTeacher } = useAuth();
  const { startTutorial } = useTutorial();
  const currentTutorialId = getCurrentTutorialId(
    router.pathname,
    isAuthenticated,
    isTeacher,
  );
  const currentTutorial = currentTutorialId
    ? getTutorialDefinition(currentTutorialId, router.locale)
    : null;

  return (
    <>
      <footer className="border-t border-black/10 bg-background/70 backdrop-blur-xl dark:border-white/10">
        <div className="mx-auto flex max-w-screen-3xl flex-col items-center gap-3 px-6 py-5 sm:px-8">
          <nav
            aria-label={t(router.locale, "footer.navigation")}
            className="flex justify-center"
          >
            <TooltipProvider>
              <Dock
                direction="middle"
                className="mt-0 border-black/10 bg-white/50 shadow-sm dark:border-white/10 dark:bg-neutral-900/30"
              >
                <DockIcon>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/about"
                        aria-label={t(router.locale, "footer.about")}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "size-12 cursor-pointer rounded-full",
                          router.pathname === "/about" &&
                            "bg-black/5 text-slate-950 dark:bg-white/10 dark:text-white",
                        )}
                      >
                        <Info className="size-5" aria-hidden="true" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t(router.locale, "footer.about")}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>

                <DockIcon>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "size-12 cursor-pointer rounded-full",
                        )}
                      >
                        <Github className="size-5" aria-hidden="true" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>GitHub</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              </Dock>
            </TooltipProvider>
          </nav>

          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dynamic Interpreter
          </p>
        </div>
      </footer>

      {currentTutorial ? (
        <TooltipProvider>
          <div className="fixed bottom-3 right-4 z-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={t(router.locale, currentTutorial.titleKey)}
                  onClick={() => {
                    onBeforeStartTutorial?.(currentTutorial.id);
                    startTutorial(currentTutorial.id);
                  }}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12 cursor-pointer rounded-full border border-neutral-200 bg-white/90 text-slate-700 shadow-lg backdrop-blur-sm transition duration-200 ease-out hover:scale-110 hover:bg-white hover:text-slate-950 hover:shadow-xl active:scale-95 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-slate-200 dark:hover:bg-neutral-900 dark:hover:text-white",
                  )}
                >
                  <BookOpenText className="size-5" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{t(router.locale, currentTutorial.titleKey)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ) : null}
    </>
  );
}

function getCurrentTutorialId(
  pathname: string,
  isAuthenticated: boolean,
  isTeacher: boolean,
): TutorialId | null {
  if (pathname === "/") return "ide-basics";
  if (pathname.startsWith("/language-creator")) return "language-creator";
  if (pathname === "/exercises" && isAuthenticated && isTeacher) {
    return "exercise-creator";
  }
  if (pathname === "/dashboard" && isAuthenticated) {
    return isTeacher ? "teacher-dashboard" : "student-dashboard";
  }

  return null;
}
