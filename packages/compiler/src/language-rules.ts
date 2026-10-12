export type LanguageRuleMode = "common" | "typed" | "untyped";

export type LanguageRuleItem = {
  id: string;
  text: string;
  mode: LanguageRuleMode;
};

export type LanguageRuleSection = {
  id: string;
  title: string;
  items: LanguageRuleItem[];
};

export const COMPILER_LANGUAGE_RULES: LanguageRuleSection[] = [
  {
    id: "common",
    title: "Common compiler rules",
    items: [
      {
        id: "main",
        mode: "common",
        text: "Program execution starts at a main function.",
      },
      {
        id: "expressions",
        mode: "common",
        text: "Expressions support arithmetic, relational, logical, assignment, function call, and array access operations.",
      },
      {
        id: "control-flow",
        mode: "common",
        text: "The compiler accepts if/else, switch/case/default, for, while, break, continue, and return.",
      },
      {
        id: "io",
        mode: "common",
        text: "print writes output and scan reads input.",
      },
      {
        id: "switch-fallthrough",
        mode: "common",
        text: "switch uses fallthrough: a case continues into the next case until break or the switch ends.",
      },
    ],
  },
  {
    id: "typed",
    title: "Typed mode rules",
    items: [
      {
        id: "typed-functions",
        mode: "typed",
        text: "Functions declare a return type: int, float, bool, string, or void.",
      },
      {
        id: "typed-variables",
        mode: "typed",
        text: "Variables declare a type: int, float, bool, or string.",
      },
      {
        id: "typed-assignment",
        mode: "typed",
        text: "Assignments and returns are checked against the declared type.",
      },
    ],
  },
  {
    id: "untyped",
    title: "Untyped mode rules",
    items: [
      {
        id: "untyped-functions",
        mode: "untyped",
        text: "Functions use the function keyword and values are dynamic.",
      },
      {
        id: "untyped-variables",
        mode: "untyped",
        text: "Variables use the variable keyword and can hold any supported value type.",
      },
    ],
  },
  {
    id: "blocks",
    title: "Block rules",
    items: [
      {
        id: "delimited-blocks",
        mode: "common",
        text: "Delimited mode uses block open and close delimiters.",
      },
      {
        id: "indentation-blocks",
        mode: "common",
        text: "Indentation mode uses a colon followed by an indented body.",
      },
      {
        id: "indentation-alignment",
        mode: "common",
        text: "Indented sibling statements must align to the same block depth.",
      },
    ],
  },
  {
    id: "statements",
    title: "Statement rules",
    items: [
      {
        id: "terminator",
        mode: "common",
        text: "Statements can end with the default semicolon or a configured statement terminator.",
      },
      {
        id: "optional-eol",
        mode: "common",
        text: "In optional-eol mode, statements can also end at a valid line or block boundary.",
      },
      {
        id: "required-terminator",
        mode: "common",
        text: "In required mode, statements that need a terminator must use an explicit terminator.",
      },
      {
        id: "for-separators",
        mode: "common",
        text: "The separators inside for headers must remain literal semicolons.",
      },
    ],
  },
  {
    id: "arrays",
    title: "Array rules",
    items: [
      {
        id: "fixed-arrays",
        mode: "common",
        text: "Fixed array declarations require integer sizes for each dimension.",
      },
      {
        id: "dynamic-arrays",
        mode: "common",
        text: "Dynamic array declarations use empty brackets and can grow through writes.",
      },
      {
        id: "array-reference",
        mode: "common",
        text: "Arrays passed to functions are passed by reference.",
      },
    ],
  },
];

export function getCompilerLanguageRules(): LanguageRuleSection[] {
  return COMPILER_LANGUAGE_RULES;
}
