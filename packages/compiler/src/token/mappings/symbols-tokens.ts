import { TOKENS } from "../constants";
import { TTokenMap } from ".";

export const SYMBOLS_TOKENS_MAP: TTokenMap = {
  ";": (lexer) => lexer.addToken(TOKENS.SYMBOLS.semicolon),
  ",": (lexer) => lexer.addToken(TOKENS.SYMBOLS.comma),
  "{": (lexer) => lexer.addToken(TOKENS.SYMBOLS.left_brace),
  "}": (lexer) => lexer.addToken(TOKENS.SYMBOLS.right_brace),
  "(": (lexer) => lexer.addToken(TOKENS.SYMBOLS.left_paren),
  ")": (lexer) => lexer.addToken(TOKENS.SYMBOLS.right_paren),
  "[": (lexer) => lexer.addToken(TOKENS.SYMBOLS.left_bracket),
  "]": (lexer) => lexer.addToken(TOKENS.SYMBOLS.right_bracket),
  ".": (lexer) => lexer.addToken(TOKENS.SYMBOLS.dot),
  ":": (lexer) => lexer.addToken(TOKENS.SYMBOLS.colon),
  "?": (lexer) => lexer.addToken(TOKENS.SYMBOLS.question),
};
