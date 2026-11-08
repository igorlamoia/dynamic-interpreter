import { buildControlFlowGraph, type ControlFlowEdgeKind } from "@ts-compilator-for-java/compiler/ir/control-flow";
import type { Instruction, SourceLocation } from "@ts-compilator-for-java/compiler/interpreter/constants";

export type ExecutionNodeKind = "entry" | "operation" | "decision" | "input-output" | "exit";

export type ExecutionGraphNode = {
  id: string;
  instructionIndexes: number[];
  instruction: Instruction;
  kind: ExecutionNodeKind;
  label: string;
  source?: SourceLocation;
};

export type ExecutionGraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: ControlFlowEdgeKind;
  deferred?: boolean;
};

export type ExecutionGraphModel = {
  nodes: ExecutionGraphNode[];
  edges: ExecutionGraphEdge[];
  diagnostics: string[];
};

/**
 * Converts exact IR control flow into a student-facing flowchart. Adjacent
 * instructions are grouped only when they have the same compiler source key;
 * the raw instruction indexes stay on every node for faithful inspection.
 */
export function buildExecutionGraphModel(instructions: Instruction[]): ExecutionGraphModel {
  const raw = buildControlFlowGraph(instructions, "execution");
  const groupByInstruction = new Map<number, string>();
  const nodes: ExecutionGraphNode[] = [];

  for (let index = 0; index < instructions.length;) {
    const instruction = instructions[index];
    if (instruction.op === "LABEL") {
      index++;
      continue;
    }
    const indexes = [index];
    const key = sourceKey(instruction.source);
    let next = index + 1;
    while (key && next < instructions.length && instructions[next].op !== "LABEL" && sourceKey(instructions[next].source) === key) {
      indexes.push(next++);
    }
    const id = `operation:${index}`;
    indexes.forEach((instructionIndex) => groupByInstruction.set(instructionIndex, id));
    const representative = selectRepresentative(indexes.map((instructionIndex) => instructions[instructionIndex]));
    nodes.push({
      id,
      instructionIndexes: indexes,
      instruction: representative,
      kind: nodeKind(representative),
      label: nodeLabel(representative),
      source: instruction.source,
    });
    index = next;
  }

  const visibleNodeAt = (start: number): string | undefined => {
    for (let index = start; index < instructions.length; index++) {
      const id = groupByInstruction.get(index);
      if (id) return id;
    }
    return undefined;
  };
  const edgeKeys = new Set<string>();
  const edges: ExecutionGraphEdge[] = [];
  for (const edge of raw.edges) {
    const source = groupByInstruction.get(edge.from);
    const target = visibleNodeAt(edge.to);
    if (!source || !target || source === target) continue;
    const key = `${source}:${target}:${edge.kind}:${edge.deferred ?? false}`;
    if (edgeKeys.has(key)) continue;
    edgeKeys.add(key);
    edges.push({ id: key, source, target, kind: edge.kind, deferred: edge.deferred });
  }

  return { nodes, edges, diagnostics: raw.diagnostics.map((diagnostic) => diagnostic.message) };
}

function sourceKey(source: SourceLocation | undefined): string | undefined {
  if (!source) return undefined;
  return source.statementId ?? `${source.file ?? ""}:${source.line}:${source.column}`;
}

function selectRepresentative(instructions: Instruction[]): Instruction {
  return instructions.find((instruction) => ["IF", "JUMP", "RETURN", "CALL"].includes(instruction.op)) ?? instructions[0];
}

function nodeKind(instruction: Instruction): ExecutionNodeKind {
  if (instruction.op === "IF") return "decision";
  if (instruction.op === "RETURN" || (instruction.op === "CALL" && instruction.result.toUpperCase() === "STOP")) return "exit";
  if (instruction.op === "CALL" && ["PRINT", "SCAN"].includes(instruction.result.toUpperCase())) return "input-output";
  return "operation";
}

function nodeLabel(instruction: Instruction): string {
  if (instruction.op === "IF") return "Is the condition true?";
  if (instruction.op === "JUMP") return "Continue flow";
  if (instruction.op === "RETURN") return "Return";
  if (instruction.op === "DECLARE" || instruction.op === "DECLARE_ARRAY") return `Create ${instruction.result}`;
  if (instruction.op === "=") return `Set ${instruction.result}`;
  if (instruction.op === "CALL") {
    if (instruction.result.toUpperCase() === "PRINT") return "Show output";
    if (instruction.result.toUpperCase() === "SCAN") return "Read input";
    if (instruction.result.toUpperCase() === "STOP") return "End program";
    return `Call ${instruction.result}`;
  }
  return `${instruction.op} ${instruction.result}`.trim();
}
