import { describe, expect, it } from "vitest";
import { buildControlFlowGraph } from "../../ir/control-flow";
import type { Instruction } from "../../interpreter/constants";

const instruction = (op: Instruction["op"], result: string, operand1: unknown = null, operand2: unknown = null): Instruction => ({ op, result, operand1, operand2 });

describe("buildControlFlowGraph", () => {
  it("keeps both conditional outcomes and the loop back edge", () => {
    const graph = buildControlFlowGraph([
      instruction("LABEL", "main"),
      instruction("IF", "condition", "body", "end"),
      instruction("LABEL", "body"),
      instruction("JUMP", "main"),
      instruction("LABEL", "end"),
      instruction("RETURN", "null"),
    ], "loop");

    expect(graph.edges.map(({ from, to, kind }) => ({ from, to, kind }))).toEqual(expect.arrayContaining([
      { from: 1, to: 2, kind: "true" },
      { from: 1, to: 4, kind: "false" },
      { from: 3, to: 0, kind: "jump" },
    ]));
    expect(graph.diagnostics).toEqual([]);
  });

  it("does not invent edges for missing labels or returns", () => {
    const graph = buildControlFlowGraph([
      instruction("JUMP", "missing"),
      instruction("RETURN", "null"),
    ]);

    expect(graph.edges).toEqual([]);
    expect(graph.diagnostics[0]).toMatchObject({ index: 0, message: expect.stringContaining("missing") });
  });

  it("represents user calls and their continuation separately", () => {
    const graph = buildControlFlowGraph([
      instruction("LABEL", "main"),
      instruction("CALL", "helper", [], "value"),
      instruction("RETURN", "null"),
      instruction("LABEL", "helper"),
      instruction("RETURN", "null"),
    ]);

    expect(graph.edges).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: 1, to: 3, kind: "call" }),
      expect.objectContaining({ from: 1, to: 2, kind: "return", deferred: true }),
    ]));
  });
});
