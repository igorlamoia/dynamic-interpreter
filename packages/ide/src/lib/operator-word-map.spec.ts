import { describe, expect, it } from "vitest";
import { getDefaultKeywordMappings } from "@/contexts/keyword/KeywordContext";
import type { BlockDelimiters } from "@/contexts/keyword/types";
import { validateOperatorWordMap } from "./operator-word-map";
import ui from "@/i18n/locales/pt-BR/ui";

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

    // Mensagem exata do template i18n usado pelo validador (antes: regex em ingles).
    expect(error).toBe(ui.validation_operator_already_used.replace("{value}", "and"));
  });

  it("rejects aliases that collide with customized keywords", () => {
    const error = validateOperatorWordMap(
      { logical_and: "if" },
      getDefaultKeywordMappings(),
      { open: "", close: "" } as BlockDelimiters,
    );

    expect(error).toBe(
      ui.validation_conflicts_keyword_customization.replace("{value}", "if"),
    );
  });
});
