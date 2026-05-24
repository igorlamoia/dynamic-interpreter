export type TArithmetics = "+" | "-" | "*" | "/" | "%" | "//";
export type TUnaryArithmetics = "unary+" | "unary-";
export type TLogical = "||" | "&&" | "!";
export type TRelational = "==" | "<>" | ">" | "≥" | "<" | "≤";
export type TAssignment = "=";
export type TFlowControl = "IF" | "JUMP" | "RETURN";
export type TSystemCalls = "CALL"; // e.g. PRINT, SCAN
export type TLabel = "LABEL";
export type TDeclaration = "DECLARE" | "DECLARE_ARRAY";
export type TArrayOp = "ARRAY_GET" | "ARRAY_SET";
export type ScanHint = "int" | "float" | null;

export const ARITHMETICS: TArithmetics[] = ["+", "-", "*", "/", "%", "//"];
export const LOGICALS: TLogical[] = ["||", "&&", "!"];
export const RELATIONALS: TRelational[] = ["==", "<>", ">", "≥", "<", "≤"];

export type OpName =
  | TArithmetics
  | TUnaryArithmetics
  | TLogical
  | TRelational
  | TAssignment
  | TFlowControl
  | TSystemCalls
  | TLabel
  | TDeclaration
  | TArrayOp;

export interface SourceLocation {
  file?: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  statementId?: string;
}

export interface Instruction {
  op: OpName;
  result: string;
  operand1: unknown;
  operand2: unknown;
  source?: SourceLocation;
}

export interface RuntimeArrayValue {
  kind: "array";
  arrayMode: "fixed" | "dynamic";
  baseType: string;
  dimensions: number;
  sizes: number[];
  elements: unknown[];
}

export interface RuntimeSlot {
  type: string;
  value: unknown;
}
