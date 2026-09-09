import { GripVertical, X } from "lucide-react";
import type { ExerciseListItem } from "@/types/api";

export function ExerciseRow({
  item,
  index,
  onRemove,
}: {
  item: ExerciseListItem;
  index: number;
  onRemove: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 px-6 py-3.5 border-b border-border last:border-0 hover:bg-accent/70 transition-colors dark:border-white/5 dark:hover:bg-white/2">
      <GripVertical className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0 cursor-grab" />
      <span className="text-xs font-mono text-muted-foreground w-6 text-right shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="flex-1 text-sm text-foreground truncate">
        {item.exercise.title}
      </span>
      <button
        onClick={onRemove}
        className="shrink-0 p-1.5 rounded-lg text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 dark:hover:text-red-400"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}
