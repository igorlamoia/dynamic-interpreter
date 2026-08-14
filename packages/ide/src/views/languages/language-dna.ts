import type { LanguageDNA } from "@/lib/languages-api";

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
): string[] {
  const normalized = normalizeLanguageDNA(dna);
  return [
    normalized.typing === "typed" ? "Tipada" : "Não tipada",
    normalized.array === "fixed" ? "Arrays fixos" : "Arrays dinâmicos",
    normalized.block === "delimited"
      ? "Blocos delimitados"
      : "Blocos indentados",
    normalized.semicolon === "required"
      ? "Terminador obrigatório"
      : "Terminador opcional",
  ];
}
