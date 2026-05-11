import dagre from "dagre";
import type { Edge, Node } from "@xyflow/react";
import type {
  GrammarGraphEdge,
  GrammarGraphModeGuard,
  GrammarGraphNode,
  GrammarGraphNodeKind,
  GrammarGraphSection,
  GrammarModeName,
} from "@ts-compilator-for-java/compiler/grammar/ast/grammarGraph";
import { grammarGraph } from "@ts-compilator-for-java/compiler/grammar/ast/grammarGraph";
import {
  GRAMMAR_GRAPH_LAYOUT,
  GRAMMAR_GRAPH_NODE_SIZE,
} from "./grammarGraphStyles";

export type SelectedGrammarModes = Partial<Record<GrammarModeName, string>>;

export type GrammarGraphViewNode = GrammarGraphNode & {
  active: boolean;
};

export type GrammarGraphViewEdge = {
  id: string;
  source: string;
  target: string;
  label: GrammarGraphEdge["label"];
  active: boolean;
  data: GrammarGraphEdge;
};

export type GrammarGraphModel = {
  startNodeId: string;
  sections: GrammarGraphSection[];
  nodes: GrammarGraphViewNode[];
  edges: GrammarGraphViewEdge[];
  nodeById: Map<string, GrammarGraphViewNode>;
  sectionByNodeId: Map<string, string>;
};

export type GrammarGraphModelFilters = {
  search?: string;
  sectionId?: string;
  kinds?: Set<GrammarGraphNodeKind>;
  selectedModes?: SelectedGrammarModes;
  hideInactive?: boolean;
};

export type GrammarGraphReactFlowNode = Node<
  GrammarGraphViewNode & Record<string, unknown>,
  "grammarNode"
>;

export type GrammarGraphReactFlowEdge = Edge<
  GrammarGraphEdge & { active: boolean } & Record<string, unknown>
>;

export type GrammarGraphReactFlowGraph = {
  nodes: GrammarGraphReactFlowNode[];
  edges: GrammarGraphReactFlowEdge[];
};

export function buildGrammarGraphModel(): GrammarGraphModel {
  return createModel(
    grammarGraph.start,
    grammarGraph.sections.map(copySection),
    grammarGraph.nodes.map((node) => ({ ...copyNode(node), active: true })),
    grammarGraph.edges.map(copyEdge).map(toViewEdge),
  );
}

export function isModeCompatible(
  modes: GrammarGraphModeGuard | undefined,
  selectedModes: SelectedGrammarModes,
): boolean {
  return (
    !modes ||
    (Object.entries(modes) as [GrammarModeName, string][]).every(
      ([key, value]) =>
        selectedModes[key] === undefined || selectedModes[key] === value,
    )
  );
}

export function filterGrammarGraphModel(
  model: GrammarGraphModel,
  filters: GrammarGraphModelFilters,
): GrammarGraphModel {
  const selectedModes = filters.selectedModes;
  const edgeActiveById = new Map(
    model.edges.map((edge) => [
      edge.id,
      selectedModes ? isModeCompatible(edge.data.modes, selectedModes) : true,
    ]),
  );

  const incomingModesByTarget = new Map<
    string,
    (GrammarGraphModeGuard | undefined)[]
  >();
  for (const edge of model.edges) {
    const guards = incomingModesByTarget.get(edge.target) ?? [];
    guards.push(edge.data.modes);
    incomingModesByTarget.set(edge.target, guards);
  }

  const search = filters.search?.trim().toLowerCase();
  const nodes = model.nodes
    .map((node) => ({
      ...node,
      active: selectedModes
        ? isNodeModeCompatible(node, selectedModes, incomingModesByTarget)
        : true,
    }))
    .filter((node) => matchesSearch(node, search))
    .filter(
      (node) =>
        !filters.sectionId ||
        model.sectionByNodeId.get(node.id) === filters.sectionId,
    )
    .filter((node) => !filters.kinds || filters.kinds.has(node.kind))
    .filter((node) => !filters.hideInactive || node.active);

  const visibleNodeIds = new Set(nodes.map((node) => node.id));
  const edges = model.edges
    .filter(
      (edge) =>
        visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
    )
    .map((edge) => ({
      ...edge,
      active: edgeActiveById.get(edge.id) ?? true,
    }))
    .filter((edge) => !filters.hideInactive || edge.active);

  return createModel(model.startNodeId, model.sections, nodes, edges);
}

