import { TOKENS } from "../../token/constants";
import { Lexer } from "../../lexer";
import { makeRelation } from "../../interpreter/utils";
import { expect, it } from "vitest";

it("should be able to get token id from description or from id", () => {
  expect(TOKENS.BY_DESCRIPTION["plus"]).toBe(1);
  expect(TOKENS.BY_ID[1]).toBe("plus");
});

it("should accept === as strict equality", () => {
  const [token] = new Lexer("===").scanTokens();

  expect(token.type).toBe(TOKENS.RELATIONALS.strict_equal);
  expect(token.lexeme).toBe("===");
});

it("should not accept ==== as a single equality operator", () => {
  const tokens = new Lexer("====").scanTokens();

  expect(tokens.map(({ type, lexeme }) => ({ type, lexeme }))).toEqual([
    { type: TOKENS.RELATIONALS.strict_equal, lexeme: "===" },
    { type: TOKENS.ASSIGNMENTS.equal, lexeme: "=" },
  ]);
});

it("should distinguish value equality from strict equality", () => {
  expect(makeRelation("==", 1, "1")).toBe(true);
  expect(makeRelation("===", 1, "1")).toBe(false);
  expect(makeRelation("===", 1, 1)).toBe(true);
});

it("should include switch/case/default and colon tokens", () => {
  expect(TOKENS.BY_DESCRIPTION["switch"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["case"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["default"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["colon"]).toBeDefined();
});

it("should tokenize the ternary question mark", () => {
  const token = new Lexer("?").scanTokens()[0];

  expect(token.type).toBe(TOKENS.SYMBOLS.question);
});

it("should include boolean reserved tokens", () => {
  expect(TOKENS.BY_DESCRIPTION["bool"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["true"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["false"]).toBeDefined();
});

it("should keep indent and dedent ids distinct from bool and true", () => {
  expect(TOKENS.SYMBOLS.indent).not.toBe(TOKENS.RESERVEDS.bool);
  expect(TOKENS.SYMBOLS.dedent).not.toBe(TOKENS.RESERVEDS.true);
  expect(TOKENS.BY_ID[TOKENS.SYMBOLS.indent]).toBe("indent");
  expect(TOKENS.BY_ID[TOKENS.SYMBOLS.dedent]).toBe("dedent");
});

it("should have no duplicate token IDs across all token groups", () => {
  const allTokens: Record<string, number> = {
    ...TOKENS.ARITHMETICS,
    ...TOKENS.LOGICALS,
    ...TOKENS.RELATIONALS,
    ...TOKENS.ASSIGNMENTS,
    ...TOKENS.RESERVEDS,
    ...TOKENS.SYMBOLS,
    ...TOKENS.LITERALS,
  };
  const seen = new Map<number, string>();
  for (const [name, id] of Object.entries(allTokens)) {
    expect(
      seen.has(id),
      `Token ID ${id} is used by both "${seen.get(id)}" and "${name}"`,
    ).toBe(false);
    seen.set(id, name);
  }
});

it("should keep bracket symbols distinct from literals", () => {
  expect(TOKENS.SYMBOLS.left_bracket).not.toBe(TOKENS.LITERALS.identifier);
  expect(TOKENS.SYMBOLS.right_bracket).not.toBe(TOKENS.LITERALS.string_literal);
  expect(TOKENS.BY_ID[TOKENS.SYMBOLS.left_bracket]).toBe("left_bracket");
  expect(TOKENS.BY_ID[TOKENS.SYMBOLS.right_bracket]).toBe("right_bracket");
});

it("should keep colon and newline symbols distinct from variavel and funcao reserveds", () => {
  expect(TOKENS.SYMBOLS.colon).not.toBe(TOKENS.RESERVEDS.variavel);
  expect(TOKENS.SYMBOLS.newline).not.toBe(TOKENS.RESERVEDS.funcao);
  expect(TOKENS.BY_ID[TOKENS.RESERVEDS.variavel]).toBe("variavel");
  expect(TOKENS.BY_ID[TOKENS.RESERVEDS.funcao]).toBe("funcao");
});

it("should include bracket symbol tokens", () => {
  expect(TOKENS.BY_DESCRIPTION["left_bracket"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["right_bracket"]).toBeDefined();
});
