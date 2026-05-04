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
