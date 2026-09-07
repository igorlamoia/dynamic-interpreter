import { useState } from "react";
import { LucideIcon } from "lucide-react";
import { CategoryLexemeItem, CategoryTone } from ".";
import { CategoryHeader } from "./category-header";

function resolveKeywordSemanticToken(original: string): SemanticToken {
  const TYPES = new Set([
    "int",
    "float",
    "bool",
    "string",
    "void",
    "variable",
    "function",
  ]);
  const CONDITIONALS = new Set(["if", "else", "switch", "case", "default"]);
  const LOOPS = new Set(["for", "while"]);
  const FLOW = new Set(["break", "continue", "return"]);
  const IO = new Set(["print", "scan"]);
  const BLOCK_DELIMITERS = new Set(["{", "}"]);
  const STATEMENT_TERMINATORS = new Set([";"]);
  const BOOLEAN_LITERALS = new Set(["true", "false"]);
  const OPERATOR_WORDS = new Set([
    "and",
    "or",
    "not",
    "less",
    "less_equal",
    "greater",
    "greater_equal",
    "equals",
    "not_equal",
  ]);

  if (TYPES.has(original)) return "keyword.type";
  if (CONDITIONALS.has(original)) return "keyword.conditional";
  if (LOOPS.has(original)) return "keyword.loop";
  if (FLOW.has(original)) return "keyword.flow";
  if (IO.has(original)) return "keyword.io";
  if (BLOCK_DELIMITERS.has(original)) return "keyword.block-delimiter";
  if (STATEMENT_TERMINATORS.has(original))
    return "keyword.statement-terminator";
  if (BOOLEAN_LITERALS.has(original)) return "keyword.boolean-literal";
  if (OPERATOR_WORDS.has(original)) return "keyword.operator-word";

  return "keyword";
}

type SemanticToken =
  | "keyword.type"
  | "keyword.conditional"
  | "keyword.loop"
  | "keyword.flow"
  | "keyword.io"
  | "keyword"
  | "keyword.block-delimiter"
  | "keyword.statement-terminator"
  | "keyword.boolean-literal"
  | "keyword.operator-word";

