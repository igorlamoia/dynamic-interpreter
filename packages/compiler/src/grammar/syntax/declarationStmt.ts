import { TokenIterator } from "../../token/TokenIterator";
import { Token } from "../../token";
import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeStmt";
import {
  emitAssignmentChain,
  emitAssignmentFromValue,
  type AssignmentTarget,
} from "./attributeStmt";
import { consumeStmtTerminator } from "./statementTerminator";
import { exprStmt } from "./exprStmt";

/**
 * Parses a variable declaration statement and emits declaration instructions.
 *
 * @derivation `<declaration> -> <type> <identList> ';'`
 */
export function declarationStmt(iterator: TokenIterator): void {
  declarationStmtCore(iterator, true);
}

export function declarationStmtWithoutTerminator(
  iterator: TokenIterator,
): void {
  declarationStmtCore(iterator, false);
}

function declarationStmtCore(
  iterator: TokenIterator,
  consumeTerminator: boolean,
): void {
  const typingMode = iterator.getTypingMode();
  const arrayMode = iterator.getArrayMode();
  const type =
    typingMode === "untyped"
      ? (iterator.consume(TOKENS.RESERVEDS.variavel), "dynamic")
      : typeStmt(iterator); // "int", "float", "string"
  const emitter = iterator.emitter;

  while (true) {
    const identToken = iterator.consume(TOKENS.LITERALS.identifier);
    const varName = identToken.lexeme;
    const arrayDeclaration = readArrayDeclaration(iterator, arrayMode);

    if (arrayDeclaration.dimensions > 0) {
      iterator.declareSymbolDescriptor(varName, {
        kind: "array",
        baseType: type,
        dimensions: arrayDeclaration.dimensions,
        arrayMode: arrayDeclaration.mode,
        sizes: arrayDeclaration.sizes,
      });
      emitter.emitFromToken(
        "DECLARE_ARRAY" as never,
        varName,
        type,
        JSON.stringify(arrayDeclaration),
        identToken,
      );
    } else {
      iterator.declareSymbol(varName, type);
      emitter.emitFromToken("DECLARE", varName, type, null, identToken);
    }

    if (iterator.match(TOKENS.ASSIGNMENTS.equal)) {
      iterator.consume(TOKENS.ASSIGNMENTS.equal);
      if (
        arrayDeclaration.dimensions > 0 &&
        iterator.match(TOKENS.SYMBOLS.left_bracket)
      ) {
        emitArrayLiteralInitialization(iterator, {
          name: varName,
          type,
          dimensions: arrayDeclaration.dimensions,
          sizes: arrayDeclaration.sizes,
          arrayMode: arrayDeclaration.mode,
          token: identToken,
        });
      } else {
        emitAssignmentChain(iterator, varName);
      }
    }

    if (!iterator.match(TOKENS.SYMBOLS.comma)) break;
    iterator.consume(TOKENS.SYMBOLS.comma); // consume ","
  }

  if (consumeTerminator) {
    consumeStmtTerminator(iterator);
  }
}

export function declareUntypedArray(
  iterator: TokenIterator,
  identToken: Token,
): void {
  const arrayMode = iterator.getArrayMode();
  const arrayDeclaration = readArrayDeclaration(iterator, arrayMode);
  iterator.consume(TOKENS.ASSIGNMENTS.equal);

  iterator.declareSymbolDescriptor(identToken.lexeme, {
    kind: "array",
    baseType: "dynamic",
    dimensions: arrayDeclaration.dimensions,
    arrayMode: arrayDeclaration.mode,
    sizes: arrayDeclaration.sizes,
  });
  iterator.emitter.emitFromToken(
    "DECLARE_ARRAY" as never,
    identToken.lexeme,
    "dynamic",
    JSON.stringify({
      mode: arrayDeclaration.mode,
      dimensions: arrayDeclaration.dimensions,
      sizes: arrayDeclaration.sizes,
    }),
    identToken,
  );

  if (iterator.match(TOKENS.SYMBOLS.left_bracket)) {
    emitArrayLiteralInitialization(iterator, {
      name: identToken.lexeme,
      type: "dynamic",
      dimensions: arrayDeclaration.dimensions,
      sizes: arrayDeclaration.sizes,
      arrayMode: arrayDeclaration.mode,
      token: identToken,
    });
  } else {
    iterator.throwError(
      "grammar.unexpected_statement",
      iterator.peek().line,
      iterator.peek().column,
      { lexeme: iterator.peek().lexeme },
    );
  }
  consumeStmtTerminator(iterator);
}

export type ParsedArrayDeclaration = {
  mode: "fixed" | "dynamic";
  dimensions: number;
  sizes: number[];
};

