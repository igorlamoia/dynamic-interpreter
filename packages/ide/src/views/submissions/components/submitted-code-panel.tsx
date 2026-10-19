import { CodeScrollArea } from "@/components/ui/code-scroll-area";
import type { TValidationResult } from "@/types/submissions";
import { CompileResultPanel } from "./compile-result-panel";
import { t } from "@/i18n";
import { useRouter } from "next/router";

export function SubmittedCodePanel({
  codeSnapshot,
  exerciseDescription,
  compileResult,
  compiling,
  onRecompile,
}: {
  codeSnapshot: string | undefined;
  exerciseDescription: string | undefined;
  compileResult: TValidationResult | null | undefined;
  compiling: boolean;
  onRecompile: () => void;
}) {
  const { locale } = useRouter();

  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Code */}
      <div className="bg-card/80 dark:bg-[#182f34]/40 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-3 border-b border-border dark:border-white/5">
          <h3 className="text-sm font-semibold text-foreground">
            {t(locale, "ui.submitted_code_title")}
          </h3>
          <button
            onClick={onRecompile}
            disabled={compiling}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all disabled:opacity-50"
          >
            {compiling
              ? t(locale, "ui.compile_compiling")
              : t(locale, "ui.compile_recompile")}
          </button>
        </div>
        <CodeScrollArea className="max-h-[500px] bg-muted/60 dark:bg-black/20">
          <pre className="w-max min-w-full p-6 font-mono text-sm leading-relaxed text-foreground">
            <code>{codeSnapshot || t(locale, "ui.submitted_code_empty")}</code>
          </pre>
        </CodeScrollArea>
      </div>

      <CompileResultPanel compileResult={compileResult} />

      {/* Exercise Description */}
      <div className="bg-card/80 dark:bg-[#182f34]/40 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
          {t(locale, "ui.exercises_statement")}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {exerciseDescription}
        </p>
      </div>
    </div>
  );
}
