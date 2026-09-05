import { TestCaseResults } from "@/components/test-case-results";
import { TTestCaseResult } from "@/types/submissions";

export function SubmitPanel({
  submitErrors,
  submitWarnings,
  testCaseResults,
  testCasesPassed,
  testCasesTotal,
  setShowSubmitPanel,
}: {
  submitErrors: string[];
  submitWarnings: string[];
  testCaseResults: TTestCaseResult[] | null;
  testCasesPassed: number;
  testCasesTotal: number;
  setShowSubmitPanel: (show: boolean) => void;
}) {
  return (
    <div className="relative z-10 border-b border-white/5">
      <div
        className={`px-6 py-3 ${submitErrors.length > 0 ? "bg-red-500/5" : "bg-emerald-500/5"} backdrop-blur-md`}
      >
        <div className="flex justify-between items-center mb-2">
          <h3
            className={`text-sm font-bold ${submitErrors.length > 0 ? "text-red-400" : "text-emerald-400"}`}
          >
            {submitErrors.length > 0
              ? `Submissão Falhou (${submitErrors.length} erro${submitErrors.length > 1 ? "s" : ""})`
              : "Submissão Enviada"}
          </h3>
          <button
            onClick={() => setShowSubmitPanel(false)}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            Fechar
          </button>
        </div>
        {submitErrors.length > 0 && (
          <div className="space-y-1 mb-2">
            {submitErrors.map((err, i) => (
              <div
                key={i}
                className="text-xs text-red-300 font-mono bg-red-500/10 px-3 py-1.5 rounded"
              >
                {err}
              </div>
            ))}
          </div>
        )}
        {submitWarnings.length > 0 && (
          <div className="space-y-1">
            {submitWarnings.map((warn, i) => (
              <div
                key={i}
                className="text-xs text-yellow-300 font-mono bg-yellow-500/10 px-3 py-1.5 rounded"
              >
                {warn}
              </div>
            ))}
          </div>
        )}
        {testCaseResults && testCaseResults.length > 0 && (
          <div className="mt-3">
            <TestCaseResults
              results={testCaseResults}
              passed={testCasesPassed}
              total={testCasesTotal}
            />
          </div>
        )}
      </div>
    </div>
  );
}
