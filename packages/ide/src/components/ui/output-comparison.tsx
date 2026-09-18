"use client";

import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type LineDiff =
  | { type: "equal"; line: string }
  | { type: "remove"; line: string }
  | { type: "add"; line: string };

type CharPart = { kind: "equal" | "highlight"; text: string };

type RenderLine =
  | { type: "equal"; line: string }
  | { type: "remove"; line: string; parts: CharPart[] | null }
  | { type: "add"; line: string; parts: CharPart[] | null };

// ── LCS ───────────────────────────────────────────────────────────────────────

function buildDpTable<T>(
  a: T[],
  b: T[],
  eq: (x: T, y: T) => boolean,
): number[][] {
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = eq(a[i - 1], b[j - 1])
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp;
}

// ── Line-level diff ────────────────────────────────────────────────────────────

function computeLineDiff(expected: string, actual: string): LineDiff[] {
  const a = expected.split("\n");
  const b = actual.split("\n");
  const dp = buildDpTable(a, b, (x, y) => x === y);

  const result: LineDiff[] = [];
  let i = a.length,
    j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: "equal", line: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "add", line: b[j - 1] });
      j--;
    } else {
      result.unshift({ type: "remove", line: a[i - 1] });
      i--;
    }
  }
  return result;
}

// ── Char-level diff (for paired remove/add lines) ─────────────────────────────

function computeCharParts(
  a: string,
  b: string,
): { removeParts: CharPart[]; addParts: CharPart[] } {
  const ac = a.split("");
  const bc = b.split("");
  const dp = buildDpTable(ac, bc, (x, y) => x === y);

  type Op = { type: "equal" | "remove" | "add"; char: string };
  const ops: Op[] = [];
  let i = ac.length,
    j = bc.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && ac[i - 1] === bc[j - 1]) {
      ops.unshift({ type: "equal", char: ac[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: "add", char: bc[j - 1] });
      j--;
    } else {
      ops.unshift({ type: "remove", char: ac[i - 1] });
      i--;
    }
  }

  const removeParts: CharPart[] = [];
  const addParts: CharPart[] = [];

  function push(arr: CharPart[], kind: "equal" | "highlight", char: string) {
    if (arr.length && arr[arr.length - 1].kind === kind)
      arr[arr.length - 1].text += char;
    else arr.push({ kind, text: char });
  }

  for (const op of ops) {
    if (op.type === "equal") {
      push(removeParts, "equal", op.char);
      push(addParts, "equal", op.char);
    } else if (op.type === "remove") {
      push(removeParts, "highlight", op.char);
    } else {
      push(addParts, "highlight", op.char);
    }
  }

  return { removeParts, addParts };
}

// ── Pair remove/add blocks and attach char parts ───────────────────────────────

function buildRenderLines(lineDiff: LineDiff[]): RenderLine[] {
  const result: RenderLine[] = [];
  let i = 0;

  while (i < lineDiff.length) {
    const entry = lineDiff[i];

    if (entry.type === "equal") {
      result.push({ type: "equal", line: entry.line });
      i++;
      continue;
    }

    if (entry.type === "add") {
      result.push({ type: "add", line: entry.line, parts: null });
      i++;
      continue;
    }

    // Collect a contiguous block of removes then adds
    const removes: string[] = [];
    while (i < lineDiff.length && lineDiff[i].type === "remove") {
      removes.push(lineDiff[i].line);
      i++;
    }
    const adds: string[] = [];
    while (i < lineDiff.length && lineDiff[i].type === "add") {
      adds.push(lineDiff[i].line);
      i++;
    }

    const pairCount = Math.min(removes.length, adds.length);

    for (let k = 0; k < removes.length; k++) {
      if (k < pairCount) {
        const { removeParts } = computeCharParts(removes[k], adds[k]);
        result.push({ type: "remove", line: removes[k], parts: removeParts });
      } else {
        result.push({ type: "remove", line: removes[k], parts: null });
      }
    }

    for (let k = 0; k < adds.length; k++) {
      if (k < pairCount) {
        const { addParts } = computeCharParts(removes[k], adds[k]);
        result.push({ type: "add", line: adds[k], parts: addParts });
      } else {
        result.push({ type: "add", line: adds[k], parts: null });
      }
    }
  }

  return result;
}

// ── Render helpers ─────────────────────────────────────────────────────────────

function LineContent({
  line,
  parts,
  isRemove,
}: {
  line: string;
  parts: CharPart[] | null;
  isRemove: boolean;
}) {
  if (!parts) return <>{line}</>;

  return (
    <>
      {parts.map((part, idx) =>
        part.kind === "highlight" ? (
          <span
            key={idx}
            className={cn(
              "rounded-[2px]",
              isRemove ? "bg-emerald-400/25" : "bg-red-400/25",
            )}
          >
            {part.text}
          </span>
        ) : (
          <span key={idx}>{part.text}</span>
        ),
      )}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface OutputComparisonProps {
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  className?: string;
}

export function OutputComparison({
  expectedOutput,
  actualOutput,
  passed,
  className,
}: OutputComparisonProps) {
  const lineDiff = computeLineDiff(
    expectedOutput || "(vazio)",
    actualOutput || "(vazio)",
  );
  const renderLines = buildRenderLines(lineDiff);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-lg border border-border font-mono text-xs dark:border-white/10",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-1.5 dark:border-white/10">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
          <span className="text-emerald-400/70">
            <span className="font-bold mr-1">−</span>esperada
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-red-400/70">
            <span className="font-bold mr-1">+</span>real
          </span>
        </div>
        <span
          className={cn(
            "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
            passed
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-red-400 bg-red-500/10",
          )}
        >
          {passed ? "idêntico" : "diferente"}
        </span>
      </div>

      {/* Diff body */}
      <div className="bg-card/80 dark:bg-[#0d1117]">
        {renderLines.map((entry, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-start leading-5",
              entry.type === "remove" && "bg-emerald-500/10",
              entry.type === "add" && "bg-red-500/10",
            )}
          >
            {/* Sign gutter */}
            <span
              className={cn(
                "w-6 shrink-0 select-none border-r py-0.5 text-center text-[11px]",
                entry.type === "remove" &&
                  "border-emerald-500/20 bg-emerald-500/20 text-emerald-400",
                entry.type === "add" &&
                  "border-red-500/20 bg-red-500/20 text-red-400",
                entry.type === "equal" &&
                  "dark:border-white/5 bg-transparent text-slate-700",
              )}
            >
              {entry.type === "remove" ? "−" : entry.type === "add" ? "+" : " "}
            </span>

            {/* Line content */}
            <span
              className={cn(
                "px-3 py-0.5 whitespace-pre-wrap break-all",
                entry.type === "remove" && "text-emerald-300",
                entry.type === "add" && "text-red-300",
                entry.type === "equal" && "text-slate-500",
              )}
            >
              {entry.type === "equal" ? (
                entry.line
              ) : (
                <LineContent
                  line={entry.line}
                  parts={entry.parts}
                  isRemove={entry.type === "remove"}
                />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
