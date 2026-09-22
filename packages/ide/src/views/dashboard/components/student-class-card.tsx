import { Plus } from "lucide-react";
import type { ClassSummary } from "@/types/api";
import { TeacherClassCard } from "./teacher-class-card";
import { t } from "@/i18n";
import { useRouter } from "next/router";

export function StudentClassCard({
  cls,
}: {
  cls: ClassSummary;
  onJoinClick: () => void;
}) {
  return <TeacherClassCard cls={cls} />;
}

export function JoinClassCard({ onJoinClick }: { onJoinClick: () => void }) {
  const { locale } = useRouter();

  return (
    <button
      onClick={onJoinClick}
      className="rounded-xl border-2 border-dashed border-black/20 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all p-6 flex flex-col items-center justify-center group h-full min-h-[300px]"
    >
      <div className="w-14 h-14 rounded-full bg-muted dark:bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center text-muted-foreground group-hover:text-blue-500 transition-all mb-4">
        <Plus className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-lg mb-1 hidden sm:block">
        {t(locale, "ui.dashboard_join_class_card_title")}
      </h3>
      <p className="text-muted-foreground text-sm hidden sm:block text-center px-4">
        {t(locale, "ui.dashboard_join_class_card_description")}
      </p>
    </button>
  );
}
