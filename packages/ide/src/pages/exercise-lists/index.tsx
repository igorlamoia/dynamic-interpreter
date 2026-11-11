import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherView } from "@/views/exercise-lists/components/teacher-view";
import { StudentView } from "@/views/exercise-lists/components/student-view";
import { useClassesQuery } from "@/hooks/use-api-queries";

export default function ExerciseListsPage() {
  const { isTeacher, userId } = useAuth();
  const classesQuery = useClassesQuery(Boolean(userId && isTeacher));

  if (!userId) return null;

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-background text-foreground">
      <SpaceBackground />
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <main className="max-w-7xl mx-auto px-6 py-12 w-full">
            {isTeacher ? (
              <TeacherView classes={classesQuery.data ?? []} />
            ) : (
              <StudentView />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

ExerciseListsPage.requireAuth = true;
