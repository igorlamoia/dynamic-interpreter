import {
  RuntimeArrayValue,
  RuntimeSlot,
  ScanHint,
  TArithmetics,
  TRelational,
} from "./constants";

export function makeOperation(
  op: TArithmetics,
  val1: number,
  val2: number,
  throwError?: (code: string, params?: Record<string, unknown>) => never,
): number {
  const operate = {
    "+": val1 + val2,
    "-": val1 - val2,
    "*": val1 * val2,
    "/": val1 / val2,
    "//": Math.floor(val1 / val2),
    "%": val1 % val2,
  };
  const computation = operate[op] as number | undefined;

  if (computation === undefined) {
    if (throwError)
      throwError("interpreter.unknown_arithmetic_operator", { op });
    throw new Error(`Unknown arithmetic operator '${op}'`);
  }
  return computation;
}

export function makeRelation(
  op: TRelational,
  val1: number,
  val2: number,
  throwError?: (code: string, params?: Record<string, unknown>) => never,
) {
  const relations = {
    "==": val1 === val2,
    "<>": val1 !== val2,
    ">": val1 > val2,
    "≥": val1 >= val2,
    "<": val1 < val2,
    "≤": val1 <= val2,
  };
  const computation = relations[op] as boolean | undefined;
  if (computation === undefined) {
    if (throwError)
      throwError("interpreter.unknown_relational_operator", { op });
    throw new Error(`Unknown relational operator '${op}'`);
  }

  return computation;
}

export type TTypeOperand = string | number | boolean | null;

export function truncateTowardZero(value: number): number {
  return value < 0 ? Math.ceil(value) : Math.floor(value);
}

function normalizeBooleanLike(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return Boolean(value);
}

export function coerceValueForType(type: string, value: unknown): unknown {
  if (type === "int" && typeof value === "number") {
    return truncateTowardZero(value);
  }
  if (type === "float" && typeof value === "number") {
    return value;
  }
  if (type === "bool") {
    return normalizeBooleanLike(value);
  }
  return value;
}

export function parseOrGetVariable(
  operand: TTypeOperand,
  variables: Map<string, RuntimeSlot>,
  throwError?: (code: string, params?: Record<string, unknown>) => never,
): unknown {
  if (operand === null) return null;
  if (typeof operand === "boolean" || typeof operand === "number")
    return operand;
  if (typeof operand !== "string") {
    if (throwError) throwError("interpreter.invalid_operand_type", { operand });
    throw new Error(`Invalid operand type: ${operand}`);
  }

  const lower = operand.trim().toLowerCase();
  if (lower === "true") return true;
  else if (lower === "false") return false;

  const asNum = Number(operand);
  if (!Number.isNaN(asNum) && operand.trim() !== "") return asNum;

  if (!variables.has(operand)) {
    if (throwError) throwError("interpreter.variable_not_defined", { operand });
    throw new Error(`Variable '${operand}' has not been defined yet!`);
  }

  return variables.get(operand)?.value;
}

export function parsePiece(piece: string): string | number | boolean | null {
  piece = piece.trim();
  if (piece.startsWith("'") && piece.endsWith("'"))
    return piece.substring(1, piece.length - 1);
  if (piece === "None") return null;
  if (piece === "True") return true;
  if (piece === "False") return false;
  if (piece === "true") return true;
  if (piece === "false") return false;

  const asNumber = Number(piece);
  if (!Number.isNaN(asNumber) && piece !== "") return asNumber;

  return piece;
}

export function parseScanInput(hint: ScanHint, rawInput: string): unknown {
  const trimmed = rawInput.trim();

  if (hint === "int") {
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? parsePiece(trimmed) : parsed;
  }

  if (hint === "float") {
    const parsed = Number.parseFloat(trimmed);
    return Number.isNaN(parsed) ? parsePiece(trimmed) : parsed;
  }

  if (hint === "string") {
    return rawInput;
  }

  if (hint === "bool") {
    return normalizeBooleanLike(parsePiece(trimmed));
  }

  return parsePiece(trimmed);
}

