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
    <div className="flex min-h-full flex-col bg-background font-sans text-foreground">
      <SpaceBackground />
      <Navbar />
      <div className="relative z-10 flex w-full flex-1">
        <Sidebar />
        <div className="flex w-full flex-1 flex-col">
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
