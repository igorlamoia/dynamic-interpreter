import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useToast } from "@/contexts/ToastContext";
import { SubmissionInfoBar } from "@/views/submissions/components/submission-info-bar";
import { GradingPanel } from "@/views/submissions/components/grading-panel";
import { SubmittedCodePanel } from "@/views/submissions/components/submitted-code-panel";
import {
  useGradeSubmissionMutation,
  useSubmissionQuery,
  useValidateSubmissionMutation,
} from "@/hooks/use-api-queries";

export default function GradeSubmission() {
  const router = useRouter();
  const { userId } = useAuth();
  const { showToast } = useToast();
  const { id } = router.query;
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [compileResult, setCompileResult] = useState<any>(null);
  const submissionId = typeof id === "string" ? id : undefined;
  const submissionQuery = useSubmissionQuery(submissionId, Boolean(userId));
  const gradeSubmission = useGradeSubmissionMutation();
  const validateSubmission = useValidateSubmissionMutation();
  const submission = submissionQuery.data;

  useEffect(() => {
    if (!submission) return;
    if (submission.score != null) setScore(String(submission.score));
    if (submission.teacherFeedback) setFeedback(submission.teacherFeedback);
  }, [submission]);

  useEffect(() => {
    if (submissionQuery.error) {
      setError("Submissão não encontrada");
      showToast({ type: "error", message: "Submissão não encontrada." });
    }
  }, [showToast, submissionQuery.error]);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      if (!submissionId) return;
      await gradeSubmission.mutateAsync({
        submissionId,
        score: Number(score),
        teacherFeedback: feedback,
      });
      setSaved(true);
    } catch (error) {
      const message = getApiErrorMessage(error, "Erro ao salvar nota");
      setError(message);
      showToast({ type: "error", message });
    }
  };

  const handleRecompile = async () => {
    if (!submission?.codeSnapshot) return;
    setCompileResult(null);
    try {
      const data = await validateSubmission.mutateAsync({
        payload: {
          exerciseId: submission.exerciseId,
          sourceCode: submission.codeSnapshot,
        },
        params: { dryRun: "true" },
        headers: { "x-user-id": String(userId) },
      });
      setCompileResult(data);
    } catch {
      setCompileResult({ valid: false, errors: ["Erro de conexão"], warnings: [] });
      showToast({ type: "error", message: "Erro ao recompilar submissão." });
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (submissionQuery.isPending) {
    return (
      <div className="min-h-screen bg-[#101f22] flex items-center justify-center">
        <div className="text-slate-500">Carregando submissão...</div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-[#101f22] flex items-center justify-center flex-col gap-4">
        <div className="text-red-400">{error}</div>
        <Link href="/dashboard" className="text-sm text-[#0dccf2] hover:underline">
          Voltar ao Painel
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#101f22] text-slate-100 font-sans overflow-hidden">
      <SpaceBackground />

      <header className="relative z-20 w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Painel
          </Link>
          {submission?.exerciseListId && (
            <>
              <div className="h-4 w-px bg-white/10" />
              <Link
                href={`/exercise-lists/${submission.exerciseListId}`}
                className="text-sm text-[#0dccf2] hover:text-[#0dccf2]/80 transition-colors"
              >
                ← Voltar à Lista
              </Link>
            </>
          )}
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-lg font-bold text-white">Correção de Exercício</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <SubmissionInfoBar submission={submission} formatDate={formatDate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SubmittedCodePanel
            codeSnapshot={submission?.codeSnapshot}
            exerciseDescription={submission?.exercise?.description}
            compileResult={compileResult}
            compiling={validateSubmission.isPending}
            onRecompile={handleRecompile}
          />

          <GradingPanel
            score={score}
            setScore={setScore}
            feedback={feedback}
            setFeedback={setFeedback}
            saving={gradeSubmission.isPending}
            saved={saved}
            error={error}
            onSubmit={handleGrade}
            submissionStatus={submission?.status}
          />
        </div>
      </main>
    </div>
  );
}

GradeSubmission.requireAuth = true;
