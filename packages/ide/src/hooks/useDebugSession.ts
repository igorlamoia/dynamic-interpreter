import { useCallback, useRef, useState } from "react";
import { Lexer } from "@ts-compilator-for-java/compiler/src/lexer";
import type {
  BooleanLiteralMap,
  KeywordMap,
  LexerBlockDelimiters,
  OperatorWordMap,
} from "@ts-compilator-for-java/compiler/src/lexer/config";
import { TokenIterator } from "@ts-compilator-for-java/compiler/token/TokenIterator";
import type { Token } from "@ts-compilator-for-java/compiler/token";
import { Interpreter } from "@ts-compilator-for-java/compiler/interpreter";
import type {
  DebugSnapshot,
  Instruction,
} from "@ts-compilator-for-java/compiler/interpreter/constants";
import type { IDEGrammarConfig } from "@/entities/compiler-config";
import { buildEffectiveKeywordMap } from "@/lib/keyword-map";

export type UseDebugSessionOptions = {
  breakpoints: number[];
  locale?: string;
  keywordMap?: KeywordMap;
  blockDelimiters?: LexerBlockDelimiters;
  indentationBlock?: boolean;
  grammar?: IDEGrammarConfig;
  operatorWordMap?: OperatorWordMap;
  booleanLiteralMap?: BooleanLiteralMap;
  statementTerminatorLexeme?: string;
  onCurrentLineChange?: (line: number | null) => void;
};

export type UseDebugSessionResult = {
  snapshot: DebugSnapshot | null;
  output: string[];
  error: string | null;
  isStale: boolean;
  boundBreakpoints: number[];
  unboundBreakpoints: number[];
  start: (sourceCode: string) => Promise<DebugSnapshot | null>;
  continueExecution: () => Promise<DebugSnapshot | null>;
  stepInto: () => Promise<DebugSnapshot | null>;
  stepOver: () => Promise<DebugSnapshot | null>;
  stepOut: () => Promise<DebugSnapshot | null>;
  stop: () => DebugSnapshot | null;
  restart: (sourceCode?: string) => Promise<DebugSnapshot | null>;
  provideInput: (value: string) => void;
  markStale: (currentSourceCode?: string) => void;
};

type CompiledDebugProgram = {
  instructions: Instruction[];
  boundBreakpoints: number[];
  unboundBreakpoints: number[];
};

function compileDebugProgram(
  sourceCode: string,
  options: UseDebugSessionOptions,
): CompiledDebugProgram {
  const lexer = new Lexer(sourceCode, {
    customKeywords: buildEffectiveKeywordMap(options.keywordMap),
    blockDelimiters: options.blockDelimiters,
    indentationBlock: options.indentationBlock,
    operatorWordMap: options.operatorWordMap,
    booleanLiteralMap: options.booleanLiteralMap,
    statementTerminatorLexeme: options.statementTerminatorLexeme,
    locale: options.locale,
  });
  const tokens = lexer.scanTokens();
  const iterator = new TokenIterator(tokens as unknown as Token[], {
    locale: options.locale,
    grammar: options.grammar,
    operatorWordMap: options.operatorWordMap,
    statementTerminatorLexeme: options.statementTerminatorLexeme,
  });
  const instructions = iterator.generateIntermediateCode();
  const executableLines = new Set(
    instructions
      .filter((instruction) => instruction.op !== "LABEL")
      .map((instruction) => instruction.source?.line)
      .filter((line): line is number => typeof line === "number"),
  );
  const uniqueBreakpoints = [...new Set(options.breakpoints)].sort(
    (a, b) => a - b,
  );

  return {
    instructions,
    boundBreakpoints: uniqueBreakpoints.filter((line) =>
      executableLines.has(line),
    ),
    unboundBreakpoints: uniqueBreakpoints.filter(
      (line) => !executableLines.has(line),
    ),
  };
}

