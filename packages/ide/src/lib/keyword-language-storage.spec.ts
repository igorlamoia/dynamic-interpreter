// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import {
  loadActiveSavedKeywordLanguage,
  loadSavedKeywordLanguage,
  listSavedKeywordLanguages,
  saveSavedKeywordLanguage,
  slugifyLanguageName,
  type SavedKeywordLanguage,
} from "./keyword-language-storage";

function createSavedLanguage(
  overrides: Partial<SavedKeywordLanguage> = {},
): SavedKeywordLanguage {
  return {
    name: "Didatica Neon",
    slug: "didatica-neon",
    imageUrl: "https://images.example/neon.png",
    imageQuery: "neon language",
    presetId: "didactic-pt",
    customization: getDefaultCustomizationState(),
    ...overrides,
  };
}

describe("keyword-language-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("slugifies the language name for localStorage keys", () => {
    expect(slugifyLanguageName("  Minha Linguagem++  ")).toBe(
      "minha-linguagem",
    );
    expect(slugifyLanguageName("JAVA   MM")).toBe("java-mm");
  });

  it("persists the saved language in the registry, active key, and runtime customization", () => {
    const savedLanguage = createSavedLanguage();

    saveSavedKeywordLanguage(savedLanguage);

    expect(loadSavedKeywordLanguage(savedLanguage.slug)).toEqual(savedLanguage);
    expect(loadActiveSavedKeywordLanguage()).toEqual(savedLanguage);
    expect(listSavedKeywordLanguages()).toEqual([
      {
        name: savedLanguage.name,
        slug: savedLanguage.slug,
        imageUrl: savedLanguage.imageUrl,
      },
    ]);
    expect(
      JSON.parse(localStorage.getItem("keyword-customization") ?? "null"),
    ).toEqual(savedLanguage.customization);
    expect(localStorage.getItem("keyword-customization-active")).toBe(
      savedLanguage.slug,
    );
  });

  it("upserts registry entries by slug instead of duplicating them", () => {
    saveSavedKeywordLanguage(createSavedLanguage());
    saveSavedKeywordLanguage(
      createSavedLanguage({
        name: "Didatica Neon Reloaded",
        imageUrl: "https://images.example/reloaded.png",
      }),
    );

    expect(listSavedKeywordLanguages()).toEqual([
      {
        name: "Didatica Neon Reloaded",
        slug: "didatica-neon",
        imageUrl: "https://images.example/reloaded.png",
      },
    ]);
    expect(loadSavedKeywordLanguage("didatica-neon")?.name).toBe(
      "Didatica Neon Reloaded",
    );
  });

  it("trims and persists a language description when provided", () => {
    const savedLanguage = createSavedLanguage({
      description: "  Linguagem para aulas de logica.  ",
    });

    saveSavedKeywordLanguage(savedLanguage);

    expect(loadSavedKeywordLanguage(savedLanguage.slug)?.description).toBe(
      "Linguagem para aulas de logica.",
    );
  });

  it("filters corrupt registry entries and invalid active languages", () => {
    const validLanguage = createSavedLanguage({
      name: "Mineres Craft",
      slug: "mineres-craft",
    });

    localStorage.setItem(
      "keyword-customization-index",
      JSON.stringify([
        { name: validLanguage.name, slug: validLanguage.slug, imageUrl: "" },
        { name: "Broken", slug: "broken", imageUrl: "" },
      ]),
    );
    localStorage.setItem(
      `keyword-customization-${validLanguage.slug}`,
      JSON.stringify(validLanguage),
    );
    localStorage.setItem("keyword-customization-broken", "{not-json");
    localStorage.setItem("keyword-customization-active", "broken");

    expect(listSavedKeywordLanguages()).toEqual([
      {
        name: validLanguage.name,
        slug: validLanguage.slug,
        imageUrl: "",
      },
    ]);
    expect(loadSavedKeywordLanguage("broken")).toBeNull();
    expect(loadActiveSavedKeywordLanguage()).toBeNull();
  });
});
