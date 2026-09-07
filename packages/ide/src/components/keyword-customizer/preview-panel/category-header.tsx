import { CategoryTone } from ".";
import { CategorySectionProps } from "./category-section";

interface CategoryHeaderProps extends CategorySectionProps {
  tone: CategoryTone;
  isOpen: boolean;
  onToggle: () => void;
}

function ShineBorder({ color }: { color: string }) {
  return (
    <div
      className={`w-1.5 h-14 -ml-1 animate-shine blur-[2px] ${color} opacity-75`}
    />
  );
}
export function CategoryHeader(props: CategoryHeaderProps) {
  const {
    title,
    subtitle,
    icon,
    percentage,
    changedCount,
    items,
    tone,
    isOpen,
    onToggle,
  } = props;
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full flex-col border-b dark:border-slate-800/80 py-2 text-left outline-none"
    >
      <div className="flex items-center gap-3">
        <ShineBorder color={tone.progress} />
        <div className="flex flex-1 flex-col gap-1 pr-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] dark:text-slate-300">
              {title}
            </p>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ${tone.chip}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 px-4 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Alterados {changedCount} de {items.length}
          </span>
          <span className={tone.textChanged}>{percentage}%</span>
        </div>
        <div
          className={`h-1 overflow-hidden rounded-full ${tone.progressTrack}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${tone.progress}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </button>
  );
}
