import type { Step } from "react-joyride";
import { t } from "@/i18n";

export type TutorialId =
  | "ide-basics"
  | "language-creator"
  | "teacher-dashboard"
  | "student-dashboard";

export type TutorialDefinition = {
  id: TutorialId;
  titleKey: string;
  steps: Step[];
};

function step(
  locale: string | undefined,
  key: string,
  target: string,
  placement: Step["placement"] = "bottom",
): Step {
  return {
    target,
    title: t(locale, `ui.tutorial_${key}_title`),
    content: t(locale, `ui.tutorial_${key}_body`),
    placement,
    skipBeacon: true,
  };
}

export function getTutorialDefinition(
  id: TutorialId,
  locale?: string,
): TutorialDefinition {
  const definitions: Record<TutorialId, TutorialDefinition> = {
    "ide-basics": {
      id: "ide-basics",
      titleKey: "ui.tutorial_ide_launcher",
      steps: [
        step(
          locale,
          "ide_create_language",
          '[data-tour="ide-create-language"]',
          "right",
        ),
        step(locale, "ide_explorer", '[data-tour="ide-explorer"]', "right"),
        step(locale, "ide_language", '[data-tour="ide-language"]', "right"),
        step(locale, "ide_editor", '[data-tour="ide-editor"]', "left"),
        step(locale, "ide_help", '[data-tour="ide-help"]', "bottom"),
        step(locale, "ide_lexer", '[data-tour="ide-run-lexer"]', "bottom"),
        step(locale, "ide_run", '[data-tour="ide-run-all"]', "bottom"),
        step(
          locale,
          "ide_terminal",
          '[data-tour="ide-terminal-toggle"]',
          "bottom",
        ),
        step(locale, "ide_debug", '[data-tour="ide-debug"]', "right"),
      ],
    },
    "language-creator": {
      id: "language-creator",
      titleKey: "ui.tutorial_language_launcher",
      steps: [
        step(
          locale,
          "language_stepper",
          '[data-tour="language-stepper"]',
          "right",
        ),
        step(
          locale,
          "language_form",
          '[data-tour="language-current-step"]',
          "bottom",
        ),
        step(
          locale,
          "language_preview",
          '[data-tour="language-preview"]',
          "left",
        ),
        step(locale, "language_footer", '[data-tour="language-footer"]', "top"),
      ],
    },
    "teacher-dashboard": {
      id: "teacher-dashboard",
      titleKey: "ui.tutorial_teacher_launcher",
      steps: [
        step(
          locale,
          "teacher_dashboard",
          '[data-tour="dashboard-main"]',
          "center",
        ),
        step(locale, "teacher_sidebar", '[data-tour="app-sidebar"]', "right"),
        step(
          locale,
          "teacher_create_class",
          '[data-tour="teacher-create-class"]',
          "bottom",
        ),
        step(locale, "teacher_classes", '[data-tour="classes-grid"]', "top"),
      ],
    },
    "student-dashboard": {
      id: "student-dashboard",
      titleKey: "ui.tutorial_student_launcher",
      steps: [
        step(
          locale,
          "student_dashboard",
          '[data-tour="dashboard-main"]',
          "center",
        ),
        step(locale, "student_sidebar", '[data-tour="app-sidebar"]', "right"),
        step(locale, "student_classes", '[data-tour="classes-grid"]', "top"),
      ],
    },
  };

  return definitions[id];
}