function resolveCategoryTone(token: SemanticToken): CategoryTone {
  switch (token) {
    case "keyword.type":
      return {
        chip: "bg-cyan-400/15 text-cyan-300 ring-cyan-400/30",
        progress: "bg-cyan-400",
        progressTrack: "bg-cyan-400/15",
        borderChanged:
          "border-cyan-400/65 shadow-[0_0_0_0px_rgba(34,211,238,0.35),0_0_10px_-10px_rgba(34,211,238,0.9)]",
        textChanged: "text-cyan-300",
        line: "bg-cyan-400/45",
      };
    case "keyword.io":
      return {
        chip: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
        progress: "bg-emerald-400",
        progressTrack: "bg-emerald-400/15",
        borderChanged:
          "border-emerald-400/65 shadow-[0_0_0_0px_rgba(52,211,153,0.35),0_0_10px_-10px_rgba(52,211,153,0.9)]",
        textChanged: "text-emerald-300",
        line: "bg-emerald-400/45",
      };
    case "keyword.conditional":
      return {
        chip: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
        progress: "bg-amber-400",
        progressTrack: "bg-amber-400/15",
        borderChanged:
          "border-amber-400/65 shadow-[0_0_0_0px_rgba(251,191,36,0.35),0_0_10px_-10px_rgba(251,191,36,0.9)]",
        textChanged: "text-amber-300",
        line: "bg-amber-400/45",
      };
    case "keyword.loop":
      return {
        chip: "bg-pink-400/15 text-pink-300 ring-pink-400/30",
        progress: "bg-pink-400",
        progressTrack: "bg-pink-400/15",
        borderChanged:
          "border-pink-400/65 shadow-[0_0_0_10x_rgba(244,114,182,0.35),0_0_10px_-10px_rgba(244,114,182,0.9)]",
        textChanged: "text-pink-300",
        line: "bg-pink-400/45",
      };
    case "keyword.flow":
      return {
        chip: "bg-violet-400/15 text-violet-300 ring-violet-400/30",
        progress: "bg-violet-400",
        progressTrack: "bg-violet-400/15",
        borderChanged:
          "border-violet-400/65 shadow-[0_0_0_10x_rgba(196,181,253,0.35),0_0_10px_-10px_rgba(196,181,253,0.9)]",
        textChanged: "text-violet-300",
        line: "bg-violet-400/45",
      };
    case "keyword.operator-word":
      return {
        chip: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
        progress: "bg-sky-400",
        progressTrack: "bg-sky-400/15",
        borderChanged:
          "border-sky-400/65 shadow-[0_0_0_10x_rgba(125,211,252,0.35),0_0_10px_-10px_rgba(125,211,252,0.9)]",
        textChanged: "text-sky-300",
        line: "bg-sky-400/45",
      };
    case "keyword.boolean-literal":
      return {
        chip: "bg-lime-400/15 text-lime-300 ring-lime-400/30",
        progress: "bg-lime-400",
        progressTrack: "bg-lime-400/15",
        borderChanged:
          "border-lime-400/65 shadow-[0_0_0_0px_rgba(163,230,53,0.35),0_0_10px_-10px_rgba(163,230,53,0.9)]",
        textChanged: "text-lime-300",
        line: "bg-lime-400/45",
      };
    case "keyword.block-delimiter":
    case "keyword.statement-terminator":
      return {
        chip: "bg-slate-400/15 text-slate-300 ring-slate-400/30",
        progress: "bg-slate-300",
        progressTrack: "bg-slate-400/15",
        borderChanged:
          "border-slate-300/70 shadow-[0_0_0_0.2px_rgba(203,213,225,0.3),0_0_14px_-9px_rgba(203,213,225,0.8)]",
        textChanged: "text-slate-200",
        line: "bg-slate-400/45",
      };
    default:
      return {
        chip: "bg-slate-400/15 text-slate-300 ring-slate-400/30",
        progress: "bg-slate-300",
        progressTrack: "bg-slate-400/15",
        borderChanged:
          "border-slate-300/70 shadow-[0_0_0_0.2px_rgba(203,213,225,0.3),0_0_14px_-9px_rgba(203,213,225,0.8)]",
        textChanged: "text-slate-200",
        line: "bg-slate-400/45",
      };
  }
}

export interface CategorySectionProps {
  title: string;
  subtitle: string;
  items: CategoryLexemeItem[];
  changedCount: number;
  percentage: number;
  icon: LucideIcon;
}
export function CategorySection(props: CategorySectionProps) {
  const { items } = props;
  const token = resolveKeywordSemanticToken(items[0]?.original ?? "");
  const tone = resolveCategoryTone(token);
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen((current) => !current);
  };

  return (
    <div className="rounded-sm border border-slate-400/75 dark:bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.96),rgba(15,23,42,0.99))] shadow-[0_24px_70px_-44px_rgba(2,6,23,0.9)] dark:border-slate-800">
      <CategoryHeader
        {...props}
        tone={tone}
        isOpen={isOpen}
        onToggle={handleToggle}
      />

      {(true || isOpen) && (
        <div className="flex flex-col gap-0">
          {items.map((item) => (
            <div
              key={item.original}
              className={`my-0.5 px-4 py-2 backdrop-blur-sm transition-all ${
                item.isChanged
                  ? `${tone.borderChanged} dark:bg-slate-950/45`
                  : "border-slate-700/60 dark:bg-slate-950/35"
              }`}
            >
              <div className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] items-center gap-3">
                <span className="truncate text-sm font-medium dark:text-slate-200">
                  {item.original}
                </span>

                <div className={`h-px w-full rounded-full ${tone.line}`} />

                <span
                  className={`truncate text-sm font-semibold ${
                    item.isChanged ? tone.textChanged : "text-slate-400"
                  }`}
                >
                  {item.custom}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
