import { useState, useEffect } from "react";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";
import { EditorProvider } from "@/contexts/editor/EditorContext";
import { KeywordProvider } from "@/contexts/keyword/KeywordContext";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";
import { TerminalProvider } from "@/contexts/TerminalContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  useExerciseListQuery,
  useExerciseQuery,
  useExerciseSubmissionsQuery,
} from "@/hooks/use-api-queries";
import { WorkspaceContent } from "./workspace-content";

export default function ExerciseWorkspace({
  exerciseId,
  listId,
  classId,
}: {
  exerciseId: string;
  listId?: string;
  classId?: string;
}) {
  const { userId } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [localSubmittedIds, setLocalSubmittedIds] = useState<number[]>([]);
  const exerciseQuery = useExerciseQuery(
    exerciseId,
    Boolean(userId && exerciseId),
    listId,
  );
  const submissionsQuery = useExerciseSubmissionsQuery(
    exerciseId,
    Boolean(userId && exerciseId),
  );
  const listQuery = useExerciseListQuery(
    listId,
    classId ? { classId } : undefined,
    Boolean(userId && listId),
  );
  const exercise = exerciseQuery.data;
  const exerciseSubmissions = submissionsQuery.data as any[] | undefined;
  const list = listQuery.data;
  const lastSubmission = exerciseSubmissions?.[0] ?? exercise?.submissions?.[0];

  useEffect(() => {
    if (exerciseQuery.error || listQuery.error) {
      setError("Exercício não encontrado");
      showToast({ type: "error", message: "Exercício não encontrado." });
    }
  }, [exerciseQuery.error, listQuery.error, showToast]);

  if (
    exerciseQuery.isPending ||
    (listId && listQuery.isPending) ||
    submissionsQuery.isPending
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando exercício...</div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <div className="text-red-400">{error || "Erro desconhecido"}</div>
        <Link
          href="/dashboard"
          className="text-sm text-[#0dccf2] hover:underline"
        >
          Voltar ao Painel
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col overflow-hidden font-sans">
      <SpaceBackground />
      <EditorProvider
        key={exerciseId}
        storageScope={`exercise-${exerciseId}`}
        initialCode={lastSubmission?.codeSnapshot}
      >
        <KeywordProvider>
          <RuntimeErrorProvider>
            <TerminalProvider>
              <WorkspaceContent
                key={exerciseId}
                exercise={{
                  ...exercise,
                  submissions: exerciseSubmissions ?? exercise.submissions,
                }}
                userId={userId!}
                list={
                  list
                    ? {
                        ...list,
                        submittedExerciseIds: [
                          ...(list.submittedExerciseIds ?? []),
                          ...localSubmittedIds,
                        ],
                      }
                    : undefined
                }
                classId={classId}
                onSubmitSuccess={(id) => {
                  const parsedId = Number(id);
                  setLocalSubmittedIds((prev) =>
                    prev.includes(parsedId) ? prev : [...prev, parsedId],
                  );
                }}
              />
            </TerminalProvider>
          </RuntimeErrorProvider>
        </KeywordProvider>
      </EditorProvider>
    </div>
  );
}
