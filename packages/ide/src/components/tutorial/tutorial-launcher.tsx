import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";
import { useTutorial } from "./tutorial-provider";
import type { TutorialId } from "@/lib/tutorials";

export function TutorialLauncher({
  tutorialId,
  labelKey,
  locale,
  className,
}: {
  tutorialId: TutorialId;
  labelKey: string;
  locale?: string;
  className?: string;
}) {
  const { startTutorial } = useTutorial();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => startTutorial(tutorialId)}
    >
      <HelpCircle aria-hidden="true" />
      {t(locale, labelKey)}
    </Button>
  );
}
