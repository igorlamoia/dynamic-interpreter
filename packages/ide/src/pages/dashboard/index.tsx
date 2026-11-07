import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SpaceBackground } from "@/components/space-background";
import { Alert } from "@/components/ui/alert";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { ClassesGrid } from "@/views/dashboard/components/classes-grid";
import { CreateClassModal } from "@/views/dashboard/components/create-class-modal";
import { DashboardHeader } from "@/views/dashboard/components/dashboard-header";
import { JoinClassModal } from "@/views/dashboard/components/join-class-modal";
import { useClassesQuery } from "@/hooks/use-api-queries";
import { useAuth } from "@/contexts/AuthContext";
import { CommunityDashboard } from "@/views/dashboard/components/community-dashboard";
import { t } from "@/i18n";

export default function Dashboard() {
  const { locale } = useRouter();
  const { isCommunity } = useAuth();
  const classesQuery = useClassesQuery(!isCommunity);
  const classes = classesQuery.data ?? [];

  // Modals
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (classesQuery.error) {
      setError(
        getApiErrorMessage(
          classesQuery.error,
          t(locale, "ui.dashboard_load_classes_error"),
        ),
      );
    }
  }, [classesQuery.error, locale]);

  const handleClassCreated = (message: string) => {
    setSuccess(message);
  };

  const handleClassJoined = (message: string) => {
    setSuccess(message);
    void classesQuery.refetch();
  };

  return (
    <div className="flex min-h-full flex-col bg-background font-sans text-foreground">
      <SpaceBackground />
      <Navbar />
      <div className="relative z-10 flex flex-1">
        <Sidebar />
        <div className="flex w-full flex-1 flex-col">
          <main className="mx-auto w-full max-w-7xl px-6 py-12">
            {isCommunity ? (
              <CommunityDashboard />
            ) : (
              <>
                {/* Alerts */}
                {error && (
                  <Alert
                    variant="error"
                    onClose={() => setError("")}
                    className="mb-8"
                  >
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert
                    variant="success"
                    onClose={() => setSuccess("")}
                    className="mb-8"
                  >
                    {success}
                  </Alert>
                )}

                <DashboardHeader
                  onCreateClass={() => setShowCreateClass(true)}
                />

                <ClassesGrid
                  classes={classes}
                  loading={classesQuery.isPending}
                  onJoinClass={() => setShowJoinClass(true)}
                />
              </>
            )}
          </main>

          {/* Modals */}
          {!isCommunity && (
            <>
              <CreateClassModal
                open={showCreateClass}
                onOpenChange={setShowCreateClass}
                onSuccess={handleClassCreated}
                onError={setError}
              />

              <JoinClassModal
                open={showJoinClass}
                onOpenChange={setShowJoinClass}
                onSuccess={handleClassJoined}
                onError={setError}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Dashboard.requireAuth = true;
