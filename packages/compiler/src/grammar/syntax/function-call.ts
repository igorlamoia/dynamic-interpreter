import {
  FunctionParameterDescriptor,
  TokenIterator,
  ValueType,
} from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeStmt";
import { blockStmt } from "./blockStmt";
import { parameterListStmt } from "./parameterListStmt";

/**
 * Parses a function declaration with optional parameters.
 * Emits a LABEL for the function body and processes its block.
 *
 * @derivation `<function*> → <type> IDENT '(' <paramList> ')' <bloco>`
 */
export function functionCall(iterator: TokenIterator): void {
  const { left_paren, right_paren } = TOKENS.SYMBOLS;
  const { function: functionKeyword } = TOKENS.RESERVEDS;
  const typingMode = iterator.getTypingMode();

  const returnType: ValueType =
    typingMode === "untyped" ? "dynamic" : "void";

  if (typingMode === "untyped") {
    iterator.consume(functionKeyword);
  } else {
    iterator.setCurrentFunctionReturnType(typeStmt(iterator, true));
  }
  const identifier = iterator.consume(TOKENS.LITERALS.identifier); // nome da função

  iterator.consume(left_paren); // (

  // Parsear lista de parâmetros
  const params = parameterListStmt(iterator);

  iterator.consume(right_paren); // )

  const declaredReturnType =
    typingMode === "untyped"
      ? returnType
      : (iterator.getCurrentFunctionReturnType() ?? "void");
  iterator.declareFunction(identifier.lexeme, declaredReturnType, params);
  iterator.enterScope();

  // Gerar um label para o corpo da função
  iterator.emitter.emit("LABEL", identifier.lexeme, null, null);

  // Emitir declarações de parâmetros
  params.forEach((param) => declareParameter(iterator, param));

  // Processar o corpo da função
  blockStmt(iterator);
  iterator.exitScope();

  // Se não houver return explícito, retornar null
  iterator.emitter.emit("RETURN", "null", declaredReturnType, null);
  iterator.setCurrentFunctionReturnType(null);
}

function declareParameter(
  iterator: TokenIterator,
  param: { name: string } & FunctionParameterDescriptor,
): void {
  if (param.kind === "array") {
    iterator.declareSymbolDescriptor(param.name, {
      kind: "array",
      baseType: param.baseType,
      dimensions: param.dimensions,
      arrayMode: param.arrayMode,
      sizes: param.sizes,
    });
    iterator.emitter.emit(
      "DECLARE_ARRAY" as never,
      param.name,
      param.baseType,
      JSON.stringify({
        mode: param.arrayMode,
        dimensions: param.dimensions,
        sizes: param.sizes,
      }),
    );
    return;
  }

  iterator.declareSymbol(param.name, param.type);
  iterator.emitter.emit("DECLARE", param.name, param.type, null);
}
