import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { WizardPresetId } from "@/components/keyword-customizer/wizard-model";

export const ACTIVE_KEYWORD_CUSTOMIZATION_STORAGE_KEY =
  "keyword-customization";
export const SAVED_KEYWORD_LANGUAGE_INDEX_STORAGE_KEY =
  "keyword-customization-index";
export const ACTIVE_SAVED_KEYWORD_LANGUAGE_STORAGE_KEY =
  "keyword-customization-active";
export const SAVED_KEYWORD_LANGUAGE_STORAGE_PREFIX = "keyword-customization-";

export type SavedKeywordLanguageIndexEntry = {
  name: string;
  slug: string;
  imageUrl: string;
};

export type SavedKeywordLanguage = {
  name: string;
  slug: string;
  description?: string;
  imageUrl: string;
  imageQuery: string;
  presetId: WizardPresetId;
  customization: StoredKeywordCustomization;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStoredKeywordCustomization(
  value: unknown,
): value is StoredKeywordCustomization {
  if (!isRecord(value)) return false;

  return (
    Array.isArray(value.mappings) &&
    isRecord(value.operatorWordMap) &&
    isRecord(value.booleanLiteralMap) &&
    typeof value.statementTerminatorLexeme === "string" &&
    isRecord(value.blockDelimiters) &&
    isRecord(value.modes) &&
    isRecord(value.languageDocumentation)
  );
}

function isSavedKeywordLanguage(value: unknown): value is SavedKeywordLanguage {
  if (!isRecord(value)) return false;

  return (
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    typeof value.imageUrl === "string" &&
    typeof value.imageQuery === "string" &&
    typeof value.presetId === "string" &&
    isStoredKeywordCustomization(value.customization)
  );
}

function isSavedKeywordLanguageIndexEntry(
  value: unknown,
): value is SavedKeywordLanguageIndexEntry {
  if (!isRecord(value)) return false;

  return (
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    typeof value.imageUrl === "string"
  );
}

function safeParseJson(value: string | null): unknown {
  if (!value) return null;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function slugifyLanguageName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSavedKeywordLanguageStorageKey(slug: string): string {
  return `${SAVED_KEYWORD_LANGUAGE_STORAGE_PREFIX}${slug}`;
}

export function loadSavedKeywordLanguage(slug: string): SavedKeywordLanguage | null {
  if (typeof window === "undefined" || !slug) return null;

  const parsed = safeParseJson(
    localStorage.getItem(getSavedKeywordLanguageStorageKey(slug)),
  );

  return isSavedKeywordLanguage(parsed) ? parsed : null;
}

export function loadActiveSavedKeywordLanguage(): SavedKeywordLanguage | null {
  if (typeof window === "undefined") return null;

  const activeSlug = localStorage.getItem(ACTIVE_SAVED_KEYWORD_LANGUAGE_STORAGE_KEY);
  if (!activeSlug) return null;

  return loadSavedKeywordLanguage(activeSlug);
}

export function listSavedKeywordLanguages(): SavedKeywordLanguageIndexEntry[] {
  if (typeof window === "undefined") return [];

  const parsed = safeParseJson(
    localStorage.getItem(SAVED_KEYWORD_LANGUAGE_INDEX_STORAGE_KEY),
  );
  if (!Array.isArray(parsed)) return [];

  const entries = parsed.filter(isSavedKeywordLanguageIndexEntry);
  const dedupedEntries = new Map<string, SavedKeywordLanguageIndexEntry>();

  for (const entry of entries) {
    if (!loadSavedKeywordLanguage(entry.slug)) continue;
    dedupedEntries.set(entry.slug, entry);
  }

  return Array.from(dedupedEntries.values());
}

export function saveSavedKeywordLanguage(
  language: SavedKeywordLanguage,
): SavedKeywordLanguage {
  const slug = slugifyLanguageName(language.slug || language.name);
  const normalizedLanguage: SavedKeywordLanguage = {
    ...language,
    slug,
    ...(language.description === undefined
      ? {}
      : { description: language.description.trim() }),
  };

  if (typeof window === "undefined") {
    return normalizedLanguage;
  }

  localStorage.setItem(
    getSavedKeywordLanguageStorageKey(slug),
    JSON.stringify(normalizedLanguage),
  );

  const nextRegistryEntries = [
    ...listSavedKeywordLanguages().filter((entry) => entry.slug !== slug),
    {
      name: normalizedLanguage.name,
      slug,
      imageUrl: normalizedLanguage.imageUrl,
    },
  ];

  localStorage.setItem(
    SAVED_KEYWORD_LANGUAGE_INDEX_STORAGE_KEY,
    JSON.stringify(nextRegistryEntries),
  );
  localStorage.setItem(
    ACTIVE_KEYWORD_CUSTOMIZATION_STORAGE_KEY,
    JSON.stringify(normalizedLanguage.customization),
  );
  localStorage.setItem(ACTIVE_SAVED_KEYWORD_LANGUAGE_STORAGE_KEY, slug);

  return normalizedLanguage;
}

export function setActiveSavedKeywordLanguage(slug: string): boolean {
  if (typeof window === "undefined") return false;

  const language = loadSavedKeywordLanguage(slug);
  if (!language) return false;

  localStorage.setItem(ACTIVE_SAVED_KEYWORD_LANGUAGE_STORAGE_KEY, slug);
  localStorage.setItem(
    ACTIVE_KEYWORD_CUSTOMIZATION_STORAGE_KEY,
    JSON.stringify(language.customization),
  );

  return true;
}
