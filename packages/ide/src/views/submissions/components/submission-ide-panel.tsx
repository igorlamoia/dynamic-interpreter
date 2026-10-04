import { useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { EditorContext, EditorProvider } from "@/contexts/editor/EditorContext";
import { KeywordProvider, useKeywords } from "@/contexts/keyword/KeywordContext";
import { TerminalProvider } from "@/contexts/TerminalContext";
import { IDE } from "@/views/ide";
import { submissionSnapshotToCustomization } from "@/lib/submission-language-snapshot";
import type {
  SubmissionLanguageSnapshot,
  TTestCaseResult,
} from "@/types/submissions";
import type { TestCase } from "@/types/api";
import { TestCaseResults } from "@/components/test-case-results";
import { t } from "@/i18n";
import { useRouter } from "next/router";

function SubmissionLanguageBridge({
  languageSnapshot,
  children,
}: {
  languageSnapshot: SubmissionLanguageSnapshot | undefined;
  children: ReactNode;
}) {
  const { applyExternalCustomization, restoreActiveCustomization } =
    useKeywords();
  const customization = useMemo(
    () => submissionSnapshotToCustomization(languageSnapshot),
    [languageSnapshot],
  );

  useEffect(() => {
    applyExternalCustomization(customization, {
      id: -1,
      name: "Submission snapshot",
      description: "",
      imageUrl: "",
    });

    return () => restoreActiveCustomization();
  }, [applyExternalCustomization, customization, restoreActiveCustomization]);

  return <>{children}</>;
}

function SubmissionCodeBridge({
  codeSnapshot,
  children,
}: {
  codeSnapshot: string | undefined;
  children: ReactNode;
}) {
  const { updateSourceCode } = useContext(EditorContext);
  const appliedSnapshotRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (codeSnapshot === undefined) return;
    if (appliedSnapshotRef.current === codeSnapshot) return;

    updateSourceCode(codeSnapshot);
    appliedSnapshotRef.current = codeSnapshot;
  }, [codeSnapshot, updateSourceCode]);

  return <>{children}</>;
}

export function SubmissionExerciseInfoPanel({
  exerciseDescription,
  testCases,
}: {
  exerciseDescription: string | undefined;
  testCases: TestCase[];
}) {
  const { locale } = useRouter();
  const sortedTestCases = [...testCases].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="bg-card/80 dark:bg-[#182f34]/40 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
          {t(locale, "ui.exercises_statement")}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {exerciseDescription}
        </p>
      </div>

      {sortedTestCases.length > 0 && (
        <div className="bg-card/80 dark:bg-[#182f34]/40 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            {t(locale, "ui.exercises_test_cases_with_count", {
              count: sortedTestCases.length,
            })}
          </h3>
          <div className="space-y-3">
            {sortedTestCases.map((testCase, index) => (
              <div
                key={testCase.id}
                className="rounded-xl border border-border bg-muted/50 p-3 dark:border-white/10 dark:bg-black/20"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">
                    #{index + 1}
                  </span>
                  {testCase.label && (
                    <span className="text-xs text-muted-foreground">
                      {testCase.label}
                    </span>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(locale, "ui.dashboard_test_case_input_label")}
                    </p>
                    <pre className="min-h-10 whitespace-pre-wrap rounded-lg border border-border bg-background/80 p-3 font-mono text-xs text-emerald-700 dark:border-white/10 dark:bg-black/30 dark:text-emerald-300">
                      {testCase.input || t(locale, "ui.empty_value")}
                    </pre>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(locale, "ui.exercises_expected_output")}
                    </p>
                    <pre className="min-h-10 whitespace-pre-wrap rounded-lg border border-border bg-background/80 p-3 font-mono text-xs text-cyan-700 dark:border-white/10 dark:bg-black/30 dark:text-cyan-300">
                      {testCase.expectedOutput || t(locale, "ui.empty_value")}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SubmissionIdePanel({
  submissionId,
  codeSnapshot,
  languageSnapshot,
  submissionTestCaseResults,
}: {
  submissionId: number | string | undefined;
  codeSnapshot: string | undefined;
  languageSnapshot: SubmissionLanguageSnapshot | undefined;
  submissionTestCaseResults: TTestCaseResult[];
}) {
  const storageScope = submissionId
    ? `submission-${submissionId}-grading`
    : "submission-grading";
  const passed = submissionTestCaseResults.filter((item) => item.passed).length;

  return (
    <div className="relative z-10 space-y-4">
      {submissionTestCaseResults.length > 0 && (
        <div className="bg-card/80 dark:bg-[#182f34]/40 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl p-6">
          <TestCaseResults
            results={submissionTestCaseResults}
            passed={passed}
            total={submissionTestCaseResults.length}
          />
        </div>
      )}

      <EditorProvider
        key={storageScope}
        storageScope={storageScope}
        initialCode={codeSnapshot}
      >
        <KeywordProvider>
          <TerminalProvider>
            <SubmissionCodeBridge codeSnapshot={codeSnapshot}>
              <SubmissionLanguageBridge languageSnapshot={languageSnapshot}>
                <IDE
                  className="w-full"
                  showAnalysisPanels={false}
                />
              </SubmissionLanguageBridge>
            </SubmissionCodeBridge>
          </TerminalProvider>
        </KeywordProvider>
      </EditorProvider>
    </div>
  );
}
