import { Plus } from "lucide-react";
import { HeroButton } from "@/components/buttons/hero";
import { useAuth } from "@/contexts/AuthContext";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { Subtitle } from "@/components/text/subtitle";
import { t } from "@/i18n";
import { useRouter } from "next/router";

export function DashboardHeader({
  onCreateClass,
}: {
  onCreateClass: () => void;
}) {
  const { isTeacher } = useAuth();
  const { locale } = useRouter();

  if (!isTeacher) {
    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {t(locale, "ui.dashboard_student_title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(locale, "ui.dashboard_student_subtitle")}
          </p>
        </div>
        <div className="flex bg-card/70 dark:bg-white/5 p-1 rounded-xl border border-border dark:border-white/5">
          <button className="px-6 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
            {t(locale, "ui.dashboard_current_semester")}
          </button>
          <button className="px-6 py-2 rounded-lg text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors">
            {t(locale, "ui.dashboard_archived")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
      <div>
        <Title>
          <GradientText>
            {t(locale, "ui.dashboard_teacher_title")}
          </GradientText>
        </Title>
        <Subtitle className="mt-1">
          {t(locale, "ui.dashboard_teacher_subtitle")}
        </Subtitle>
      </div>
      <div className="flex gap-3">
        <HeroButton onClick={onCreateClass} className="group gap-2 px-6 py-3">
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          {t(locale, "ui.dashboard_new_class")}
        </HeroButton>
      </div>
    </div>
  );
}
