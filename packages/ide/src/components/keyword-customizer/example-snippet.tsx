import { useEffect, useMemo, useState } from "react";
import loader from "@monaco-editor/loader";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, LightTheme } from "@/contexts/editor/EditorThemes";
import {
  JAVAMM_LANGUAGE_ID,
  registerJavaMMLanguage,
} from "@/utils/compiler/editor/editor-language";
import { CodeScrollArea } from "@/components/ui/code-scroll-area";
import { useKeywordCustomizer } from "./keyword-customizer-context";
import { PerfectScrollbar } from "../ui/perfect-scrollbar";

type ExampleSnippetProps = {
  title?: string;
  code: string;
  output?: string[];
  input?: string[];
  showHeader?: boolean;
};

export function ExampleSnippet({
  title,
  code,
  output,
  input,
  showHeader = true,
}: ExampleSnippetProps) {
  const { darkMode } = useTheme();
  const { draftCustomization } = useKeywordCustomizer();
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const lines = useMemo(() => code.split("\n"), [code]);
  const hasOutput = Boolean(output?.length);
  const hasInput = Boolean(input?.length);

  useEffect(() => {
    let isCancelled = false;

    const colorizeSnippet = async () => {
      try {
        const monaco = await loader.init();

        monaco.editor.defineTheme("editor-glass-dark", DarkTheme);
        monaco.editor.defineTheme("editor-glass-light", LightTheme);

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

        monaco.editor.setTheme(
          darkMode ? "editor-glass-dark" : "editor-glass-light",
        );

        const html = await monaco.editor.colorize(code, JAVAMM_LANGUAGE_ID, {
          tabSize: 2,
        });

        if (!isCancelled) {
          setHighlightedCode(html);
        }
      } catch {
        if (!isCancelled) {
          setHighlightedCode(null);
        }
      }
    };

    void colorizeSnippet();

    return () => {
      isCancelled = true;
    };
  }, [code, darkMode, draftCustomization]);

  return (
    <section className="space-y-3">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {title}
        </p>
      )}
      <div
        className={`overflow-hidden rounded-2xl border ${
          darkMode
            ? "border-slate-800 bg-[#0b1020] shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)]"
            : "border-slate-200/80 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)]"
        }`}
      >
        {showHeader && (
          <div className="flex items-center justify-between border-b border-slate-800/10 px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/90" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Editor
            </span>
          </div>
        )}

        <div className="grid min-h-12 bg-[#090e1a] text-slate-100">
          <PerfectScrollbar className=" max-h-50 grid grid-cols-[2.5rem_minmax(0,1fr)]">
            <div className="border-r border-white/5 bg-black/10 px-2 py-4 text-right font-mono text-[11px] leading-6 text-slate-500">
              {lines.map((_, index) => (
                <div key={index}>{String(index + 1).padStart(2, "0")}</div>
              ))}
            </div>

            <div className="min-w-0">
              <pre className="w-max min-w-full p-4 font-mono text-xs leading-6 text-cyan-100">
                {highlightedCode ? (
                  <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                ) : (
                  <code>
                    {lines.map((line, index) => (
                      <span key={`${index}-${line}`}>
                        {line || " "}
                        {index < lines.length - 1 ? "\n" : null}
                      </span>
                    ))}
                  </code>
                )}
              </pre>
            </div>
          </PerfectScrollbar>

          {(hasInput || hasOutput) && (
            <div className="flex flex-col border-t border-white/8 bg-[#050914] px-4 py-3">
              <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Terminal
              </span>
              <div className="flex">
                {hasInput && (
                  <div className="flex flex-col flex-1">
                    <div className="items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-slate-600">
                        Entrada
                      </span>
                    </div>

                    <div className="font-mono text-xs leading-6 text-emerald-200">
                      {input!.map((line, index) => (
                        <div key={`${index}-${line}`}>{line || " "}</div>
                      ))}
                    </div>
                  </div>
                )}
                {hasOutput && (
                  <div className="border-l flex flex-col flex-1 ml-2 pl-2 border-white/8">
                    <div className=" items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-slate-600">
                        Saída
                      </span>
                    </div>

                    <div className="font-mono text-xs leading-6 text-emerald-200">
                      {output!.map((line, index) => (
                        <div key={`${index}-${line}`}>{line || " "}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
