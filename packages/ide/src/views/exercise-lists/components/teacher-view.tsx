import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useToast } from "@/contexts/ToastContext";
import { HeroButton } from "@/components/buttons/hero";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { Subtitle } from "@/components/text/subtitle";
import { BookOpen, ChevronRight, ListChecks, Plus, Users } from "lucide-react";
import type { ExerciseList } from "@/types/api";
import type { ClassOption } from "./types";
import { LoadingSpinner, EmptyState } from "./shared";
import { CreateListModal } from "./create-list-modal";
import { useExerciseListsQuery } from "@/hooks/use-api-queries";
import { t } from "@/i18n";

export function TeacherListCard({
  list,
  classMap,
}: {
  list: ExerciseList;
  classMap: Record<string, string>;
}) {
  const { locale } = useRouter();
  const classNames = list.classes
    .map((c) => classMap[c.classId] ?? String(c.classId).slice(0, 6))
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div className="overflow-hidden group relative bg-card/80 dark:bg-white/3 backdrop-blur-xl border border-border dark:border-white/8 rounded-2xl p-5 hover:border-primary/35 hover:shadow-[0_4px_24px_rgba(13,204,242,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
      {/* top accent on hover */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-primary to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-foreground leading-snug line-clamp-2">
          {list.title}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-primary/60" />
          {t(
            locale,
            list.items.length === 1
              ? "ui.exercise_lists_exercise_singular"
              : "ui.exercise_lists_exercise_plural",
            { count: list.items.length },
          )}
        </span>
        {classNames.length > 0 && (
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#10b981]/60" />
            {classNames.join(", ")}
            {list.classes.length > 2 && ` +${list.classes.length - 2}`}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border dark:border-white/5">
        <Link
          href={`/exercise-lists/${list.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
        >
          {t(locale, "ui.exercise_lists_manage")}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 9;

export function TeacherView({ classes }: { classes: ClassOption[] }) {
  const { locale } = useRouter();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const listsQuery = useExerciseListsQuery({ page, pageSize: PAGE_SIZE });

  const lists = Array.isArray(listsQuery.data)
    ? listsQuery.data
    : (listsQuery.data?.items ?? []);
  const totalPages = Array.isArray(listsQuery.data)
    ? 1
    : (listsQuery.data?.totalPages ?? 1);
  const totalItems = Array.isArray(listsQuery.data)
    ? listsQuery.data.length
    : (listsQuery.data?.total ?? lists.length);

  const classMap = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  useEffect(() => {
    if (listsQuery.error) {
      showToast({
        type: "error",
        message: t(locale, "ui.exercise_lists_load_error"),
      });
    }
  }, [listsQuery.error, locale, showToast]);

  const filtered = lists;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Title>
            <GradientText>{t(locale, "ui.exercise_lists_my_lists")}</GradientText>
          </Title>
          <Subtitle className="mt-1">
            {t(locale, "ui.exercise_lists_teacher_subtitle")}
          </Subtitle>
        </div>
        <HeroButton
          onClick={() => setShowCreate(true)}
          className="gap-2 px-5 py-2.5 shrink-0"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          {t(locale, "ui.exercise_lists_new_list")}
        </HeroButton>
      </div>

      {listsQuery.isPending ? (
        <LoadingSpinner label={t(locale, "ui.exercise_lists_loading")} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-10 h-10 text-slate-600" />}
          title={t(locale, "ui.exercise_lists_empty_teacher_title")}
          description={t(locale, "ui.exercise_lists_empty_teacher_description")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((list: ExerciseList) => (
              <TeacherListCard key={list.id} list={list} classMap={classMap} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            className="mt-8"
          />
        </>
      )}

      <CreateListModal open={showCreate} onOpenChange={setShowCreate} />
    </>
  );
}
