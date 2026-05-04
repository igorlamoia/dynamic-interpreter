import { describe, expect, it } from "vitest";
import { grammarGraph } from "@ts-compilator-for-java/compiler/grammar/ast/grammarGraph";
import {
  buildGrammarGraphModel,
  filterGrammarGraphModel,
  isModeCompatible,
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
});
