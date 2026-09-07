import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import type { ExerciseList } from "@/types/api";
import { TeacherDetailView } from "@/views/exercise-lists/components/teacher-detail-view";
import { StudentDetailView } from "@/views/exercise-lists/components/student-detail-view";
import type { ClassOption } from "@/views/exercise-lists/components/types";
import {
  useClassOptionsQuery,
  useExerciseListQuery,
} from "@/hooks/use-api-queries";

export default function ExerciseListDetailPage() {
  const router = useRouter();
  const { id, classId } = router.query as { id?: string; classId?: string };
  const { isTeacher, userId } = useAuth();
  const { showToast } = useToast();
  const listQuery = useExerciseListQuery(
    id,
    classId ? { classId } : undefined,
    Boolean(userId && id),
  );
  const classesQuery = useClassOptionsQuery(Boolean(userId && isTeacher));
  const list = listQuery.data ?? null;
  const classes = (classesQuery.data ?? []) as ClassOption[];

  useEffect(() => {
    if (listQuery.error) {
      showToast({ type: "error", message: "Lista não encontrada." });
      void router.push("/exercise-lists");
    }
  }, [listQuery.error, router, showToast]);

  if (listQuery.isPending || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0dccf2]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-background text-foreground">
      <SpaceBackground />
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <main className="max-w-4xl mx-auto px-6 py-10 w-full">
            {/* breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link
                href="/exercise-lists"
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Listas
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span className="text-foreground font-medium">
                {list?.title ?? "..."}
              </span>
            </nav>

            {list &&
              (isTeacher ? (
                <TeacherDetailView list={list} classes={classes} />
              ) : (
                <StudentDetailView list={list} classId={classId ?? ""} />
              ))}
          </main>
        </div>
      </div>
    </div>
  );
}

ExerciseListDetailPage.requireAuth = true;
