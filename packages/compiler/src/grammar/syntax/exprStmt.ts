import { ExprResult, TokenIterator, ValueType } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { orStmt } from "./orStmt";

/**
 * Parses an expression (starting from the lowest precedence level: OR).
 * @returns A string with the identifier, literal, or temp holding the result
 *
 * @derivation `<expr> -> <or>`
 */
export function exprStmt(iterator: TokenIterator): ExprResult {
  const condition = orStmt(iterator);
  if (!iterator.match(TOKENS.SYMBOLS.question)) return condition;

  const questionToken = iterator.consume(TOKENS.SYMBOLS.question);
  const trueLabel = iterator.emitter.newLabel();
  const falseLabel = iterator.emitter.newLabel();
  const endLabel = iterator.emitter.newLabel();
  const result = iterator.emitter.newTemp();

  iterator.emitter.emitFromToken(
    "IF",
    condition.place,
    trueLabel,
    falseLabel,
    questionToken,
  );
  iterator.emitter.emitFromToken("LABEL", trueLabel, null, null, questionToken);
  const whenTrue = exprStmt(iterator);
  iterator.emitter.emitFromToken("=", result, whenTrue.place, null, whenTrue.token);
  iterator.emitter.emitFromToken("JUMP", endLabel, null, null, questionToken);

  iterator.consume(TOKENS.SYMBOLS.colon);
  iterator.emitter.emitFromToken("LABEL", falseLabel, null, null, questionToken);
  const whenFalse = exprStmt(iterator);
  iterator.emitter.emitFromToken("=", result, whenFalse.place, null, whenFalse.token);
  iterator.emitter.emitFromToken("LABEL", endLabel, null, null, questionToken);

  const resultType = mergeTernaryTypes(whenTrue.type, whenFalse.type);
  iterator.registerTemp(result, resultType);
  return iterator.createExprResult(result, resultType, questionToken);
}

function mergeTernaryTypes(left: ValueType, right: ValueType): ValueType {
  if (left === right) return left;
  if (
    (left === "int" && right === "float") ||
    (left === "float" && right === "int")
  ) {
    return "float";
  }
  if (left === "dynamic" || right === "dynamic") return "dynamic";
  return "unknown";
}
