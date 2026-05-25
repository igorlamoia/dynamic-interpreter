import type { DebugSnapshot } from "@ts-compilator-for-java/compiler/interpreter/constants";
import type { ReactNode } from "react";
import {
  CircleDot,
  LogIn,
  LogOut,
  Pause,
  Play,
  RotateCcw,
  Square,
  StepForward,
} from "lucide-react";

export interface DebugPanelProps {
  breakpoints?: number[];
  boundBreakpoints?: number[];
  unboundBreakpoints?: number[];
  snapshot?: DebugSnapshot | null;
  error?: string | null;
  isStale?: boolean;
  onStart?: () => void;
  onContinue?: () => void;
  onStepInto?: () => void;
  onStepOver?: () => void;
  onStepOut?: () => void;
  onRestart?: () => void;
  onStop?: () => void;
}

const buttonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/10 bg-white/70 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10";

const sectionClass = "border-t border-black/10 px-3 py-3 dark:border-white/10";

export function DebugPanel({
  breakpoints = [],
  boundBreakpoints = [],
  unboundBreakpoints = [],
  snapshot = null,
  error = null,
  isStale = false,
  onStart,
  onContinue,
  onStepInto,
  onStepOver,
  onStepOut,
  onRestart,
  onStop,
}: DebugPanelProps) {
  const status = snapshot?.status ?? "idle";
  const displayError = error ?? snapshot?.error;
  const breakpointRows = buildBreakpointRows(
    breakpoints,
    boundBreakpoints,
    unboundBreakpoints,
  );
  const canResume =
    snapshot?.status === "paused" || snapshot?.status === "waiting-for-input";

  return (
    <aside className="flex h-full min-h-0 flex-col bg-white/65 text-xs text-slate-800 dark:bg-slate-950/35 dark:text-slate-100">
      <header className="flex shrink-0 items-center justify-between gap-2 px-3 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
            <CircleDot className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
            <span>Debug</span>
          </div>
          <div className="mt-1 truncate text-[11px] text-muted-foreground">
            {status}
            {snapshot?.stopReason ? ` · ${snapshot.stopReason}` : ""}
            {isStale ? " · stale" : ""}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <DebugButton label="Start debug" onClick={onStart}>
            <Play className="h-3.5 w-3.5" />
          </DebugButton>
          <DebugButton
            label="Continue"
            onClick={onContinue}
            disabled={!canResume}
          >
            {snapshot?.status === "waiting-for-input" ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <StepForward className="h-3.5 w-3.5" />
            )}
          </DebugButton>
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-1 px-3 pb-3">
        <DebugButton label="Step into" onClick={onStepInto} disabled={!canResume}>
          <LogIn className="h-3.5 w-3.5" />
        </DebugButton>
        <DebugButton label="Step over" onClick={onStepOver} disabled={!canResume}>
          <StepForward className="h-3.5 w-3.5" />
        </DebugButton>
        <DebugButton label="Step out" onClick={onStepOut} disabled={!canResume}>
          <LogOut className="h-3.5 w-3.5" />
        </DebugButton>
        <DebugButton label="Restart" onClick={onRestart}>
          <RotateCcw className="h-3.5 w-3.5" />
        </DebugButton>
        <DebugButton label="Stop" onClick={onStop} disabled={!snapshot}>
          <Square className="h-3.5 w-3.5" />
        </DebugButton>
      </div>

      {displayError && (
        <div className="mx-3 mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-700 dark:text-red-200">
          {displayError}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <PanelSection title="Breakpoints">
          {breakpointRows.length === 0 ? (
            <EmptyState>No breakpoints</EmptyState>
          ) : (
            <div className="space-y-1">
              {breakpointRows.map(({ line, state }) => (
                <div
                  className="flex items-center justify-between gap-2 rounded-md bg-slate-950/[0.04] px-2 py-1.5 dark:bg-white/[0.06]"
                  key={`${line}-${state}`}
                >
                  <span>Line {line}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {state}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PanelSection>

        <PanelSection title="Variables">
          {snapshot?.variables.length ? (
            <div className="space-y-1">
              {snapshot.variables.map((variable) => (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md bg-slate-950/[0.04] px-2 py-1.5 dark:bg-white/[0.06]"
                  key={`${variable.scope}-${variable.name}`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{variable.name}</div>
                    <div className="truncate text-[10px] text-muted-foreground">
                      {variable.scope} · {variable.type}
                    </div>
                  </div>
                  <code className="max-w-24 truncate rounded bg-black/5 px-1.5 py-0.5 text-[11px] dark:bg-white/10">
                    {formatValue(variable.value)}
                  </code>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No variables</EmptyState>
          )}
        </PanelSection>

        <PanelSection title="Call Stack">
          {snapshot?.callStack.length ? (
            <div className="space-y-1">
              {snapshot.callStack.map((frame, index) => (
                <div
                  className="flex items-center justify-between gap-2 rounded-md bg-slate-950/[0.04] px-2 py-1.5 dark:bg-white/[0.06]"
                  key={`${frame.name}-${frame.returnAddress}-${index}`}
                >
                  <span className="truncate">{frame.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    #{frame.returnAddress}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No stack frames</EmptyState>
          )}
        </PanelSection>
      </div>
    </aside>
  );
}

function DebugButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function PanelSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className={sectionClass}>
      <h3 className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="text-[11px] text-muted-foreground">{children}</div>;
}

function buildBreakpointRows(
  breakpoints: number[],
  boundBreakpoints: number[],
  unboundBreakpoints: number[],
) {
  const rows = new Map<number, "bound" | "unbound">();

  for (const line of breakpoints) rows.set(line, "bound");
  for (const line of boundBreakpoints) rows.set(line, "bound");
  for (const line of unboundBreakpoints) rows.set(line, "unbound");

  return [...rows.entries()]
    .sort(([left], [right]) => left - right)
    .map(([line, state]) => ({ line, state }));
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