export function createFixedArrayValue(
  baseType: string,
  sizes: number[],
): RuntimeArrayValue {
  return {
    kind: "array",
    arrayMode: "fixed",
    baseType,
    dimensions: sizes.length,
    sizes: [...sizes],
    elements: buildFixedArrayElements(sizes),
  };
}

export function createDynamicArrayValue(
  baseType: string,
  dimensions: number,
): RuntimeArrayValue {
  return {
    kind: "array",
    arrayMode: "dynamic",
    baseType,
    dimensions,
    sizes: [],
    elements: [],
  };
}

function buildFixedArrayElements(sizes: number[]): unknown[] {
  const [current, ...rest] = sizes;
  if (current === undefined) return [];
  return Array.from({ length: current }, () =>
    rest.length === 0 ? null : buildFixedArrayElements(rest),
  );
}

export function isRuntimeArrayValue(value: unknown): value is RuntimeArrayValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    (value as RuntimeArrayValue).kind === "array"
  );
}

export function readArrayValue(
  value: RuntimeArrayValue,
  indexes: number[],
  throwError?: (code: string, params?: Record<string, unknown>) => never,
): unknown {
  let current: unknown = value.elements;

  for (const index of indexes) {
    if (!Array.isArray(current) || index < 0 || index >= current.length) {
      if (throwError) {
        throwError(
          value.arrayMode === "dynamic"
            ? "interpreter.array_missing_value"
            : "interpreter.array_read_out_of_bounds",
          { index },
        );
      }
      throw new Error("Array index out of bounds");
    }

    current = current[index];
    if (current === undefined) {
      if (throwError) {
        throwError(
          value.arrayMode === "dynamic"
            ? "interpreter.array_missing_value"
            : "interpreter.array_read_out_of_bounds",
          { index },
        );
      }
      throw new Error("Array index out of bounds");
    }
  }

  return current;
}

export function writeArrayValue(
  value: RuntimeArrayValue,
  indexes: number[],
  nextValue: unknown,
  throwError?: (code: string, params?: Record<string, unknown>) => never,
): void {
  if (value.arrayMode === "dynamic") {
    writeDynamicArrayValue(value, indexes, nextValue, throwError);
    return;
  }

  let current: unknown = value.elements;

  for (let i = 0; i < indexes.length - 1; i++) {
    const index = indexes[i]!;
    if (!Array.isArray(current) || index < 0 || index >= current.length) {
      if (throwError) {
        throwError("interpreter.array_write_out_of_bounds", { index });
      }
      throw new Error("Array index out of bounds");
    }
    current = current[index];
  }

  const lastIndex = indexes[indexes.length - 1];
  if (
    lastIndex === undefined ||
    !Array.isArray(current) ||
    lastIndex < 0 ||
    lastIndex >= current.length
  ) {
    if (throwError) {
      throwError("interpreter.array_write_out_of_bounds", { index: lastIndex });
    }
    throw new Error("Array index out of bounds");
  }

  current[lastIndex] = coerceValueForType(value.baseType, nextValue);
}

function writeDynamicArrayValue(
  value: RuntimeArrayValue,
  indexes: number[],
  nextValue: unknown,
  throwError?: (code: string, params?: Record<string, unknown>) => never,
): void {
  let current: unknown[] = value.elements;

  for (let i = 0; i < indexes.length - 1; i++) {
    const index = indexes[i]!;
    if (index < 0) {
      if (throwError) {
        throwError("interpreter.array_write_out_of_bounds", { index });
      }
      throw new Error("Array index out of bounds");
    }
    if (!Array.isArray(current[index])) {
      current[index] = [];
    }
    current = current[index] as unknown[];
  }

  const lastIndex = indexes[indexes.length - 1];
  if (lastIndex === undefined || lastIndex < 0) {
    if (throwError) {
      throwError("interpreter.array_write_out_of_bounds", { index: lastIndex });
    }
    throw new Error("Array index out of bounds");
  }

  current[lastIndex] = coerceValueForType(value.baseType, nextValue);
}
