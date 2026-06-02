import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { forStmt } from "./forStmt";
import { blockStmt } from "./blockStmt";
import {
  attributeStmt,
  emitAssignment,
  emitAssignmentChain,
  parseAssignmentTarget,
} from "./attributeStmt";
import { whileStmt } from "./whileStmt";
import { ifStmt } from "./ifStmt";
import {
  declarationStmt,
  declareUntypedArray,
} from "./declarationStmt";
import { printStmt, scanStmt } from "./ioStmt";
import { returnStmt } from "./returnStmt";
import { functionCallExpr } from "./functionCallExpr";
import { breakStmt } from "./breakStmt";
import { continueStmt } from "./continueStmt";
import { switchStmt } from "./switchStmt";
import { consumeStmtTerminator } from "./statementTerminator";
import { assertTypedAssignableIdentifier } from "./typedIdentifier";

/**
 * Parses a statement by calling the appropriate function
 * based on the current token.
 *
 * @derivation `<stmt> -> <forStmt> | <printStmt> | <scanStmt> | <whileStmt> | <atrib> ';' | <ifStmt> | <switchStmt> | <bloco> | <declaration> | 'break' | 'continue' | ';'`
 */
export function stmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  const { RESERVEDS } = TOKENS;
  const blockMode = iterator.getBlockMode();
  const typingMode = iterator.getTypingMode();

  const stmtsFactory = {
    [RESERVEDS.for]: forStmt,
    [RESERVEDS.print]: printStmt,
    [RESERVEDS.scan]: scanStmt,
    [RESERVEDS.while]: whileStmt,
    [TOKENS.LITERALS.identifier]: attrbuteStmtVariant,
    [RESERVEDS.if]: ifStmt,
    [RESERVEDS.switch]: switchStmt,
    [TOKENS.SYMBOLS.left_brace]: blockStmt,
    ...(typingMode === "typed"
        ? {
          [RESERVEDS.int]: declarationStmt,
          [RESERVEDS.float]: declarationStmt,
          [RESERVEDS.bool]: declarationStmt,
          [RESERVEDS.string]: declarationStmt,
        }
      : {
          [RESERVEDS.variavel]: declarationStmt,
        }),
    [RESERVEDS.return]: returnStmt,
    [RESERVEDS.break]: breakStmt,
    [RESERVEDS.continue]: continueStmt,
    [TOKENS.ARITHMETICS.plus]: prefixIncrementStmtVariant,
  };

  // In indentation mode, a colon also starts a block
  if (blockMode === "indentation" && token.type === TOKENS.SYMBOLS.colon) {
    return blockStmt(iterator);
  }

  const goToStmt = stmtsFactory[token.type];
  if (goToStmt) return goToStmt(iterator);

  const ignoreStmts = {
    [TOKENS.SYMBOLS.semicolon]: iterator.consume.bind(iterator),
    [TOKENS.SYMBOLS.newline]: iterator.consume.bind(iterator),
  };

  const ignoreStmt = ignoreStmts[token.type];
  if (ignoreStmt) {
    ignoreStmt(token.type);
    return;
  }

  if (token.type === RESERVEDS.case) {
    iterator.throwError(
      "grammar.case_outside_switch",
      token.line,
      token.column,
      { lexeme: token.lexeme },
    );
  }

  if (token.type === RESERVEDS.default) {
    iterator.throwError(
      "grammar.default_outside_switch",
      token.line,
      token.column,
      { lexeme: token.lexeme },
    );
  }

  iterator.throwError(
    "grammar.unexpected_statement",
    token.line,
    token.column,
    { lexeme: token.lexeme },
  );
}

function prefixIncrementStmtVariant(iterator: TokenIterator): void {
  const token = iterator.peek();
  if (token.lexeme !== "++") {
    iterator.throwError(
      "grammar.unexpected_statement",
      token.line,
      token.column,
      { lexeme: token.lexeme },
    );
  }

  attributeStmt(iterator);
  consumeStmtTerminator(iterator);
}

function attrbuteStmtVariant(iterator: TokenIterator): void {
  // Consumir o identificador
  const identifier = iterator.consume(TOKENS.LITERALS.identifier);
  const { plus } = TOKENS.ARITHMETICS;
  const typingMode = iterator.getTypingMode();
  const arrayMode = iterator.getArrayMode();

  if (
    typingMode === "untyped" &&
    isUntypedArrayDeclaration(iterator, arrayMode)
  ) {
    declareUntypedArray(iterator, identifier);
    return;
  }

  // Verificar se é chamada de função (seguido por '(') ou atribuição (seguido por '=')
  if (iterator.peek().type === TOKENS.SYMBOLS.left_paren) {
    // É uma chamada de função
    functionCallExpr(iterator, identifier);
    consumeStmtTerminator(iterator);
  } else if (iterator.peek().type === plus && iterator.peek().lexeme === "++") {
    // É um incremento pós-fixado
    const operatorToken = iterator.consume(plus, "++");
    assertTypedAssignableIdentifier(iterator, identifier);
    const incremented = iterator.emitter.newTemp();
    iterator.emitter.emitFromToken(
      "+",
      incremented,
      identifier.lexeme,
      "1",
      operatorToken,
    );
    iterator.registerTemp(incremented, iterator.resolveSymbol(identifier.lexeme));
    iterator.emitter.emitFromToken(
      "=",
      identifier.lexeme,
      incremented,
      null,
      identifier,
    );
    consumeStmtTerminator(iterator);
  } else {
    const target = parseAssignmentTarget(iterator, identifier);
    iterator.consume(TOKENS.ASSIGNMENTS.equal, "=");
    emitAssignment(iterator, target);
    consumeStmtTerminator(iterator);
  }
}

function isUntypedArrayDeclaration(
  iterator: TokenIterator,
  arrayMode: "fixed" | "dynamic" | null,
): boolean {
  if (!iterator.match(TOKENS.SYMBOLS.left_bracket)) {
    return false;
  }

  const isDynamicArray = arrayMode === "dynamic";
  let offset = 0;

  while (true) {
    const leftBracket = iterator.peekAt(offset);
    const bracketValue = iterator.peekAt(offset + 1);
    const rightBracket = iterator.peekAt(offset + (isDynamicArray ? 1 : 2));

    if (leftBracket?.type !== TOKENS.SYMBOLS.left_bracket) {
      return false;
    }

    if (isDynamicArray) {
      if (bracketValue?.type !== TOKENS.SYMBOLS.right_bracket) {
        return false;
      }
      if (
        iterator.peekAt(offset + 2)?.type === TOKENS.SYMBOLS.left_bracket
      ) {
        offset += 2;
        continue;
      }
    } else {
      if (bracketValue?.type !== TOKENS.LITERALS.integer_literal) {
        return false;
      }
      if (rightBracket?.type !== TOKENS.SYMBOLS.right_bracket) {
        return false;
      }
      if (
        iterator.peekAt(offset + 3)?.type === TOKENS.SYMBOLS.left_bracket
      ) {
        offset += 3;
        continue;
      }
    }

    const assignmentToken = iterator.peekAt(offset + (isDynamicArray ? 2 : 3));
    const literalToken = iterator.peekAt(offset + (isDynamicArray ? 3 : 4));
    return (
      assignmentToken?.type === TOKENS.ASSIGNMENTS.equal &&
      literalToken?.type === TOKENS.SYMBOLS.left_bracket
    );
  }
}
