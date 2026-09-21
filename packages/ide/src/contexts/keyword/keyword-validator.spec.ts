import { describe, expect, it } from "vitest";
import ui from "@/i18n/locales/pt-BR/ui";
import { validateBlockDelimiters } from "./keyword-validator";

describe("keyword-validator", () => {
  it("accepts symbolic block delimiters", () => {
    expect(validateBlockDelimiters({ open: "{", close: "}" })).toBeNull();
  });

  it("rejects block delimiters with spaces", () => {
    expect(validateBlockDelimiters({ open: "begin block", close: "end" })).toBe(
      ui.validation_invalid_delimiter_format,
    );
  });
});
