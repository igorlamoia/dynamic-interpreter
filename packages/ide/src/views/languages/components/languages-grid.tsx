import { Loader2 } from "lucide-react";
import type { LanguageSummary } from "@/lib/languages-api";
import { LanguageCard, type LanguageCardProps } from "./language-card";

type LanguagesGridProps = Omit<LanguageCardProps, "language" | "isActive"> & {
  languages: LanguageSummary[];
  loading: boolean;
  activeLanguageId: number | null;
  onCreate: () => void;
};

export function LanguagesGrid({
  languages,
  loading,
  activeLanguageId,
  onCreate,
  ...actions
}: LanguagesGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (languages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
        <p className="text-slate-400">
          Nenhuma linguagem salva ainda.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 rounded-xl bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400"
        >
          Criar a primeira
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {languages.map((language) => (
        <LanguageCard
          key={language.id}
          language={language}
          isActive={language.id === activeLanguageId}
          {...actions}
        />
      ))}
    </div>
  );
}
