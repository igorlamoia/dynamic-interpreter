import { functionCall } from "../../grammar/syntax/function-call";
import { LexerConfig } from "../../lexer/config";
import { Lexer } from "../../lexer";
import { Instruction } from "../../interpreter/constants";
import { GrammarConfig, TokenIterator } from "../../token/TokenIterator";
import { Interpreter } from "../../interpreter";
import type { InterpreterExecutionOptions } from "../../interpreter/constants";

type CompileToIrOptions = {
  locale?: string;
  lexer?: LexerConfig;
  grammar?: GrammarConfig;
};

export function compileToIr(
  source: string,
  options?: CompileToIrOptions,
): Instruction[] {
  const locale = options?.locale ?? "en";
  const lexer = new Lexer(source, { locale, ...(options?.lexer ?? {}) });
  const tokens = lexer.scanTokens();
  const iterator = new TokenIterator(tokens, {
    locale,
    grammar: options?.grammar,
    statementTerminatorLexeme: options?.lexer?.statementTerminatorLexeme,
  });

  while (iterator.hasNext()) {
    functionCall(iterator);
  }

  return iterator.emitter.getInstructions();
}

export function compileProgram(source: string, options?: CompileToIrOptions) {
  const locale = options?.locale ?? "en";
  const lexer = new Lexer(source, { locale, ...(options?.lexer ?? {}) });
  const tokens = lexer.scanTokens();
  const iterator = new TokenIterator(tokens, {
    locale,
    grammar: options?.grammar,
    statementTerminatorLexeme: options?.lexer?.statementTerminatorLexeme,
  });
  const instructions = iterator.generateIntermediateCode();

  return {
    instructions,
    warnings: iterator.getWarnings(),
    infos: iterator.getInfos(),
    error: null,
  };
}

/**
 * Returns a stdin callback that yields one value per scan() call.
 * Each entry in `values` is returned in order; falls back to "" when exhausted.
 */
export function createStdin(values: string[]): () => Promise<string> {
  let index = 0;
  return async () => values[index++] ?? "";
}

export async function executeProgram(
  source: string,
  options?: CompileToIrOptions & {
    stdin?: () => Promise<string>;
    interpreter?: InterpreterExecutionOptions;
  },
) {
  const output: string[] = [];
  const { instructions, warnings, infos, error } = compileProgram(
    source,
    options,
  );
  const interpreter = new Interpreter(
    instructions,
    {
      stdout: (msg) => output.push(msg),
      stdin: options?.stdin ?? (async () => ""),
    },
    options?.locale ?? "en",
    options?.interpreter,
  );

  await interpreter.execute();

  return {
    output: output.join(""),
    warnings,
    infos,
    error,
  };
}