export function toReactFlowGraph(
  viewModel: GrammarGraphModel,
): GrammarGraphReactFlowGraph {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph(GRAMMAR_GRAPH_LAYOUT);

  for (const node of viewModel.nodes) {
    const size = GRAMMAR_GRAPH_NODE_SIZE[node.kind];
    graph.setNode(node.id, size);
  }

  for (const edge of viewModel.edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  return {
    nodes: viewModel.nodes.map((node) => {
      const size = GRAMMAR_GRAPH_NODE_SIZE[node.kind];
      const position = graph.node(node.id) as
        | { x: number; y: number }
        | undefined;

      return {
        id: node.id,
        type: "grammarNode",
        data: node as GrammarGraphReactFlowNode["data"],
        position: {
          x: (position?.x ?? 0) - size.width / 2,
          y: (position?.y ?? 0) - size.height / 2,
        },
      };
    }),
    edges: viewModel.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: formatGrammarGraphEdgeLabel(edge.data),
      data: {
        ...edge.data,
        active: edge.active,
      } as GrammarGraphReactFlowEdge["data"],
    })),
  };
}

function createModel(
  startNodeId: string,
  sections: GrammarGraphSection[],
  nodes: GrammarGraphViewNode[],
  edges: GrammarGraphViewEdge[],
): GrammarGraphModel {
  return {
    startNodeId,
    sections,
    nodes,
    edges,
    nodeById: new Map(nodes.map((node) => [node.id, node])),
    sectionByNodeId: new Map(
      sections.flatMap((section) =>
        section.nodes.map((nodeId) => [nodeId, section.id] as const),
      ),
    ),
  };
}

function copyModes(
  modes: GrammarGraphModeGuard | undefined,
): GrammarGraphModeGuard | undefined {
  return modes ? { ...modes } : undefined;
}

function copySection(section: GrammarGraphSection): GrammarGraphSection {
  return { ...section, nodes: [...section.nodes] };
}

function copyNode(node: GrammarGraphNode): GrammarGraphNode {
  return {
    ...node,
    productions: node.productions?.map((production) => ({
      ...production,
      modes: copyModes(production.modes),
      symbols: production.symbols.map((symbol) => ({
        ...symbol,
        modes: copyModes(symbol.modes),
      })),
    })),
  };
}

function copyEdge(edge: GrammarGraphEdge): GrammarGraphEdge {
  return { ...edge, modes: copyModes(edge.modes) };
}

function toViewEdge(edge: GrammarGraphEdge): GrammarGraphViewEdge {
  return {
    id: edge.id,
    source: edge.from,
    target: edge.to,
    label: edge.label,
    active: true,
    data: edge,
  };
}

function formatGrammarGraphEdgeLabel(edge: GrammarGraphEdge): string {
  const parts = [edge.production ?? edge.label];

  if (edge.optional) {
    parts.push("optional");
  }

  if (edge.repeat) {
    parts.push(`repeat ${edge.repeat}`);
  }

  const modeLabel = formatModeGuard(edge.modes);
  if (modeLabel) {
    parts.push(modeLabel);
  }

  return parts.join(" | ");
}

function formatModeGuard(
  modes: GrammarGraphModeGuard | undefined,
): string | undefined {
  if (!modes) return undefined;

  const entries = Object.entries(modes) as [GrammarModeName, string][];
  if (entries.length === 0) return undefined;

  return entries.map(([key, value]) => `${key}: ${value}`).join(", ");
}

function matchesSearch(
  node: GrammarGraphViewNode,
  search: string | undefined,
): boolean {
  if (!search) return true;
  return (
    node.id.toLowerCase().includes(search) ||
    node.label.toLowerCase().includes(search)
  );
}

function isNodeModeCompatible(
  node: GrammarGraphViewNode,
  selectedModes: SelectedGrammarModes,
  incomingModeGuardsByNodeId: Map<
    string,
    (GrammarGraphModeGuard | undefined)[]
  >,
): boolean {
  const modeGuards = [
    ...(node.productions ?? []).flatMap((production) => [
      production.modes,
      ...production.symbols.map((symbol) =>
        mergeModeGuards(production.modes, symbol.modes),
      ),
    ]),
    ...(incomingModeGuardsByNodeId.get(node.id) ?? []),
  ];

  return (
    modeGuards.length === 0 ||
    modeGuards.some((modes) => isModeCompatible(modes, selectedModes))
  );
}

function mergeModeGuards(
  productionModes: GrammarGraphModeGuard | undefined,
  symbolModes: GrammarGraphModeGuard | undefined,
): GrammarGraphModeGuard | undefined {
  if (!productionModes && !symbolModes) return undefined;
  return { ...(productionModes ?? {}), ...(symbolModes ?? {}) };
}