export function readArrayDeclaration(
  iterator: TokenIterator,
  arrayMode: "fixed" | "dynamic" | null,
): ParsedArrayDeclaration {
  const sizes: number[] = [];
  let dimensions = 0;

  while (iterator.match(TOKENS.SYMBOLS.left_bracket)) {
    iterator.consume(TOKENS.SYMBOLS.left_bracket);
    const sizeToken = iterator.peek();

    if (arrayMode === "dynamic") {
      if (sizeToken.type !== TOKENS.SYMBOLS.right_bracket) {
        iterator.throwError(
          "grammar.unexpected_statement",
          sizeToken.line,
          sizeToken.column,
          { lexeme: sizeToken.lexeme },
        );
      }
      iterator.consume(TOKENS.SYMBOLS.right_bracket);
      dimensions++;
      continue;
    }

    if (sizeToken.type !== TOKENS.LITERALS.integer_literal) {
      iterator.throwError(
        "iterator.unexpected_token",
        sizeToken.line,
        sizeToken.column,
        {
          line: sizeToken.line,
          column: sizeToken.column,
          expectedType: "integer literal",
          actualType:
            TOKENS.BY_ID[sizeToken.type] !== undefined
              ? `token.${TOKENS.BY_ID[sizeToken.type]}`
              : String(sizeToken.type),
          lexeme: sizeToken.lexeme,
        },
      );
    }

    const parsedSize = Number(iterator.consume(sizeToken.type).lexeme);
    if (!Number.isInteger(parsedSize) || parsedSize <= 0) {
      iterator.throwError(
        "grammar.unexpected_statement",
        sizeToken.line,
        sizeToken.column,
        { lexeme: sizeToken.lexeme },
      );
    }

    iterator.consume(TOKENS.SYMBOLS.right_bracket);
    sizes.push(parsedSize);
    dimensions++;
  }

  return {
    mode: arrayMode ?? "fixed",
    dimensions,
    sizes,
  };
}

type ArrayInitializationContext = {
  name: string;
  type: ReturnType<typeof typeStmt> | "dynamic";
  dimensions: number;
  sizes: number[];
  arrayMode: "fixed" | "dynamic";
  token: Token;
};

type ParsedArrayLiteralNode =
  | {
      kind: "leaf";
      value: ReturnType<typeof exprStmt>;
      token: Token;
    }
  | {
      kind: "array";
      items: ParsedArrayLiteralNode[];
      token: Token;
    };

function emitArrayLiteralInitialization(
  iterator: TokenIterator,
  context: ArrayInitializationContext,
): void {
  const literal = parseArrayLiteral(iterator);
  validateArrayLiteral(iterator, literal, context, 1);
  emitArrayLiteralEntries(iterator, literal, context, []);
}

function parseArrayLiteral(iterator: TokenIterator): ParsedArrayLiteralNode {
  const startToken = iterator.consume(TOKENS.SYMBOLS.left_bracket);
  const items: ParsedArrayLiteralNode[] = [];

  if (iterator.match(TOKENS.SYMBOLS.right_bracket)) {
    iterator.consume(TOKENS.SYMBOLS.right_bracket);
    return { kind: "array", items, token: startToken };
  }

  while (true) {
    if (iterator.match(TOKENS.SYMBOLS.left_bracket)) {
      items.push(parseArrayLiteral(iterator));
    } else {
      const value = exprStmt(iterator);
      items.push({ kind: "leaf", value, token: value.token });
    }

    if (iterator.match(TOKENS.SYMBOLS.comma)) {
      iterator.consume(TOKENS.SYMBOLS.comma);
      continue;
    }

    iterator.consume(TOKENS.SYMBOLS.right_bracket);
    return { kind: "array", items, token: startToken };
  }
}

function validateArrayLiteral(
  iterator: TokenIterator,
  node: ParsedArrayLiteralNode,
  context: ArrayInitializationContext,
  currentDepth: number,
): void {
  if (node.kind === "leaf") {
    iterator.throwError(
      "grammar.unexpected_statement",
      node.token.line,
      node.token.column,
      { lexeme: node.token.lexeme },
    );
  }

  if (currentDepth > context.dimensions) {
    iterator.throwError(
      "grammar.unexpected_statement",
      node.token.line,
      node.token.column,
      { lexeme: node.token.lexeme },
    );
  }

  if (currentDepth === 1 && node.items.length === 0) {
    return;
  }

  if (
    context.arrayMode === "fixed" &&
    context.sizes[currentDepth - 1] !== undefined &&
    node.items.length !== context.sizes[currentDepth - 1]
  ) {
    iterator.throwError(
      "grammar.unexpected_statement",
      node.token.line,
      node.token.column,
      { lexeme: node.token.lexeme },
    );
  }

  for (const item of node.items) {
    if (currentDepth === context.dimensions) {
      if (item.kind !== "leaf") {
        iterator.throwError(
          "grammar.unexpected_statement",
          item.token.line,
          item.token.column,
          { lexeme: item.token.lexeme },
        );
      }
      continue;
    }

    if (item.kind !== "array") {
      iterator.throwError(
        "grammar.unexpected_statement",
        item.token.line,
        item.token.column,
        { lexeme: item.token.lexeme },
      );
    }

    validateArrayLiteral(iterator, item, context, currentDepth + 1);
  }
}

function emitArrayLiteralEntries(
  iterator: TokenIterator,
  node: ParsedArrayLiteralNode,
  context: ArrayInitializationContext,
  prefixIndexes: number[],
): void {
  if (node.kind === "leaf") {
    const target: AssignmentTarget = {
      kind: "array",
      name: context.name,
      type: context.type,
      token: context.token,
      indexes: prefixIndexes.map(String),
    };
    emitAssignmentFromValue(
      iterator,
      target,
      node.value.place,
      node.value.type,
      node.value.token,
    );
    return;
  }

  node.items.forEach((item, index) => {
    emitArrayLiteralEntries(iterator, item, context, [...prefixIndexes, index]);
  });
}

// import { identListStmt } from "./identListStmt";
