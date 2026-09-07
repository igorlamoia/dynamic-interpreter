import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

export function TeacherListCard({
  list,
  classMap,
}: {
  list: ExerciseList;
  classMap: Record<string, string>;
}) {
  const classNames = list.classes
    .map((c) => classMap[c.classId] ?? String(c.classId).slice(0, 6))
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div className="overflow-hidden group relative bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-5 hover:border-[#0dccf2]/35 hover:shadow-[0_4px_24px_rgba(13,204,242,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
      {/* top accent on hover */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-slate-100 leading-snug line-clamp-2">
          {list.title}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#0dccf2]/60" />
          {list.items.length} exercício{list.items.length !== 1 ? "s" : ""}
        </span>
        {classNames.length > 0 && (
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#10b981]/60" />
            {classNames.join(", ")}
            {list.classes.length > 2 && ` +${list.classes.length - 2}`}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
        <Link
          href={`/exercise-lists/${list.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors"
        >
          Gerenciar
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 9;

export function TeacherView({
  classes,
}: {
  classes: ClassOption[];
}) {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const listsQuery = useExerciseListsQuery({ page, pageSize: PAGE_SIZE });

  const lists = Array.isArray(listsQuery.data)
    ? listsQuery.data
    : listsQuery.data?.items ?? [];
  const totalPages = Array.isArray(listsQuery.data)
    ? 1
    : listsQuery.data?.totalPages ?? 1;
  const totalItems = Array.isArray(listsQuery.data)
    ? listsQuery.data.length
    : listsQuery.data?.total ?? lists.length;

  const classMap = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  useEffect(() => {
    if (listsQuery.error) {
      showToast({ type: "error", message: "Erro ao carregar listas." });
    }
  }, [listsQuery.error, showToast]);

  const filtered = lists;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Title>
            <GradientText>Minhas Listas</GradientText>
          </Title>
          <Subtitle className="mt-1">
            Organize exercícios em listas e publique para suas turmas
          </Subtitle>
        </div>
        <HeroButton
          onClick={() => setShowCreate(true)}
          className="gap-2 px-5 py-2.5 shrink-0"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          Nova Lista
        </HeroButton>
      </div>

      {listsQuery.isPending ? (
        <LoadingSpinner label="Carregando listas..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-10 h-10 text-slate-600" />}
          title="Nenhuma lista encontrada"
          description="Crie sua primeira lista de exercícios para começar."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((list: ExerciseList) => (
              <TeacherListCard
                key={list.id}
                list={list}
                classMap={classMap}
              />
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

      <CreateListModal
        open={showCreate}
        onOpenChange={setShowCreate}
      />
    </>
  );
}
