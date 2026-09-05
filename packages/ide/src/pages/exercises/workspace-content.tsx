import { LockedLanguageBanner } from "@/components/exercise-workspace/LockedLanguageBanner";
import { EditorContext } from "@/contexts/editor/EditorContext";
import { useKeywords } from "@/contexts/keyword/KeywordContext";
import { useToast } from "@/contexts/ToastContext";
import { useValidateSubmissionMutation } from "@/hooks/use-api-queries";
import { getAuthToken } from "@/lib/auth-cookies";
import { ExerciseList } from "@/types/api";
import { TTestCaseResult } from "@/types/submissions";
import { IDE } from "@/views/ide";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Instructions } from "./instructions";
import { ListNavigatorSidebar } from "./list-navigator-sidebar";
import { SubmitPanel } from "./submit-panel";
import { Header } from "./header";

export function WorkspaceContent({
  exercise,
  userId,
  list,
  classId,
  onSubmitSuccess,
}: {
  exercise: any;
  userId: number;
  list?: ExerciseList;
  classId?: string;
  onSubmitSuccess?: (exerciseId: string | number) => void;
}) {
  const { showToast } = useToast();
  const { locale } = useRouter();
  const { getEditorCode } = useContext(EditorContext);
  const {
    buildLexerConfig,
    applyExternalCustomization,
    restoreActiveCustomization,
  } = useKeywords();

  // O backend já resolveu a precedência (exercício > lista > livre). O front
  // só aplica o que veio.
  useEffect(() => {
    const effective = exercise?.effectiveLanguage;
    if (effective?.customization) {
      applyExternalCustomization(effective.customization);
      return () => restoreActiveCustomization();
    }
    return undefined;
  }, [exercise, applyExternalCustomization, restoreActiveCustomization]);
  const validateSubmission = useValidateSubmissionMutation();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submitWarnings, setSubmitWarnings] = useState<string[]>([]);
  const [showSubmitPanel, setShowSubmitPanel] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState<
    TTestCaseResult[] | null
  >(null);
  const [testCasesPassed, setTestCasesPassed] = useState(0);
  const [testCasesTotal, setTestCasesTotal] = useState(0);

  const lastSubmission = exercise?.submissions?.[0];
  const isAlreadySubmitted =
    lastSubmission?.status === "SUBMITTED" ||
    lastSubmission?.status === "GRADED";

  const handleSubmit = async () => {
    setError("");
    setSubmitErrors([]);
    setSubmitWarnings([]);
    setShowSubmitPanel(false);
    setTestCaseResults(null);
    setSubmitted(false);

    const code = getEditorCode();
    if (!code || code.trim().length < 5) {
      setError("Escreva algum código antes de submeter!");
      return;
    }

    try {
      const lexerConfig = buildLexerConfig();
      const data = await validateSubmission.mutateAsync({
        payload: {
          exerciseId: exercise.id,
          exerciseListId: list?.id,
          classId,
          sourceCode: code,
          keywordMap: lexerConfig.keywordMap,
          operatorWordMap: lexerConfig.operatorWordMap,
          booleanLiteralMap: lexerConfig.booleanLiteralMap,
          statementTerminatorLexeme: lexerConfig.statementTerminatorLexeme,
          blockDelimiters: lexerConfig.blockDelimiters,
          indentationBlock: lexerConfig.indentationBlock,
          grammar: lexerConfig.grammar,
          locale,
        },
        headers: {
          "x-user-id": String(userId),
          "x-authorization": getAuthToken() ?? "",
        },
      });

      if (!data.valid) {
        setSubmitErrors(data.errors || []);
        setSubmitWarnings(data.warnings || []);
        setShowSubmitPanel(true);
        return;
      }

      if (data.warnings?.length > 0) {
        setSubmitWarnings(data.warnings);
      }
      if (data.testCaseResults) {
        setTestCaseResults(data.testCaseResults);
        setTestCasesPassed(data.testCasesPassed ?? 0);
        setTestCasesTotal(data.testCasesTotal ?? 0);
        setShowSubmitPanel(true);
      } else if (data.warnings?.length > 0) {
        setShowSubmitPanel(true);
      }
      setSubmitted(true);
      onSubmitSuccess?.(exercise.id);
      showToast({ type: "success", message: "Submissão enviada com sucesso!" });
    } catch {
      setError("Erro de conexão");
      showToast({ type: "error", message: "Erro de conexão ao submeter." });
    }
  };

  const publication = list?.classes?.find((c) => c.classId === Number(classId));
  const deadlineStr = publication?.deadline;
  const isOverdue = deadlineStr ? new Date(deadlineStr) < new Date() : false;

  return (
    <>
      <Header
        handleSubmit={handleSubmit}
        submitted={submitted}
        isAlreadySubmitted={isAlreadySubmitted}
        lastSubmission={lastSubmission}
        exercise={exercise}
        list={list}
        classId={classId}
        error={error}
        deadlineStr={deadlineStr}
        isOverdue={isOverdue}
        validateSubmission={validateSubmission}
      />
      {exercise?.effectiveLanguage && (
        <div className="relative z-10 px-6 py-2">
          <LockedLanguageBanner
            language={{
              id: exercise.effectiveLanguage.id,
              name: exercise.effectiveLanguage.name,
              description: exercise.effectiveLanguage.description,
            }}
            source={exercise.effectiveLanguageSource ?? "exercise"}
            listTitle={list?.title}
          />
        </div>
      )}

      {showSubmitPanel && (
        <SubmitPanel
          submitErrors={submitErrors}
          submitWarnings={submitWarnings}
          testCaseResults={testCaseResults}
          testCasesPassed={testCasesPassed}
          testCasesTotal={testCasesTotal}
          setShowSubmitPanel={setShowSubmitPanel}
        />
      )}

      <div className="relative z-10 flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        {list && (
          <ListNavigatorSidebar
            list={list}
            currentExerciseId={exercise.id}
            classId={classId}
          />
        )}

        <Instructions exercise={exercise} lastSubmission={lastSubmission} />
        <div className="p-3 flex-1 relative overflow-hidden">
          <IDE />
        </div>
      </div>
    </>
  );
}
