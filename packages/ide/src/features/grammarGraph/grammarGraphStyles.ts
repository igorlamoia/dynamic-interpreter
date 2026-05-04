export const GRAMMAR_GRAPH_NODE_SIZE = {
  nonterminal: { width: 190, height: 72 },
  terminal: { width: 110, height: 44 },
  option: { width: 150, height: 56 },
  mode: { width: 150, height: 56 },
} as const;

export const GRAMMAR_GRAPH_LAYOUT = {
  rankdir: "LR",
  nodesep: 42,
  ranksep: 86,
} as const;

export const GRAMMAR_GRAPH_KIND_STYLES = {
  nonterminal: {
    badge: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
    border: "border-sky-400/30",
  },
  terminal: {
    badge: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
    border: "border-emerald-400/30",
  },
  option: {
    badge: "bg-amber-500/15 text-amber-100 ring-amber-400/25",
    border: "border-amber-400/30",
  },
  mode: {
    badge: "bg-fuchsia-500/15 text-fuchsia-100 ring-fuchsia-400/25",
    border: "border-fuchsia-400/30",
  },
} as const;

export const GRAMMAR_GRAPH_GROUP_ACCENTS = {
  topLevel: "#38bdf8",
  declarations: "#a78bfa",
  statements: "#f59e0b",
  expressions: "#22c55e",
  values: "#fb7185",
  tokens: "#94a3b8",
  options: "#e879f9",
  modes: "#60a5fa",
} as const;

export const GRAMMAR_GRAPH_DEFAULT_ACCENT = "#64748b";
