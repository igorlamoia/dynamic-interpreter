import {
  ACTIONS,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
  type TooltipRenderProps,
} from "react-joyride";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/router";
import { t } from "@/i18n";
import { getTutorialDefinition, type TutorialId } from "@/lib/tutorials";
import { markTutorialCompleted } from "@/lib/tutorial-progress";

type TutorialContextValue = {
  activeTutorialId: TutorialId | null;
  startTutorial: (tutorialId: TutorialId) => void;
  stopTutorial: () => void;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { locale } = useRouter();
  const [activeTutorialId, setActiveTutorialId] = useState<TutorialId | null>(
    null,
  );
  const [stepIndex, setStepIndex] = useState(0);

  const activeTutorial = useMemo(
    () =>
      activeTutorialId
        ? getTutorialDefinition(activeTutorialId, locale)
        : null,
    [activeTutorialId, locale],
  );

  const stopTutorial = useCallback(() => {
    setActiveTutorialId(null);
    setStepIndex(0);
  }, []);

  const startTutorial = useCallback((tutorialId: TutorialId) => {
    setStepIndex(0);
    setActiveTutorialId(tutorialId);
  }, []);

  const handleCallback = useCallback(
    (data: EventData) => {
      const { action, index, status, type } = data;

      if (
        activeTutorialId &&
        (status === STATUS.FINISHED || status === STATUS.SKIPPED)
      ) {
        markTutorialCompleted(activeTutorialId);
        stopTutorial();
        return;
      }

      if (type === EVENTS.TARGET_NOT_FOUND || type === EVENTS.STEP_AFTER) {
        const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
        setStepIndex(Math.max(nextIndex, 0));
      }
    },
    [activeTutorialId, stopTutorial],
  );

  return (
    <TutorialContext.Provider
      value={{ activeTutorialId, startTutorial, stopTutorial }}
    >
      {children}
      {activeTutorial && (
        <Joyride
          onEvent={handleCallback}
          continuous
          run
          scrollToFirstStep
          stepIndex={stepIndex}
          steps={activeTutorial.steps}
          locale={{
            back: t(locale, "ui.tutorial_back"),
            close: t(locale, "ui.close"),
            last: t(locale, "ui.tutorial_finish"),
            next: t(locale, "ui.tutorial_next"),
            skip: t(locale, "ui.tutorial_skip"),
          }}
          options={{
            arrowColor: "hsl(var(--card))",
            backgroundColor: "hsl(var(--card))",
            buttons: ["back", "skip", "primary"],
            closeButtonAction: "skip",
            overlayColor: "rgba(2, 6, 23, 0.72)",
            overlayClickAction: false,
            primaryColor: "hsl(var(--primary))",
            scrollOffset: 120,
            showProgress: false,
            skipBeacon: true,
            textColor: "hsl(var(--foreground))",
            zIndex: 10000,
          }}
          styles={{
            tooltip: {
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
            },
            tooltipTitle: {
              fontSize: 15,
              fontWeight: 700,
            },
            tooltipContent: {
              fontSize: 13,
              lineHeight: 1.5,
              padding: "12px 0",
            },
          }}
          tooltipComponent={TutorialTooltip}
        />
      )}
    </TutorialContext.Provider>
  );
}

function TutorialTooltip({
  backProps,
  closeProps,
  continuous,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  const progress = size > 0 ? ((index + 1) / size) * 100 : 0;

  return (
    <div
      {...tooltipProps}
      className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl"
    >
      <div className="border-b border-border px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {index + 1} / {size}
            </p>
            {step.title ? (
              <h2 className="mt-1 text-base font-bold leading-tight text-foreground">
                {step.title}
              </h2>
            ) : null}
          </div>
          <button
            {...closeProps}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <span aria-hidden="true">x</span>
          </button>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-4 py-4 text-sm leading-6 text-muted-foreground">
        {step.content}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <button
          {...skipProps}
          className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          {skipProps.title}
        </button>
        <div className="flex items-center gap-2">
          {index > 0 ? (
            <button
              {...backProps}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              {backProps.title}
            </button>
          ) : null}
          {continuous ? (
            <button
              {...primaryProps}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {isLastStep ? primaryProps.title : primaryProps.title}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used inside TutorialProvider");
  }
  return context;
}
