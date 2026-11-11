import type { MarkerSeverity } from "monaco-editor";
import { ESeverity, TLineAlert } from "@/@types/editor";
import { useEditor } from "@/hooks/useEditor";
import { TLexerAnalyseData } from "@/types/compiler";
import { buildEffectiveKeywordMap } from "@/lib/keyword-map";
import { useState, useContext } from "react";
import { Lexer } from "@ts-compilator-for-java/compiler/src/lexer";
import type {
  BooleanLiteralMap,
  KeywordMap,
  LexerBlockDelimiters,
  OperatorWordMap,
} from "@ts-compilator-for-java/compiler/src/lexer/config";
import {
  IssueDetails,
  IssueError,
} from "@ts-compilator-for-java/compiler/issue";
import { useToast } from "@/contexts/ToastContext";
import { useKeywords } from "@/contexts/keyword/KeywordContext";
import { EditorContext } from "@/contexts/editor/EditorContext";
import { t } from "@/i18n";
import { useRouter } from "next/router";

type RunLexerAnalyseInput = {
  sourceCode: string;
  keywordMap?: KeywordMap;
  blockDelimiters?: LexerBlockDelimiters;
  indentationBlock?: boolean;
  grammar?: unknown;
  operatorWordMap?: OperatorWordMap;
  booleanLiteralMap?: BooleanLiteralMap;
  statementTerminatorLexeme?: string;
  locale?: string;
};

async function runLexerAnalyse(
  input: RunLexerAnalyseInput,
): Promise<TLexerAnalyseData> {
  try {
    const effectiveKeywordMap = buildEffectiveKeywordMap(input.keywordMap);
    const lexer = new Lexer(input.sourceCode, {
      customKeywords: effectiveKeywordMap,
      operatorWordMap: input.operatorWordMap,
      booleanLiteralMap: input.booleanLiteralMap,
      statementTerminatorLexeme: input.statementTerminatorLexeme,
      blockDelimiters: input.blockDelimiters,
      locale: input.locale,
      indentationBlock: input.indentationBlock,
    });
    const tokens = lexer.scanTokens();
    const warnings = lexer.warnings;
    const infos = lexer.infos;

    return {
      message:
        "Lexical Analysis completed" +
        (warnings.length ? " with warnings" : ""),
      tokens,
      warnings,
      infos,
      error: null,
    };
  } catch (error) {
    if (error instanceof IssueError) throw error;
    throw new Error((error as Error).message || "Codigo nao suportado");
  }
}

export function useLexerAnalyse() {
  const { showToast } = useToast();
  const { locale } = useRouter();
  // const [isLoading, setIsLoading] = useState(false);
  const { getEditorCode, showLineIssues, cleanIssues } = useEditor();
  const { buildLexerConfig } = useKeywords();
  const { currentFilePath, saveCurrentFile } = useContext(EditorContext);
  const [analyseData, setAnalyseData] = useState<TLexerAnalyseData>(
    {} as TLexerAnalyseData,
  );
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const handleRun = async (): Promise<
    TLexerAnalyseData["tokens"] | undefined
  > => {
    const code = getEditorCode();
    setAnalyseData({} as TLexerAnalyseData);
    try {
      cleanIssues();
      const lexerConfig = buildLexerConfig();
      const data = await runLexerAnalyse({
        sourceCode: code,
        keywordMap: lexerConfig.keywordMap,
        blockDelimiters: lexerConfig.blockDelimiters,
        indentationBlock: lexerConfig.indentationBlock,
        grammar: lexerConfig.grammar,
        operatorWordMap: lexerConfig.operatorWordMap,
        booleanLiteralMap: lexerConfig.booleanLiteralMap,
        statementTerminatorLexeme: lexerConfig.statementTerminatorLexeme,
        locale: locale,
      });
      const issues = [...data.warnings, ...data.infos];
      setAnalyseData(data);
      showToast({
        message: issues.length
          ? t(locale, "toast.lexer_completed_with_warnings")
          : t(locale, "toast.lexer_completed"),
        type: issues.length ? "warning" : "success",
      });
      setShowScrollArrow(true);
      if (issues.length) handleIssues(issues);

      // Save the file after successful lexer run
      if (currentFilePath) {
        saveCurrentFile(currentFilePath);
      }

      return data.tokens;
    } catch (error) {
      setAnalyseData({} as TLexerAnalyseData);
      if (error instanceof IssueError) {
        const lexerError = error.details;
        if (lexerError) handleIssues([lexerError], true);
        showToast({
          message: lexerError.message || t(locale, "toast.error_occurred"),
          type: "error",
        });
        return;
      }
      if (error instanceof Error) {
        showToast({
          message: error.message,
          type: "error",
        });
        return;
      }
    }
  };

  const handleIssues = (data: IssueDetails[], showDetails: boolean = false) => {
    const allLineIssues: TLineAlert[] = data.map((issue) => ({
      message: issue.message,
      startLineNumber: issue.line,
      endLineNumber: issue.line,
      startColumn: issue.column,
      endColumn: 100,
      severity: ESeverity[issue.type] as unknown as MarkerSeverity,
    }));
    showLineIssues(allLineIssues, showDetails);
  };

  return {
    analyseData,
    handleRun,
    showScrollArrow,
    setShowScrollArrow,
  };
}
