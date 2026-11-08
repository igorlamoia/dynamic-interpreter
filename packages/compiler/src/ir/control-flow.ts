import type { Instruction } from "../interpreter/constants";

export type ControlFlowEdgeKind =
  | "fallthrough"
  | "true"
  | "false"
  | "jump"
  | "call"
  | "return";

export interface ControlFlowNode {
  id: string;
  index: number;
  instruction: Instruction;
}

export interface ControlFlowEdge {
  id: string;
  from: number;
  to: number;
  kind: ControlFlowEdgeKind;
  /** Present for user function calls; execution reaches it after RETURN. */
  deferred?: boolean;
}

export interface ControlFlowDiagnostic {
  index: number;
  message: string;
}

export interface ControlFlowGraph {
  nodes: ControlFlowNode[];
  edges: ControlFlowEdge[];
  diagnostics: ControlFlowDiagnostic[];
}

/**
 * Builds the control-flow relation used by the interpreter without making any
 * rendering assumptions.  IDs are deliberately local to this compilation;
 * runtime visits must use a separate identity because loops revisit nodes.
 */
export function buildControlFlowGraph(
  instructions: readonly Instruction[],
  compilationId = "program",
): ControlFlowGraph {
  const labels = new Map<string, number>();
  const diagnostics: ControlFlowDiagnostic[] = [];
  const edges: ControlFlowEdge[] = [];

  instructions.forEach((instruction, index) => {
    if (instruction.op !== "LABEL") return;
    if (labels.has(instruction.result)) {
      diagnostics.push({ index, message: `Label '${instruction.result}' is defined more than once.` });
      return;
    }
    labels.set(instruction.result, index);
  });

  const addEdge = (
    from: number,
    to: number | undefined,
    kind: ControlFlowEdgeKind,
    label?: string,
    deferred?: boolean,
  ) => {
    if (to === undefined) {
      diagnostics.push({ index: from, message: `Instruction ${from} references missing label '${label ?? ""}'.` });
      return;
    }
    edges.push({ id: `${compilationId}:${from}:${kind}:${edges.length}`, from, to, kind, deferred });
  };
  const addFallthrough = (index: number) => {
    if (index + 1 < instructions.length) addEdge(index, index + 1, "fallthrough");
  };

  instructions.forEach((instruction, index) => {
    if (instruction.op === "IF") {
      addEdge(index, labels.get(String(instruction.operand1)), "true", String(instruction.operand1));
      addEdge(index, labels.get(String(instruction.operand2)), "false", String(instruction.operand2));
      return;
    }
    if (instruction.op === "JUMP") {
      addEdge(index, labels.get(instruction.result), "jump", instruction.result);
      return;
    }
    if (instruction.op === "RETURN" || (instruction.op === "CALL" && instruction.result.toUpperCase() === "STOP")) return;
    if (instruction.op === "CALL" && !["PRINT", "SCAN"].includes(instruction.result.toUpperCase())) {
      addEdge(index, labels.get(instruction.result), "call", instruction.result);
      if (index + 1 < instructions.length) addEdge(index, index + 1, "return", undefined, true);
      return;
    }
    addFallthrough(index);
  });

  return {
    nodes: instructions.map((instruction, index) => ({ id: `${compilationId}:${index}`, index, instruction })),
    edges,
    diagnostics,
  };
}
