import { OpName } from "../../interpreter/constants";

export const RELATIONALS = {
  equal_equal: 9, // ==
  not_equal: 10, // !=
  greater: 11, // >
  greater_equal: 12, // >=
  less: 13, // <
  less_equal: 14, // <=
  strict_equal: 64, // ===
};

export const RELATIONAL_OPERATOR_TOKEN_IDS = {
  equal_equal: RELATIONALS.equal_equal,
  not_equal: RELATIONALS.not_equal,
  greater: RELATIONALS.greater,
  greater_equal: RELATIONALS.greater_equal,
  less: RELATIONALS.less,
  less_equal: RELATIONALS.less_equal,
  strict_equal: RELATIONALS.strict_equal,
} as const;

export const RELATIONALS_STYLE = {
  text: "text-yellow-500",
  bg: "bg-yellow-100 dark:bg-amber-900/55",
  border: "border-yellow-500",
  transform: "hover:bg-yellow-200",
};

export const RELATIONAL_SYMBOLS: Record<number, OpName> = {
  [RELATIONALS.equal_equal]: "==",
  [RELATIONALS.strict_equal]: "===",
  [RELATIONALS.not_equal]: "<>",
  [RELATIONALS.greater]: ">",
  [RELATIONALS.greater_equal]: "≥",
  [RELATIONALS.less]: "<",
  [RELATIONALS.less_equal]: "≤",
};
