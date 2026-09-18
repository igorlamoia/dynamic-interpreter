import type { ReactNode } from "react";
import { CodeScrollArea } from "@/components/ui/code-scroll-area";

export type OptionCardIconColor =
  | "cyan"
  | "emerald"
  | "violet"
  | "amber"
  | "rose"
  | "slate";

const ICON_COLOR_CLASSES: Record<OptionCardIconColor, string> = {
  cyan: "bg-cyan-100/70 text-cyan-700 ring-cyan-300/60 dark:bg-cyan-900/30 dark:text-cyan-300 dark:ring-cyan-500/40",
  emerald:
    "bg-emerald-100/70 text-emerald-700 ring-emerald-300/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-500/40",
  violet:
    "bg-violet-100/70 text-violet-700 ring-violet-300/60 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-500/40",
  amber:
    "bg-amber-100/70 text-amber-700 ring-amber-300/60 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-500/40",
  rose: "bg-rose-100/70 text-rose-700 ring-rose-300/60 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-500/40",
  slate:
    "bg-slate-100/80 text-slate-700 ring-slate-300/70 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-600/60",
};

const DEFAULT_CARD_SHADOW = "0 18px 50px -34px rgba(0, 0, 0, 0.98)";

const SELECTED_CARD_SHADOWS: Record<OptionCardIconColor, string> = {
  cyan: "0 0 0 1px rgba(34, 211, 238, 0.28), 0 0 34px -10px rgba(6, 182, 212, 0.48), 0 22px 48px -30px rgba(2, 6, 23, 0.92)",
  emerald:
    "0 0 0 1px rgba(52, 211, 153, 0.3), 0 0 34px -10px rgba(16, 185, 129, 0.46), 0 22px 48px -30px rgba(2, 6, 23, 0.92)",
  violet:
    "0 0 0 1px rgba(167, 139, 250, 0.3), 0 0 34px -10px rgba(139, 92, 246, 0.48), 0 22px 48px -30px rgba(2, 6, 23, 0.92)",
  amber:
    "0 0 0 1px rgba(251, 191, 36, 0.3), 0 0 34px -10px rgba(245, 158, 11, 0.5), 0 22px 48px -30px rgba(2, 6, 23, 0.92)",
  rose: "0 0 0 1px rgba(251, 113, 133, 0.3), 0 0 34px -10px rgba(244, 63, 94, 0.48), 0 22px 48px -30px rgba(2, 6, 23, 0.92)",
  slate:
    "0 0 0 1px rgba(148, 163, 184, 0.28), 0 0 32px -12px rgba(100, 116, 139, 0.42), 0 22px 48px -30px rgba(2, 6, 23, 0.92)",
};

export type OptionCardIconProps = {
  icon?: ReactNode | string;
  color?: OptionCardIconColor;
  size?: "sm" | "md" | "lg";
};

export function OptionCardIcon({
  icon,
  color = "cyan",
  size = "lg",
}: OptionCardIconProps) {
  const sizes = {
    sm: "h-6 w-6 p-1",
    md: "h-8 w-8 p-1",
    lg: "h-10 w-10 p-1",
  };
  return (
    <span
      className={[
        "flex " +
          sizes[size] +
          " shrink-0 items-center justify-center rounded-md ring-1",
        ICON_COLOR_CLASSES[color],
      ].join(" ")}
    >
      {typeof icon === "string" ? (
        <span className="text-sm font-mono">{icon}</span>
      ) : (
        (icon ?? <span className="h-2 w-2 rounded-md bg-current" />)
      )}
    </span>
  );
}

type OptionCardProps = {
  title: string;
  subtitle?: string;
  description: string;
  icon?: ReactNode;
  iconColor?: OptionCardIconColor;
  snippet?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
};

export function OptionCard({
  title,
  subtitle,
  description,
  icon,
  iconColor = "cyan",
  snippet,
  selected = false,
  disabled = false,
  onClick,
  children,
}: OptionCardProps) {
  const boxShadow = selected
    ? SELECTED_CARD_SHADOWS[iconColor]
    : DEFAULT_CARD_SHADOW;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{ boxShadow }}
      className={[
        "group relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl border dark:border-white/8 dark:bg-[#0E1629]/95 p-5 text-left transition-all backdrop-blur-xl",
        "dark:border-white/6 dark:bg-[#0B1020]/96",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-br before:from-white/4 before:via-transparent before:to-primary/20 dark:before:to-black/20 before:opacity-90 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
        "after:pointer-events-none after:absolute after:-left-12 after:top-4 after:h-28 after:w-28 after:rounded-full after:bg-white/3 after:blur-3xl after:transition-transform after:duration-500 group-hover:after:translate-x-2 group-hover:after:-translate-y-1",
        "dark:after:bg-slate-500/6",
        selected
          ? "outline-none dark:border-white/12 ring-0"
          : "ring-1 ring-white/6 dark:shadow-[0_10px_24px_-18px_rgba(0,0,0,0.6)]",
        disabled
          ? "cursor-not-allowed opacity-50"
          : selected
            ? "cursor-pointer hover:dark:border-white/14 hover:ring-0"
            : "cursor-pointer hover:dark:border-white/12 hover:ring-white/10 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.75)]",
      ].join(" ")}
    >
      <div className="relative z-10 flex items-center gap-3">
        <OptionCardIcon icon={icon} color={iconColor} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] dark:text-slate-400">
          {subtitle ?? "Esqueceu de mim"}
        </p>
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-semibold leading-tight dark:text-slate-100">
          {title}
        </p>
      </div>
      {snippet && (
        <CodeScrollArea className="relative z-10 rounded-xl bg-card/40 dark:bg-[#0a1020]/80 ring-1 ring-black/8 dark:ring-white/8">
          <pre className="w-max min-w-full px-3 py-2 font-mono text-sm text-slate-200">
            <code>{snippet}</code>
          </pre>
        </CodeScrollArea>
      )}
      <p className="relative z-10 text-sm leading-5 text-slate-400">
        {description}
      </p>
      {children}
    </button>
  );
}
