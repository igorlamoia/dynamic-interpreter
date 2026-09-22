import type { LanguageDNA } from "@/lib/languages-api";
import { t } from "@/i18n";

const DEFAULT_DNA: LanguageDNA = {
  typing: "typed",
  array: "fixed",
  block: "delimited",
  semicolon: "optional-eol",
};

export function normalizeLanguageDNA(
  dna?: Partial<LanguageDNA> | null,
): LanguageDNA {
  return { ...DEFAULT_DNA, ...dna };
}

export function getLanguageDNAChips(
  dna?: Partial<LanguageDNA> | null,
  locale?: string,
): string[] {
  const normalized = normalizeLanguageDNA(dna);
  return [
    normalized.typing === "typed"
      ? t(locale, "ui.language_dna_typed")
      : t(locale, "ui.language_dna_untyped"),
    normalized.array === "fixed"
      ? t(locale, "ui.language_dna_fixed_arrays")
      : t(locale, "ui.language_dna_dynamic_arrays"),
    normalized.block === "delimited"
      ? t(locale, "ui.language_dna_delimited_blocks")
      : t(locale, "ui.language_dna_indentation_blocks"),
    normalized.semicolon === "required"
      ? t(locale, "ui.language_dna_required_terminator")
      : t(locale, "ui.language_dna_optional_terminator"),
  ];
}
