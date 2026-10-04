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
        <>
          <TutorialBlurBackdrop step={activeTutorial.steps[stepIndex]} />
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
              overlayColor: "rgba(2, 6, 23, 0.86)",
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
            tooltipComponent={TutorialTooltip}
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

    const updateRect = () => {
      const target = document.querySelector(targetSelector);

      if (!target) {
        setRect(null);
        return;
      }

      setRect(target.getBoundingClientRect());
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateRect);
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      cancelAnimationFrame(frame);
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
  const panelClass = "pointer-events-none fixed z-[9999] backdrop-blur-[3px]";

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
}: TooltipRenderProps) {
  const progress = size > 0 ? ((index + 1) / size) * 100 : 0;

  return (
    <div
      {...tooltipProps}
      className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-cyan-300/50 bg-white text-slate-950 shadow-2xl shadow-black/30 dark:border-cyan-300/60 dark:bg-slate-950 dark:text-slate-50"
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
          className="text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
        >
          {skipProps.title}
        </button>
        <div className="flex items-center gap-2">
          {index > 0 ? (
            <button
              {...backProps}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {backProps.title}
            </button>
          ) : null}
          {continuous ? (
            <button
              {...primaryProps}
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
