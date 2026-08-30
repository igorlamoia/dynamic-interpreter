import { describe, expect, it } from "vitest";
import { getDefaultKeywordMappings } from "@/contexts/keyword/KeywordContext";
import type { BlockDelimiters } from "@/contexts/keyword/types";
import { validateOperatorWordMap } from "./operator-word-map";

describe("operator word alias validation", () => {
  it("accepts ç and Ç in aliases", () => {
    const error = validateOperatorWordMap(
      { logical_and: "maçcaÇ" },
      getDefaultKeywordMappings(),
      { open: "", close: "" },
    );

    expect(error).toBeNull();
  });

  it("rejects duplicate operator aliases", () => {
    const error = validateOperatorWordMap(
      { logical_and: "and", logical_or: "and" },
      getDefaultKeywordMappings(),
      { open: "", close: "" },
    );

    expect(error).toMatch(/already|duplicate/i);
  });

  it("rejects aliases that collide with customized keywords", () => {
    const error = validateOperatorWordMap(
      { logical_and: "if" },
      getDefaultKeywordMappings(),
      { open: "", close: "" } as BlockDelimiters,
    );

    expect(error).toMatch(/keyword|conflict/i);
  });
});
