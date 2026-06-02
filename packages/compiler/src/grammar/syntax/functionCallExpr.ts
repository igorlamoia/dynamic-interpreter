import {
  ExprResult,
  FunctionParameterDescriptor,
  SymbolDescriptor,
  TokenIterator,
  ValueType,
} from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { argumentListStmt } from "./argumentListStmt";
import { Token } from "../../token";

/**
 * Parses a function call expression.
 * The function name has already been consumed before calling this function.
 *
 * @param iterator TokenIterator instance
 * @param functionName Name of the function being called
 * @returns Temporary variable containing the return value
 *
 * @derivation `<functionCallExpr> → IDENT '(' <argList> ')'`
 */
export function functionCallExpr(
  iterator: TokenIterator,
  functionName: Token,
): ExprResult {
  iterator.consume(TOKENS.SYMBOLS.left_paren);

  const args = argumentListStmt(iterator);

  iterator.consume(TOKENS.SYMBOLS.right_paren);

  const resultTemp = iterator.emitter.newTemp();
  const signature = iterator.resolveFunction(functionName.lexeme);

  if (signature) {
    args.forEach((arg, index) => {
      const parameter = signature.params[index];
      if (parameter) {
        validateArgumentForParameter(iterator, arg, parameter);
      }
      const expectedType =
        parameter?.kind === "array" ? parameter.baseType : parameter?.type ?? "unknown";
      iterator.warnIfLossyIntConversion(expectedType, arg.type, arg.token);
    });
  }

  iterator.emitter.emitFromToken(
    "CALL",
    functionName.lexeme,
    args.map((arg) => arg.place),
    resultTemp,
    functionName,
  );
  const returnType: ValueType = signature?.returnType ?? "unknown";
  iterator.registerTemp(resultTemp, returnType);

  return iterator.createExprResult(resultTemp, returnType, functionName);
}

function validateArgumentForParameter(
  iterator: TokenIterator,
  arg: ExprResult,
  parameter: FunctionParameterDescriptor,
): void {
  const argumentDescriptor = resolveArgumentDescriptor(iterator, arg);

  if (parameter.kind === "scalar") {
    if (argumentDescriptor.kind === "array") {
      throwArgumentTypeError(iterator, arg);
    }
    return;
  }

  if (argumentDescriptor.kind !== "array") {
    throwArgumentTypeError(iterator, arg);
  }

  if (argumentDescriptor.baseType !== parameter.baseType) {
    throwArgumentTypeError(iterator, arg);
  }

  if (argumentDescriptor.dimensions !== parameter.dimensions) {
    throwArgumentTypeError(iterator, arg);
  }

  if (parameter.arrayMode === "fixed") {
    const sizesMatch =
      argumentDescriptor.sizes.length === parameter.sizes.length &&
      argumentDescriptor.sizes.every((size, index) => size === parameter.sizes[index]);

    if (!sizesMatch) {
      throwArgumentTypeError(iterator, arg);
    }
  }
}

function throwArgumentTypeError(iterator: TokenIterator, arg: ExprResult): never {
  iterator.throwError("grammar.unexpected_type", arg.token.line, arg.token.column, {
    lexeme: arg.token.lexeme,
    line: arg.token.line,
    column: arg.token.column,
  });
}

function resolveArgumentDescriptor(
  iterator: TokenIterator,
  arg: ExprResult,
): SymbolDescriptor | { kind: "scalar"; type: ValueType } {
  const descriptor = iterator.resolveSymbolDescriptor(arg.place);
  if (descriptor.kind === "array") {
    return descriptor;
  }

  return {
    kind: "scalar",
    type: arg.type,
  };
}
