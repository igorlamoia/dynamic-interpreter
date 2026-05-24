import { ExprResult, TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { exprStmt } from "./exprStmt";
import { functionCallExpr } from "./functionCallExpr";
import { assertTypedAssignableIdentifier } from "./typedIdentifier";

/**
 * Parses a factor: literals, identifiers, function calls, or parenthesized expressions.
 * Returns a value or variable name.
 *
 * @returns string representing the result
 */
export function factorStmt(iterator: TokenIterator): ExprResult {
  const token = iterator.peek();
  const { LITERALS, RESERVEDS, SYMBOLS } = TOKENS;

  // Identificadores: podem ser variáveis ou chamadas de função
  if (token.type === LITERALS.identifier) {
    const identifier = iterator.consume(LITERALS.identifier);

    // Verificar se é chamada de função (seguido por '(')
    if (iterator.peek().type === SYMBOLS.left_paren) {
      return functionCallExpr(iterator, identifier);
    }

    if (iterator.peek().type === SYMBOLS.left_bracket) {
      return parseArrayAccess(iterator, identifier);
    }

    // Postfix increment: identifier++
    if (
      iterator.peek().type === TOKENS.ARITHMETICS.plus &&
      iterator.peek().lexeme === "++"
    ) {
      const operatorToken = iterator.consume(TOKENS.ARITHMETICS.plus, "++");
      assertTypedAssignableIdentifier(iterator, identifier);
      const previous = iterator.emitter.newTemp();
      const incremented = iterator.emitter.newTemp();
      iterator.emitter.emitFromToken(
        "=",
        previous,
        identifier.lexeme,
        null,
        identifier,
      );
      iterator.emitter.emitFromToken(
        "+",
        incremented,
        identifier.lexeme,
        "1",
        operatorToken,
      );
      iterator.emitter.emitFromToken(
        "=",
        identifier.lexeme,
        incremented,
        null,
        identifier,
      );
      const type = iterator.resolveSymbol(identifier.lexeme);
      iterator.registerTemp(previous, type);
      iterator.registerTemp(incremented, type);
      return iterator.createExprResult(previous, type, identifier);
    }

    // Caso contrário, é apenas uma variável
    return iterator.createExprResult(
      identifier.lexeme,
      iterator.resolveSymbol(identifier.lexeme),
      identifier,
    );
  }

  // Outros literais (números, strings)
  if (Object.values(LITERALS).includes(token.type)) {
    const literal = iterator.consume(token.type);
    return iterator.createExprResult(
      literal.lexeme,
      iterator.inferLiteralType(literal),
      literal,
    );
  }

  if (token.type === RESERVEDS.true || token.type === RESERVEDS.false) {
    const literal = iterator.consume(token.type);
    const canonicalBooleanLexeme =
      literal.type === RESERVEDS.true ? "true" : "false";
    return iterator.createExprResult(
      canonicalBooleanLexeme,
      iterator.inferLiteralType(literal),
      literal,
    );
  }

  // Parênteses: (expr)
  if (iterator.match(SYMBOLS.left_paren)) {
    iterator.consume(SYMBOLS.left_paren);
    const inner = exprStmt(iterator);
    iterator.consume(SYMBOLS.right_paren, ")");
    return inner;
  }

  iterator.throwError("grammar.unexpected_token", token.line, token.column, {
    lexeme: token.lexeme,
    line: token.line,
    column: token.column,
  });
}

function parseArrayAccess(
  iterator: TokenIterator,
  identifier: ExprResult["token"],
): ExprResult {
  const descriptor = iterator.resolveSymbolDescriptor(identifier.lexeme);
  if (descriptor.kind !== "array") {
    iterator.throwError(
      "grammar.unexpected_statement",
      identifier.line,
      identifier.column,
      { lexeme: identifier.lexeme },
    );
  }

  const indexes: string[] = [];

  while (iterator.match(TOKENS.SYMBOLS.left_bracket)) {
    iterator.consume(TOKENS.SYMBOLS.left_bracket);
    const indexExpr = exprStmt(iterator);
    if (!iterator.isIndexType(indexExpr.type)) {
      iterator.throwError(
        "grammar.unexpected_type",
        indexExpr.token.line,
        indexExpr.token.column,
        {
          lexeme: indexExpr.token.lexeme,
          line: indexExpr.token.line,
          column: indexExpr.token.column,
        },
      );
    }
    iterator.consume(TOKENS.SYMBOLS.right_bracket);
    indexes.push(indexExpr.place);
  }

  const hasValidDimensions =
    descriptor.arrayMode === "dynamic"
      ? indexes.length >= descriptor.dimensions
      : indexes.length === descriptor.dimensions;

  if (!hasValidDimensions) {
    iterator.throwError(
      "grammar.unexpected_statement",
      identifier.line,
      identifier.column,
      { lexeme: identifier.lexeme },
    );
  }

  const temp = iterator.emitter.newTemp();
  iterator.emitter.emitFromToken(
    "ARRAY_GET" as never,
    temp,
    identifier.lexeme,
    indexes,
    identifier,
  );
  iterator.registerTemp(temp, descriptor.baseType);
  return iterator.createExprResult(temp, descriptor.baseType, identifier);
}
