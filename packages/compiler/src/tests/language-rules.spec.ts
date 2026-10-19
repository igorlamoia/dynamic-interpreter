import { describe, expect, it } from "vitest";
import { getCompilerLanguageRules } from "../language-rules";

function flattenRules() {
  return getCompilerLanguageRules().flatMap((section) => section.items);
}

describe("accepted language rules", () => {
  it("keeps compiler rules independent from the selected language", () => {
    const rules = flattenRules();

    expect(rules.some((rule) => rule.id === "main")).toBe(true);
    expect(rules.some((rule) => rule.id === "typed-functions")).toBe(true);
    expect(rules.some((rule) => rule.id === "untyped-functions")).toBe(true);
    expect(rules.some((rule) => rule.id === "fixed-arrays")).toBe(true);
    expect(rules.some((rule) => rule.id === "dynamic-arrays")).toBe(true);
  });

  it("groups common, typed, and untyped compiler rules", () => {
    const sections = getCompilerLanguageRules();

    expect(sections.map((section) => section.id)).toEqual(
      expect.arrayContaining(["common", "typed", "untyped"]),
    );
  });
});
