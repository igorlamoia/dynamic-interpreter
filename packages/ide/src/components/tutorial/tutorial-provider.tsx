import {
  ACTIONS,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
  type Step,
  type TooltipRenderProps,
} from "react-joyride";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const completionRef = useRef(false);

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
    completionRef.current = false;
    setActiveTutorialId(tutorialId);
  }, []);

  const completeTutorial = useCallback(() => {
    if (!activeTutorialId || completionRef.current) return;
    completionRef.current = true;
    markTutorialCompleted(activeTutorialId);
    stopTutorial();
  }, [activeTutorialId, stopTutorial]);

  const goToNextStep = useCallback(() => {
    const stepCount = activeTutorial?.steps.length ?? 0;

    setStepIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;

      if (nextIndex >= stepCount) {
        completeTutorial();
        return currentIndex;
      }

      return nextIndex;
    });
  }, [activeTutorial, completeTutorial]);

  const goToPreviousStep = useCallback(() => {
    setStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  }, []);

  const handleCallback = useCallback(
    (data: EventData) => {
      const { action, index, status, type } = data;
      const stepCount = activeTutorial?.steps.length ?? 0;

      if (
        activeTutorialId &&
        (status === STATUS.FINISHED || status === STATUS.SKIPPED)
      ) {
        completeTutorial();
        return;
      }

      if (type === EVENTS.TARGET_NOT_FOUND) {
        if (stepCount === 0) {
          stopTutorial();
          return;
        }
        const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
        if (activeTutorialId && nextIndex >= stepCount) {
          completeTutorial();
          return;
        }
        setStepIndex(Math.min(Math.max(nextIndex, 0), stepCount - 1));
      }
    },
    [activeTutorial, activeTutorialId, completeTutorial, stopTutorial],
  );

  const currentStep =
    activeTutorial && stepIndex >= 0 && stepIndex < activeTutorial.steps.length
      ? activeTutorial.steps[stepIndex]
      : null;

  useEffect(() => {
    if (!activeTutorialId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        completeTutorial();
        return;
      }

      if (event.key !== "Enter" || event.isComposing) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      goToNextStep();
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [activeTutorialId, completeTutorial, goToNextStep]);
  const tooltipComponent = useMemo(
    () =>
      function ControlledTutorialTooltip(props: TooltipRenderProps) {
        return (
          <TutorialTooltip
            {...props}
            onBack={goToPreviousStep}
            onNext={goToNextStep}
            onSkip={completeTutorial}
          />
        );
      },
    [completeTutorial, goToNextStep, goToPreviousStep],
  );

  return (
    <TutorialContext.Provider
      value={{ activeTutorialId, startTutorial, stopTutorial }}
    >
      {children}
      {activeTutorial && currentStep && (
        <>
          <TutorialBlurBackdrop step={currentStep} />
          <Joyride
            continuous
            onEvent={handleCallback}
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
              overlayColor: "rgba(2, 6, 23, 0.86)",
              overlayClickAction: false,
              primaryColor: "hsl(var(--primary))",
              scrollOffset: 120,
              showProgress: false,
              skipBeacon: true,
              textColor: "hsl(var(--foreground))",
              zIndex: 2147483647,
            }}
            styles={{
              tooltip: {
                borderRadius: 8,
                border: "1px solid rgba(34, 211, 238, 0.45)",
                boxShadow:
                  "0 24px 70px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(16, 185, 129, 0.24)",
              },
              spotlight: {
                stroke: "rgba(34, 211, 238, 0.95)",
                strokeWidth: 2,
                filter: "drop-shadow(0 0 14px rgba(34, 211, 238, 0.85))",
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
            tooltipComponent={tooltipComponent}
          />
        </>
      )}
    </TutorialContext.Provider>
  );
}

function TutorialBlurBackdrop({ step }: { step?: Step }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const targetSelector = typeof step?.target === "string" ? step.target : null;

  useEffect(() => {
    if (!targetSelector) {
      setRect(null);
      return;
    }

    let frame = 0;
    const timeouts: number[] = [];
    let targetElement: Element | null = null;
    let dialogElement: Element | null = null;

    const updateRect = () => {
      const target = document.querySelector(targetSelector);

      if (!target) {
        setRect(null);
        return;
      }

      targetElement = target;
      dialogElement = target.closest('[role="dialog"]');
      setRect(target.getBoundingClientRect());
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateRect);
    };

    const scheduleSettledUpdates = () => {
      scheduleUpdate();

      for (const delay of [50, 150, 300]) {
        timeouts.push(window.setTimeout(scheduleUpdate, delay));
      }
    };

    const handleTransitionEnd = () => scheduleUpdate();

    const attachAnimationListeners = () => {
      targetElement?.addEventListener("transitionend", handleTransitionEnd);
      targetElement?.addEventListener("animationend", handleTransitionEnd);
      dialogElement?.addEventListener("transitionend", handleTransitionEnd);
      dialogElement?.addEventListener("animationend", handleTransitionEnd);
    };

    scheduleUpdate();
    timeouts.push(window.setTimeout(attachAnimationListeners, 0));
    scheduleSettledUpdates();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      cancelAnimationFrame(frame);
      for (const timeout of timeouts) window.clearTimeout(timeout);
      targetElement?.removeEventListener("transitionend", handleTransitionEnd);
      targetElement?.removeEventListener("animationend", handleTransitionEnd);
      dialogElement?.removeEventListener("transitionend", handleTransitionEnd);
      dialogElement?.removeEventListener("animationend", handleTransitionEnd);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [targetSelector]);

  if (!rect) return null;

  const padding = 10;
  const top = Math.max(rect.top - padding, 0);
  const left = Math.max(rect.left - padding, 0);
  const right = Math.min(rect.right + padding, window.innerWidth);
  const bottom = Math.min(rect.bottom + padding, window.innerHeight);
  const panelClass =
    "pointer-events-none fixed z-[2147483646] backdrop-blur-[3px]";

  return (
    <>
      <div className={panelClass} style={{ inset: `0 0 auto 0`, height: top }} />
      <div
        className={panelClass}
        style={{ inset: `${top}px ${window.innerWidth - left}px ${window.innerHeight - bottom}px 0` }}
      />
      <div
        className={panelClass}
        style={{ inset: `${top}px 0 ${window.innerHeight - bottom}px ${right}px` }}
      />
      <div
        className={panelClass}
        style={{ inset: `${bottom}px 0 0 0` }}
      />
    </>
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
  onBack,
  onNext,
  onSkip,
}: TooltipRenderProps & {
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const progress = size > 0 ? ((index + 1) / size) * 100 : 0;
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!continuous) return;

    const frame = requestAnimationFrame(() => {
      nextButtonRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [continuous, index]);

  return (
    <div
      {...tooltipProps}
      style={{
        zIndex: 2147483647,
        pointerEvents: "auto",
      }}
      className="pointer-events-auto w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-cyan-300/50 bg-white text-slate-950 shadow-2xl shadow-black/30 dark:border-cyan-300/60 dark:bg-slate-950 dark:text-slate-50"
    >
      <div className="border-b border-cyan-950/10 bg-cyan-50/70 px-4 pb-3 pt-4 dark:border-cyan-300/20 dark:bg-cyan-950/35">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">
              {index + 1} / {size}
            </p>
            {step.title ? (
              <h2 className="mt-1 text-base font-bold leading-tight text-slate-950 dark:text-white">
                {step.title}
              </h2>
            ) : null}
          </div>
          <button
            {...closeProps}
            type="button"
            onClick={onSkip}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-cyan-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-cyan-900/60 dark:hover:text-white"
          >
            <span aria-hidden="true">x</span>
          </button>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-4 py-4 text-sm leading-6 text-slate-700 dark:text-slate-200">
        {step.content}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
        <button
          {...skipProps}
          type="button"
          onClick={onSkip}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
        >
          {skipProps.title}
        </button>
        <div className="flex items-center gap-2">
          {index > 0 ? (
            <button
              {...backProps}
              type="button"
              onClick={onBack}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {backProps.title}
            </button>
          ) : null}
          {continuous ? (
            <button
              {...primaryProps}
              ref={nextButtonRef}
              type="button"
              autoFocus
              onClick={onNext}
              className="rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 dark:bg-cyan-300 dark:hover:bg-cyan-200"
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
