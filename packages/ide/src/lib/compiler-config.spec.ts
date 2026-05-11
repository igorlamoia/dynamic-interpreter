import { describe, expect, it } from "vitest";
import { normalizeCompilerConfig } from "./compiler-config";

describe("normalizeCompilerConfig", () => {
  it("defaults to delimited + optional-eol", () => {
    const normalized = normalizeCompilerConfig({});

    expect(normalized.grammar).toEqual({
      semicolonMode: "optional-eol",
      blockMode: "delimited",
      typingMode: "typed",
      arrayMode: "fixed",
    });
    expect(normalized.indentationBlock).toBe(false);
    expect(normalized.blockDelimiters).toBeUndefined();
  });

  it("forces indentationBlock=true and strips delimiters in indentation mode", () => {
    const normalized = normalizeCompilerConfig({
      indentationBlock: false,
      blockDelimiters: { open: "begin", close: "end" },
      grammar: { semicolonMode: "required", blockMode: "indentation" },
    });

    expect(normalized.indentationBlock).toBe(true);
    expect(normalized.blockDelimiters).toBeUndefined();
  });

  it("preserves grammar from UI payload when present", () => {
    const normalized = normalizeCompilerConfig({
      grammar: {
        semicolonMode: "required",
        blockMode: "delimited",
        typingMode: "untyped",
        arrayMode: "dynamic",
      },
    });

    expect(normalized.grammar.semicolonMode).toBe("required");
    expect(normalized.grammar.typingMode).toBe("untyped");
    expect(normalized.grammar.arrayMode).toBe("dynamic");
  });

  it("preserves arrayMode when valid in typed mode", () => {
    const normalized = normalizeCompilerConfig({
      grammar: {
        typingMode: "typed",
        arrayMode: "dynamic",
      },
    });

    expect(normalized.grammar.arrayMode).toBe("dynamic");
  });

  it("preserves fixed arrayMode in untyped mode", () => {
    const normalized = normalizeCompilerConfig({
      grammar: {
        typingMode: "untyped",
        arrayMode: "fixed",
      },
    });

    expect(normalized.grammar.typingMode).toBe("untyped");
    expect(normalized.grammar.arrayMode).toBe("fixed");
  });

  it("preserves operator word aliases in the normalized payload", () => {
    const normalized = normalizeCompilerConfig({
      operatorWordMap: {
        logical_and: "and",
        less_equal: "less_equal",
      },
    });

    expect(normalized.operatorWordMap).toEqual({
      logical_and: "and",
      less_equal: "less_equal",
    });
  });

  it("preserves boolean literal aliases in the normalized payload", () => {
    const normalized = normalizeCompilerConfig({
      booleanLiteralMap: {
        true: "verdadeiro",
        false: "falso",
      },
    });

    expect(normalized.booleanLiteralMap).toEqual({
      true: "verdadeiro",
      false: "falso",
    });
  });

  it("trims boolean literal aliases and drops empty values", () => {
    const normalized = normalizeCompilerConfig({
      booleanLiteralMap: {
        true: "  sim  ",
        false: "   ",
      },
    });

    expect(normalized.booleanLiteralMap).toEqual({
      true: "sim",
    });
  });

  it("normalizes statement terminator lexeme", () => {
    const normalized = normalizeCompilerConfig({
      statementTerminatorLexeme: " !! ",
      grammar: { semicolonMode: "required" },
    });

    expect(normalized.statementTerminatorLexeme).toBe("!!");
    expect(normalized.grammar.semicolonMode).toBe("required");
  });

  it("omits semicolon statement terminator because it is built in", () => {
    const normalized = normalizeCompilerConfig({
      statementTerminatorLexeme: " ; ",
      grammar: { semicolonMode: "required" },
    });

    expect(normalized.statementTerminatorLexeme).toBeUndefined();
    expect(normalized.grammar.semicolonMode).toBe("required");
  });

  it("preserves language documentation entries in the normalized payload", () => {
    const normalized = normalizeCompilerConfig({
      languageDocumentation: {
        "keyword.print": { description: "Exibe valores" },
      },
    } as never);

    expect((normalized as never).languageDocumentation).toEqual({
      "keyword.print": { description: "Exibe valores" },
    });
  });
});
