import { useEffect, useState } from "react";
import loader from "@monaco-editor/loader";
import { CodeComparison } from "@/components/ui/code-comparison";
import { useTheme } from "@/contexts/ThemeContext";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import { DarkTheme, LightTheme } from "@/contexts/editor/EditorThemes";
import { useKeywordCustomizer } from "./keyword-customizer-context";
import {
  JAVAMM_LANGUAGE_ID,
  registerJavaMMLanguage,
} from "@/utils/compiler/editor/editor-language";
import { useWizardTranslation } from "./use-wizard-translation";

type PreviewCodeComparisonProps = {
  title: string;
  beforeCode: string;
  afterCode: string;
  beforeFocusedLines?: number[];
  afterFocusedLines?: number[];
  beforeFocusedWords?: string[];
  afterFocusedWords?: string[];
};

export function PreviewCodeComparison({
  title,
  beforeCode,
  afterCode,
  beforeFocusedLines,
  afterFocusedLines,
  beforeFocusedWords,
  afterFocusedWords,
}: PreviewCodeComparisonProps) {
  const { darkMode } = useTheme();
  const { draftCustomization } = useKeywordCustomizer();
  const wt = useWizardTranslation();
  const [beforeHighlightedHtml, setBeforeHighlightedHtml] = useState("");
  const [afterHighlightedHtml, setAfterHighlightedHtml] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const colorizeBothSides = async () => {
      try {
        const monaco = await loader.init();
        const baselineCustomization = getDefaultCustomizationState();

        monaco.editor.defineTheme("editor-glass-dark", DarkTheme);
        monaco.editor.defineTheme("editor-glass-light", LightTheme);
        monaco.editor.setTheme(
          darkMode ? "editor-glass-dark" : "editor-glass-light",
        );

        registerJavaMMLanguage(monaco, baselineCustomization.mappings, {
          blockMode: baselineCustomization.modes.block,
          blockDelimiters: baselineCustomization.blockDelimiters,
          operatorWordMap: baselineCustomization.operatorWordMap,
          booleanLiteralMap: baselineCustomization.booleanLiteralMap,
          languageDocumentation: baselineCustomization.languageDocumentation,
          statementTerminatorLexeme:
            baselineCustomization.statementTerminatorLexeme,
          typingMode: baselineCustomization.modes.typing,
          arrayMode: baselineCustomization.modes.array,
        });

        const beforeHtml = await monaco.editor.colorize(
          beforeCode,
          JAVAMM_LANGUAGE_ID,
          { tabSize: 2 },
        );

        registerJavaMMLanguage(monaco, draftCustomization.mappings, {
          blockMode: draftCustomization.modes.block,
          blockDelimiters: draftCustomization.blockDelimiters,
          operatorWordMap: draftCustomization.operatorWordMap,
          booleanLiteralMap: draftCustomization.booleanLiteralMap,
          languageDocumentation: draftCustomization.languageDocumentation,
          statementTerminatorLexeme:
            draftCustomization.statementTerminatorLexeme,
          typingMode: draftCustomization.modes.typing,
          arrayMode: draftCustomization.modes.array,
        });

        const afterHtml = await monaco.editor.colorize(
          afterCode,
          JAVAMM_LANGUAGE_ID,
          { tabSize: 2 },
        );

        if (!isCancelled) {
          setBeforeHighlightedHtml(beforeHtml);
          setAfterHighlightedHtml(afterHtml);
        }
      } catch {
        if (!isCancelled) {
          setBeforeHighlightedHtml("");
          setAfterHighlightedHtml("");
        }
      }
    };

    void colorizeBothSides();

    return () => {
      isCancelled = true;
    };
  }, [afterCode, beforeCode, darkMode, draftCustomization]);

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <CodeComparison
        beforeCode={beforeCode}
        afterCode={afterCode}
        beforeHighlightedHtml={beforeHighlightedHtml}
        afterHighlightedHtml={afterHighlightedHtml}
        beforeFocusedLines={beforeFocusedLines}
        afterFocusedLines={afterFocusedLines}
        beforeFocusedWords={beforeFocusedWords}
        afterFocusedWords={afterFocusedWords}
        filename={wt("codeComparison.filename")}
        lightTheme="github-light"
        darkTheme="github-dark"
        highlightColor="rgba(101, 117, 133, 0.16)"
      />
    </section>
  );
}
