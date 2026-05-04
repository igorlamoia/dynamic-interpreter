import { describe, expect, it } from "vitest";
import { grammarGraph } from "@ts-compilator-for-java/compiler/grammar/ast/grammarGraph";
import {
  buildGrammarGraphModel,
  filterGrammarGraphModel,
  type GrammarGraphModel,
  isModeCompatible,
  toReactFlowGraph,
  type SelectedGrammarModes,
} from "./grammarGraphAdapter";

const typedDelimitedModes: SelectedGrammarModes = {
  typingMode: "typed",
  blockMode: "delimited",
  semicolonMode: "required",
  arrayMode: "fixed",
};

describe("buildGrammarGraphModel", () => {
  it("uses the real compiler grammar graph", () => {
    const model = buildGrammarGraphModel();

    expect(model.startNodeId).toBe(grammarGraph.start);
    expect(model.nodes.length).toBe(grammarGraph.nodes.length);
    expect(model.edges.length).toBe(grammarGraph.edges.length);
    expect(model.nodeById.get(grammarGraph.start)?.label).toBe("<program>");
  });

  it("maps section membership by node id", () => {
    const model = buildGrammarGraphModel();

    expect(model.sectionByNodeId.get("stmt")).toBe("statements");
    expect(model.sections.map((section) => section.id)).toContain("topLevel");
  });
});

describe("isModeCompatible", () => {
  it("keeps unguarded graph items active", () => {
    expect(isModeCompatible(undefined, typedDelimitedModes)).toBe(true);
  });

  it("marks matching guarded graph items active", () => {
    expect(
      isModeCompatible({ typingMode: "typed" }, typedDelimitedModes),
    ).toBe(true);
  });

  it("marks conflicting guarded graph items inactive", () => {
    expect(
      isModeCompatible({ typingMode: "untyped" }, typedDelimitedModes),
    ).toBe(false);
  });

  it("treats unselected mode keys as neutral", () => {
    expect(isModeCompatible({ blockMode: "delimited" }, { typingMode: "typed" }))
      .toBe(true);
  });
});

describe("filterGrammarGraphModel", () => {
  it("searches by node id or label", () => {
    const model = buildGrammarGraphModel();

    const byId = filterGrammarGraphModel(model, { search: "stmt" });
    const byLabel = filterGrammarGraphModel(model, { search: "<program>" });

    expect(byId.nodes.some((node) => node.id === "stmt")).toBe(true);
    expect(byLabel.nodes.map((node) => node.id)).toContain("program");
  });

  it("filters by section and kind", () => {
    const model = buildGrammarGraphModel();

    const filtered = filterGrammarGraphModel(model, {
      sectionId: "statements",
      kinds: new Set(["nonterminal"]),
    });

    expect(filtered.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining(["stmt", "stmtTerminator"]),
    );
    expect(filtered.nodes.every((node) => node.kind === "nonterminal")).toBe(
      true,
    );
  });

  it("filters by section membership from the graph sections", () => {
    const model = buildGrammarGraphModel();
    const sectionOnlyModel: GrammarGraphModel = {
      ...model,
      sections: [
        ...model.sections,
        {
          id: "sectionMembershipOnly",
          label: "Section Membership",
          nodes: ["stmt"],
        },
      ],
      sectionByNodeId: new Map([
        ...model.sectionByNodeId,
        ["stmt", "sectionMembershipOnly"],
      ]),
    };

    const filtered = filterGrammarGraphModel(sectionOnlyModel, {
      sectionId: "sectionMembershipOnly",
    });

    expect(filtered.nodes.map((node) => node.id)).toEqual(["stmt"]);
  });

  it("keeps conflicting mode items visible but inactive by default", () => {
    const model = buildGrammarGraphModel();

    const filtered = filterGrammarGraphModel(model, {
      selectedModes: typedDelimitedModes,
    });

    const untypedNode = filtered.nodes.find(
      (node) => node.id === "untypedFunctionDecl",
    );
    const untypedEdge = filtered.edges.find(
      (edge) => edge.data.modes?.typingMode === "untyped",
    );

    expect(untypedNode?.active).toBe(false);
    expect(untypedEdge?.active).toBe(false);
  });

  it("does not deactivate graph items guarded only by unselected modes", () => {
    const model = buildGrammarGraphModel();

    const filtered = filterGrammarGraphModel(model, {
      selectedModes: { typingMode: "typed" },
    });

    const delimitedBlockEdge = filtered.edges.find(
      (edge) => edge.data.modes?.blockMode === "delimited",
    );

    expect(delimitedBlockEdge?.active).toBe(true);
  });

  it("keeps nodes with unguarded productions active when guarded productions conflict", () => {
    const model = buildGrammarGraphModel();
    const stmtTerminator = model.nodeById.get("stmtTerminator");
    expect(stmtTerminator).toBeDefined();

    const stmtTerminatorOnlyModel: GrammarGraphModel = {
      ...model,
      sections: [
        {
          id: "statements",
          label: "Statements",
          nodes: ["stmtTerminator"],
        },
      ],
      nodes: [stmtTerminator!],
      edges: [],
      nodeById: new Map([["stmtTerminator", stmtTerminator!]]),
      sectionByNodeId: new Map([["stmtTerminator", "statements"]]),
    };

    const filtered = filterGrammarGraphModel(stmtTerminatorOnlyModel, {
      selectedModes: { semicolonMode: "required" },
    });

    expect(filtered.nodeById.get("stmtTerminator")?.active).toBe(true);
  });
});

describe("toReactFlowGraph", () => {
  it("converts view nodes and edges to React Flow data", () => {
    const model = buildGrammarGraphModel();
    const filtered = filterGrammarGraphModel(model, {
      selectedModes: typedDelimitedModes,
    });

    const graph = toReactFlowGraph(filtered);

    expect(graph.nodes.length).toBe(filtered.nodes.length);
    expect(graph.edges.length).toBe(filtered.edges.length);
    expect(graph.nodes[0].position).toEqual(
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    );
    expect(graph.nodes.find((node) => node.id === "program")?.type).toBe(
      "grammarNode",
    );
    expect(graph.edges[0].data).toEqual(
      expect.objectContaining({ production: expect.any(String) }),
    );
    expect(
      graph.edges.find((edge) => edge.data?.active === false)?.data?.active,
    ).toBe(false);
  });
});
