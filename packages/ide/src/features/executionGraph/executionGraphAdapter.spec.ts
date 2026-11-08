import { describe, expect, it } from "vitest";
import { buildExecutionGraphModel } from "./executionGraphAdapter";
import type { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";

const instruction = (op: Instruction["op"], result: string, operand1: unknown = null, operand2: unknown = null, source?: Instruction["source"]): Instruction => ({ op, result, operand1, operand2, source });

describe("buildExecutionGraphModel", () => {
  it("groups adjacent IR from one source operation and hides labels", () => {
    const model = buildExecutionGraphModel([
      instruction("LABEL", "main"),
      instruction("DECLARE", "count", "int", null, { line: 2, column: 3 }),
      instruction("=", "count", "0", null, { line: 2, column: 3 }),
      instruction("RETURN", "null"),
    ]);

    expect(model.nodes).toHaveLength(2);
    expect(model.nodes[0]).toMatchObject({ label: "Create count", instructionIndexes: [1, 2] });
  });

  it("preserves true, false, and loop edges between visible operations", () => {
    const model = buildExecutionGraphModel([
      instruction("LABEL", "main"),
      instruction("IF", "condition", "body", "end", { line: 2, column: 3 }),
      instruction("LABEL", "body"),
      instruction("CALL", "PRINT", "ok", null, { line: 3, column: 3 }),
      instruction("JUMP", "main", null, null, { line: 4, column: 3 }),
      instruction("LABEL", "end"),
      instruction("RETURN", "null"),
    ]);

    expect(model.edges.map((edge) => edge.kind)).toEqual(expect.arrayContaining(["true", "false", "jump"]));
    expect(model.nodes.find((node) => node.kind === "decision")?.label).toBe("Is the condition true?");
  });
});
