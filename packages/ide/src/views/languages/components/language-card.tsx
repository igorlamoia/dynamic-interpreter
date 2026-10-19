import {
  Copy,
  Dna,
  Globe2,
  LockKeyhole,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/router";
import type { LanguageSummary } from "@/lib/languages-api";
import { getLanguageDNAChips } from "../language-dna";
import { t } from "@/i18n";

const DEFAULT_LANGUAGE_IMAGE = "/images/language-default.png";

export type LanguageCardProps = {
  language: LanguageSummary;
  isActive: boolean;
  // Verdadeiro enquanto ainda não sabemos qual linguagem está ativa (query em
  // voo). Nesse intervalo nenhum card pode se afirmar ativo nem inativo, e a
  // ação "Tornar ativa" fica desabilitada para não disparar uma mutação
  // inútil na linguagem que já está ativa.
  activeUnknown: boolean;
  canPublish: boolean;
  onEdit: (id: number) => void;
  onSetActive: (id: number, name: string) => void;
  onClone: (id: number, name: string) => void;
  onDelete: (id: number, name: string) => void;
  onViewDna: (id: number, name: string) => void;
  onTogglePublication: (id: number, name: string, isPublic: boolean) => void;
};

export function LanguageCard({
  language,
  isActive,
  activeUnknown,
  canPublish,
  onEdit,
  onSetActive,
  onClone,
  onDelete,
  onViewDna,
  onTogglePublication,
}: LanguageCardProps) {
  const { locale } = useRouter();

  return (
    <article
      data-testid="language-card"
      data-language-active={isActive ? "true" : "false"}
      aria-current={isActive ? "true" : undefined}
      className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors ${
        isActive
          ? "border-primary/40 bg-primary/15 dark:border-primary/20 dark:bg-primary/10"
          : "border-border bg-card/80 hover:bg-accent dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={language.imageUrl || DEFAULT_LANGUAGE_IMAGE}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isActive && (
              <Star
                className="size-4 shrink-0 text-yellow-500"
                fill="currentColor"
                role="img"
                aria-label={t(locale, "ui.active_language")}
              />
            )}
            <h3 className="truncate font-semibold text-foreground">
              {language.name}
            </h3>
            {language.isPublic && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/8 dark:text-emerald-200">
                <Globe2 className="size-2.5" />
                {t(locale, "ui.languages_public")}
              </span>
            )}
          </div>
          {language.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {language.description}
            </p>
          )}
          {language.clonedFromId !== null && (
            <span className="text-[11px] text-muted-foreground">
              {t(locale, "ui.languages_clone_badge")}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex flex-wrap gap-1.5"
        aria-label={t(locale, "ui.languages_dna_summary")}
      >
        {getLanguageDNAChips(language.dna, locale).map((item) => (
          <span
            key={item}
            className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-700 dark:border-cyan-300/15 dark:bg-cyan-300/6 dark:text-cyan-100/90"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-1 border-t border-border pt-2 dark:border-white/5">
        <button
          type="button"
          aria-label={t(locale, "ui.languages_view_dna_named", {
            name: language.name,
          })}
          title={t(locale, "ui.languages_view_dna")}
          onClick={() => onViewDna(language.id, language.name)}
          className="mr-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-300/10 dark:text-cyan-200 dark:hover:text-cyan-100"
        >
          <Dna className="size-4" />
          {t(locale, "ui.languages_view_dna")}
        </button>
        {canPublish && (
          <button
            type="button"
            aria-label={t(
              locale,
              language.isPublic
                ? "ui.languages_unpublish_named"
                : "ui.languages_publish_named",
              { name: language.name },
            )}
            title={
              language.isPublic
                ? t(locale, "ui.languages_remove_from_community")
                : t(locale, "ui.languages_publish_to_community")
            }
            onClick={() =>
              onTogglePublication(
                language.id,
                language.name,
                !language.isPublic,
              )
            }
            className="rounded-lg p-2 text-muted-foreground hover:bg-emerald-400/10 hover:text-emerald-600 dark:hover:text-emerald-300"
          >
            {language.isPublic ? (
              <LockKeyhole className="size-4" />
            ) : (
              <Globe2 className="size-4" />
            )}
          </button>
        )}
        <button
          type="button"
          aria-label={t(locale, "ui.languages_edit_named", {
            name: language.name,
          })}
          title={t(locale, "ui.edit")}
          onClick={() => onEdit(language.id)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          aria-label={t(locale, "ui.languages_make_active_named", {
            name: language.name,
          })}
          title={t(locale, "ui.languages_make_active")}
          disabled={isActive || activeUnknown}
          onClick={() => onSetActive(language.id, language.name)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Star className="size-4" />
        </button>
        <button
          type="button"
          aria-label={t(locale, "ui.languages_duplicate_named", {
            name: language.name,
          })}
          title={t(locale, "ui.languages_duplicate")}
          onClick={() => onClone(language.id, language.name)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Copy className="size-4" />
        </button>
        <button
          type="button"
          aria-label={t(locale, "ui.languages_delete_named", {
            name: language.name,
          })}
          title={t(locale, "ui.delete")}
          onClick={() => onDelete(language.id, language.name)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  );
}
