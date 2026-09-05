import { useState, useEffect } from "react";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";
import { IDEProvider } from "@/views/ide";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  useExerciseListQuery,
  useExerciseQuery,
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
  const listQuery = useExerciseListQuery(
    listId,
    classId ? { classId } : undefined,
    Boolean(userId && listId),
  );
  const exercise = exerciseQuery.data;
  const list = listQuery.data;

  useEffect(() => {
    if (exerciseQuery.error || listQuery.error) {
      setError("Exercício não encontrado");
      showToast({ type: "error", message: "Exercício não encontrado." });
    }
  }, [exerciseQuery.error, listQuery.error, showToast]);

  if (exerciseQuery.isPending || (listId && listQuery.isPending)) {
    return (
      <div className="min-h-screen bg-[#101f22] flex items-center justify-center">
        <div className="text-slate-500">Carregando exercício...</div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-[#101f22] flex items-center justify-center flex-col gap-4">
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
    <div className="relative min-h-screen bg-[#101f22] text-slate-100 flex flex-col overflow-hidden font-sans">
      <SpaceBackground />
      <IDEProvider>
        <WorkspaceContent
          exercise={exercise}
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
      </IDEProvider>
    </div>
  );
}
