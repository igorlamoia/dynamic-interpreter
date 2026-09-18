import {
  Code2,
  GitCompareArrows,
  Repeat,
  Sigma,
  Terminal,
  Type,
  type LucideIcon,
} from "lucide-react";

export type PreviewCategory = {
  key: "tipos" | "entrada" | "lacos" | "fluxo" | "operadores" | "estrutura";
  title: string;
  subtitle: string;
  lexemes: string[];
  icon: LucideIcon;
};

export const PREVIEW_CATEGORIES: PreviewCategory[] = [
  {
    key: "entrada",
    title: "ENTRADA/SAIDA",
    subtitle: "Leitura e exibição de dados.",
    lexemes: ["print", "scan"],
    icon: Terminal,
  },
  {
    key: "tipos",
    title: "TIPOS E DECLARACOES",
    subtitle: "Valores, tipos e definições principais da linguagem.",
    lexemes: ["int", "float", "bool", "string", "void", "variable", "function"],
    icon: Type,
  },

  {
    key: "estrutura",
    title: "ESTRUTURA",
    subtitle: "Blocos, separadores e terminadores.",
    lexemes: ["{", "}", ";"],
    icon: Code2,
  },

  {
    key: "operadores",
    title: "OPERADORES",
    subtitle: "Palavras e literais que ajudam a compor expressões.",
    lexemes: [
      "and",
      "or",
      "not",
      "less",
      "less_equal",
      "greater",
      "greater_equal",
      "equals",
      "not_equal",
      "true",
      "false",
    ],
    icon: Sigma,
  },
  {
    key: "fluxo",
    title: "FLUXO",
    subtitle:
      "Saídas antecipadas e controle de execução. Regras de decisão e caminhos alternativos.",
    lexemes: [
      "if",
      "else",
      "switch",
      "case",
      "default",
      "break",
      "continue",
      "return",
    ],
    icon: GitCompareArrows,
  },
  {
    key: "lacos",
    title: "LACOS",
    subtitle: "Repetições controladas pela lógica do programa.",
    lexemes: ["for", "while"],
    icon: Repeat,
  },
];
