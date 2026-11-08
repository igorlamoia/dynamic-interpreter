"use client";

import { useMemo, useState } from "react";
import dagre from "dagre";
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, ReactFlowProvider, type Edge, type Node, type NodeProps, type NodeTypes } from "@xyflow/react";
import type { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import { buildExecutionGraphModel, type ExecutionGraphNode } from "./executionGraphAdapter";

const NODE_WIDTH = 210;
const NODE_HEIGHT = 82;

export function ExecutionGraphCanvas({ instructions, nextInstructionIndex }: { instructions: Instruction[]; nextInstructionIndex?: number | null }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const model = useMemo(() => buildExecutionGraphModel(instructions), [instructions]);
  const baseFlow = useMemo(() => layoutFlow(model), [model]);
  const flow = useMemo(() => ({ ...baseFlow, nodes: baseFlow.nodes.map((node) => ({ ...node, data: { ...node.data, isNext: (node.data.instructionIndexes as number[]).includes(nextInstructionIndex ?? -1) } })) }), [baseFlow, nextInstructionIndex]);
  const selected = model.nodes.find((node) => node.id === selectedId) ?? null;
  const nodeTypes = useMemo<NodeTypes>(() => ({ executionNode: ExecutionNode }), []);

  if (instructions.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-950 p-3 text-slate-100">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-semibold">Execution flowchart</h3>
          <p className="text-xs text-slate-400">Operations are grouped by source. Select one to inspect its exact intermediate instructions.</p>
        </div>
        {model.diagnostics.length > 0 && <span className="rounded bg-amber-400/15 px-2 py-1 text-xs text-amber-200">{model.diagnostics.length} graph warning{model.diagnostics.length === 1 ? "" : "s"}</span>}
      </div>
      <ReactFlowProvider>
        <div className="h-[560px] overflow-hidden rounded-lg border border-slate-800">
          <ReactFlow nodes={flow.nodes} edges={flow.edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.2 }} minZoom={0.2} maxZoom={1.8} nodesDraggable={false} onNodeClick={(_, node) => setSelectedId(node.id)} proOptions={{ hideAttribution: true }}>
            <Background color="#334155" gap={20} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      {selected && <NodeDetails node={selected} />}
      {model.diagnostics.length > 0 && <ul className="mt-3 space-y-1 text-xs text-amber-200">{model.diagnostics.map((diagnostic, index) => <li key={`${index}-${diagnostic}`}>{diagnostic}</li>)}</ul>}
    </div>
  );
}

function layoutFlow(model: ReturnType<typeof buildExecutionGraphModel>): { nodes: Node[]; edges: Edge[] } {
  const layout = new dagre.graphlib.Graph();
  layout.setDefaultEdgeLabel(() => ({}));
  layout.setGraph({ rankdir: "TB", nodesep: 46, ranksep: 76 });
  model.nodes.forEach((node) => layout.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  model.edges.forEach((edge) => layout.setEdge(edge.source, edge.target));
  dagre.layout(layout);
  return {
    nodes: model.nodes.map((node) => {
      const position = layout.node(node.id);
      return { id: node.id, type: "executionNode", position: { x: (position?.x ?? 0) - NODE_WIDTH / 2, y: (position?.y ?? 0) - NODE_HEIGHT / 2 }, data: node, style: { width: NODE_WIDTH, height: NODE_HEIGHT } };
    }),
    edges: model.edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, label: edge.kind === "fallthrough" ? "" : edge.kind === "return" ? "return" : edge.kind, animated: edge.kind === "jump", style: { stroke: edgeColor(edge.kind), strokeDasharray: edge.deferred ? "5 4" : undefined, strokeWidth: edge.kind === "jump" ? 2 : 1.5 }, labelStyle: { fill: "#cbd5e1", fontSize: 11 }, markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor(edge.kind) } })),
  };
}

function ExecutionNode({ data, selected }: NodeProps<Node<ExecutionGraphNode & { isNext?: boolean }>>) {
  const node = data as ExecutionGraphNode & { isNext?: boolean };
  const isDecision = node.kind === "decision";
  const className = `relative flex h-full w-full items-center justify-center border bg-slate-900 px-5 text-center shadow-lg ${isDecision ? "rotate-45 rounded-xl border-amber-400" : "rounded-xl border-cyan-400"} ${node.isNext ? "ring-2 ring-yellow-300 ring-offset-2 ring-offset-slate-950" : ""} ${selected ? "ring-2 ring-white" : ""}`;
  return <div className={className}>
    <Handle type="target" position={Position.Top} className="!border-0 !bg-transparent opacity-0" />
    <div className={isDecision ? "-rotate-45" : ""}>
      <div className="text-sm font-semibold text-slate-100">{node.label}</div>
      <div className="mt-1 text-[10px] text-slate-400">{node.instructionIndexes.length === 1 ? "1 instruction" : `${node.instructionIndexes.length} instructions`}{node.source ? ` · line ${node.source.line}` : ""}</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!border-0 !bg-transparent opacity-0" />
  </div>;
}

function NodeDetails({ node }: { node: ExecutionGraphNode }) {
  return <div className="mt-3 rounded-md bg-white/5 p-3 text-xs"><div className="font-semibold">{node.label}</div><div className="mt-1 text-slate-400">Instructions: {node.instructionIndexes.map((index) => `#${index + 1}`).join(", ")}</div><div className="mt-2 break-all font-mono text-slate-300">{node.instruction.op} · result: {format(node.instruction.result)} · operand 1: {format(node.instruction.operand1)}</div>{node.source && <div className="mt-1 text-slate-400">Source: line {node.source.line}, column {node.source.column}</div>}</div>;
}

function edgeColor(kind: string): string {
  return ({ true: "#22c55e", false: "#f97316", jump: "#a78bfa", call: "#38bdf8", return: "#94a3b8", fallthrough: "#64748b" } as Record<string, string>)[kind] ?? "#64748b";
}

function format(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}
