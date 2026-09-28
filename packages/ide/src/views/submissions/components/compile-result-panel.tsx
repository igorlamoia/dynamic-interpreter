import type { TValidationResult } from "@/types/submissions";
import { TestCaseResults } from "@/components/test-case-results";
import { t } from "@/i18n";
import { useRouter } from "next/router";

export function CompileResultPanel({
  compileResult,
}: {
  compileResult: TValidationResult | null | undefined;
}) {
  const { locale } = useRouter();
  if (!compileResult) return null;
  const testCaseResults = compileResult.testCaseResults ?? [];

  return (
    <div
      className={`border rounded-2xl p-5 ${
        compileResult.valid
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-red-500/5 border-red-500/20"
      }`}
    >
      <h4
        className={`text-sm font-bold mb-3 ${compileResult.valid ? "text-emerald-400" : "text-red-400"}`}
      >
        {compileResult.valid
          ? t(locale, "ui.compile_success")
          : t(
              locale,
              (compileResult.errors?.length ?? 0) === 1
                ? "ui.compile_failed_singular"
                : "ui.compile_failed_plural",
              { count: compileResult.errors?.length ?? 0 },
            )}
      </h4>
      {compileResult.errors?.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {compileResult.errors.map((err: string, i: number) => (
            <div
              key={i}
              className="text-xs text-red-300 font-mono bg-red-500/10 px-3 py-2 rounded"
            >
              {err}
            </div>
          ))}
        </div>
      )}
      {compileResult.warnings?.length > 0 && (
        <div className="space-y-1.5">
          {compileResult.warnings.map((w: string, i: number) => (
            <div
              key={i}
              className="text-xs text-yellow-300 font-mono bg-yellow-500/10 px-3 py-2 rounded"
            >
              {w}
            </div>
          ))}
        </div>
      )}

      {testCaseResults.length > 0 && (
        <div className="mt-4 bg-card/80 dark:bg-[#182f34]/40 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl p-6">
          <TestCaseResults
            results={testCaseResults}
            passed={compileResult.testCasesPassed ?? 0}
            total={compileResult.testCasesTotal ?? 0}
          />
        </div>
      )}
    </div>
  );
}