export function useDebugSession(
  options: UseDebugSessionOptions,
): UseDebugSessionResult {
  const interpreterRef = useRef<Interpreter | null>(null);
  const sourceRef = useRef<string | null>(null);
  const outputRef = useRef<string[]>([]);

  const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [boundBreakpoints, setBoundBreakpoints] = useState<number[]>([]);
  const [unboundBreakpoints, setUnboundBreakpoints] = useState<number[]>([]);

  const publishSnapshot = useCallback(
    (nextSnapshot: DebugSnapshot | null) => {
      setSnapshot(nextSnapshot);
      setError(nextSnapshot?.error ?? null);
      setOutput([...outputRef.current]);
      const currentLine =
        nextSnapshot?.status === "paused" ||
        nextSnapshot?.status === "waiting-for-input" ||
        nextSnapshot?.status === "error"
          ? (nextSnapshot.currentSource?.line ?? null)
          : null;
      options.onCurrentLineChange?.(currentLine);
      return nextSnapshot;
    },
    [options],
  );

  const start = useCallback(
    async (sourceCode: string): Promise<DebugSnapshot | null> => {
      try {
        const compiled = compileDebugProgram(sourceCode, options);
        outputRef.current = [];
        setOutput([]);
        setBoundBreakpoints(compiled.boundBreakpoints);
        setUnboundBreakpoints(compiled.unboundBreakpoints);
        setError(null);
        setIsStale(false);
        sourceRef.current = sourceCode;

        const interpreter = new Interpreter(
          compiled.instructions,
          {
            stdout: (message) => {
              outputRef.current = [...outputRef.current, message];
              setOutput([...outputRef.current]);
            },
            stdin: async () => "",
          },
          options.locale,
        );

        interpreterRef.current = interpreter;
        return publishSnapshot(
          interpreter.startDebug({ breakpoints: compiled.boundBreakpoints }),
        );
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Debug session failed";
        interpreterRef.current = null;
        outputRef.current = [];
        setSnapshot(null);
        setOutput([]);
        setError(message);
        options.onCurrentLineChange?.(null);
        return null;
      }
    },
    [options, publishSnapshot],
  );

  const continueExecution =
    useCallback(async (): Promise<DebugSnapshot | null> => {
      if (!interpreterRef.current) return null;
      return publishSnapshot(await interpreterRef.current.continueDebug());
    }, [publishSnapshot]);

  const stepInto = useCallback(async (): Promise<DebugSnapshot | null> => {
    if (!interpreterRef.current) return null;
    return publishSnapshot(await interpreterRef.current.stepIntoDebug());
  }, [publishSnapshot]);

  const stepOver = useCallback(async (): Promise<DebugSnapshot | null> => {
    if (!interpreterRef.current) return null;
    return publishSnapshot(await interpreterRef.current.stepOverDebug());
  }, [publishSnapshot]);

  const stepOut = useCallback(async (): Promise<DebugSnapshot | null> => {
    if (!interpreterRef.current) return null;
    return publishSnapshot(await interpreterRef.current.stepOutDebug());
  }, [publishSnapshot]);

  const stop = useCallback((): DebugSnapshot | null => {
    if (!interpreterRef.current) return null;
    const stopped = interpreterRef.current.stopDebug();
    interpreterRef.current = null;
    options.onCurrentLineChange?.(null);
    return publishSnapshot(stopped);
  }, [options, publishSnapshot]);

  const restart = useCallback(
    async (sourceCode?: string): Promise<DebugSnapshot | null> => {
      const nextSource = sourceCode ?? sourceRef.current;
      if (!nextSource) return null;
      return start(nextSource);
    },
    [start],
  );

  const provideInput = useCallback((value: string): void => {
    interpreterRef.current?.provideDebugInput(value);
  }, []);

  const markStale = useCallback((currentSourceCode?: string): void => {
    setIsStale(
      currentSourceCode === undefined || currentSourceCode !== sourceRef.current,
    );
  }, []);

  return {
    snapshot,
    output,
    error,
    isStale,
    boundBreakpoints,
    unboundBreakpoints,
    start,
    continueExecution,
    stepInto,
    stepOver,
    stepOut,
    stop,
    restart,
    provideInput,
    markStale,
  };
}
