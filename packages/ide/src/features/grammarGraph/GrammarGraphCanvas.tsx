"use client";

import React, { useCallback, useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { cn } from "@/lib/utils";
import {
  toReactFlowGraph,
  type GrammarGraphModel,
  type GrammarGraphReactFlowNode,
  type GrammarGraphViewNode,
} from "./grammarGraphAdapter";
import {
  GRAMMAR_GRAPH_DEFAULT_ACCENT,
  GRAMMAR_GRAPH_GROUP_ACCENTS,
  GRAMMAR_GRAPH_KIND_STYLES,
} from "./grammarGraphStyles";

export type GrammarGraphCanvasProps = {
  model: GrammarGraphModel;
  onSelectNode?: (node: GrammarGraphViewNode) => void;
};

export function GrammarGraphCanvas({
  model,
  onSelectNode,
}: GrammarGraphCanvasProps) {
  const graph = useMemo(() => toReactFlowGraph(model), [model]);

  const nodes = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        style: {
          opacity: node.data.active ? 1 : 0.38,
        },
      })),
    [graph.nodes],
  );

  const edges = useMemo(
    () =>
      graph.edges.map((edge) => {
        const edgeData = edge.data;

        return {
          ...edge,
          animated: edgeData?.repeat === "+",
          style: {
            opacity:
              edgeData?.active === false
                ? 0.32
                : edgeData?.modes
                  ? 0.74
                  : 0.92,
            stroke: edgeData?.modes ? "#f59e0b" : "#64748b",
            strokeWidth: 1.5,
          },
        };
      }),
    [graph.edges],
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: GrammarGraphReactFlowNode) => {
      onSelectNode?.(node.data as GrammarGraphViewNode);
    },
    [onSelectNode],
  );

  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      grammarNode: (props: NodeProps<GrammarGraphReactFlowNode>) => (
        <GrammarNode {...props} startNodeId={model.startNodeId} />
      ),
    }),
    [model.startNodeId],
  );

  if (model.nodes.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 px-6 text-center">
        <div>
          <p className="text-sm font-medium text-slate-200">
            No grammar nodes match the current filters.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Adjust search, sections, node kinds, or mode filters to restore the
            graph.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-[640px] min-h-[420px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.2}
          maxZoom={1.8}
          nodesDraggable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#334155" gap={24} size={1} />
          <MiniMap
            nodeColor={(node) =>
              getGroupAccent((node.data as GrammarGraphViewNode).group)
            }
            nodeStrokeWidth={3}
            pannable
            zoomable
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

function GrammarNode({
  data,
  selected,
  startNodeId,
}: NodeProps<GrammarGraphReactFlowNode> & { startNodeId: string }) {
  const viewNode = data as GrammarGraphViewNode;
  const kindStyles = GRAMMAR_GRAPH_KIND_STYLES[viewNode.kind];
  const productionCount = viewNode.productions?.length ?? 0;
  const accent = getGroupAccent(viewNode.group);

  return (
    <div
      className={cn(
        "relative w-full rounded-md border bg-slate-950/95 p-2.5 text-left shadow-lg shadow-black/20 ring-1 ring-slate-900",
        kindStyles.border,
        selected && "ring-2 ring-cyan-300",
        !viewNode.active && "grayscale",
      )}
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-transparent opacity-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-transparent opacity-0"
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-mono text-sm font-semibold text-slate-100">
            {viewNode.label}
          </div>
          <div className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
            {viewNode.id}
          </div>
        </div>
        {viewNode.id === startNodeId ? (
          <span className="shrink-0 rounded bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-cyan-100 ring-1 ring-cyan-300/25">
            Start
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ring-1",
            kindStyles.badge,
          )}
        >
          {viewNode.kind}
        </span>
        <span className="truncate text-[11px] text-slate-500">
          {productionCount === 1
            ? "1 production"
            : `${productionCount} productions`}
        </span>
      </div>
    </div>
  );
}

function getGroupAccent(group: string): string {
  return (
    GRAMMAR_GRAPH_GROUP_ACCENTS[
      group as keyof typeof GRAMMAR_GRAPH_GROUP_ACCENTS
    ] ?? GRAMMAR_GRAPH_DEFAULT_ACCENT
  );
}
