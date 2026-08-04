import { Copy, Pencil, Star, Trash2 } from "lucide-react";
import type { LanguageSummary } from "@/lib/languages-api";

const DEFAULT_LANGUAGE_IMAGE = "/images/language-default.png";

export type LanguageCardProps = {
  language: LanguageSummary;
  isActive: boolean;
  // Verdadeiro enquanto ainda não sabemos qual linguagem está ativa (query em
  // voo). Nesse intervalo nenhum card pode se afirmar ativo nem inativo, e a
  // ação "Tornar ativa" fica desabilitada para não disparar uma mutação
  // inútil na linguagem que já está ativa.
  activeUnknown: boolean;
  onEdit: (id: number) => void;
  onSetActive: (id: number, name: string) => void;
  onClone: (id: number, name: string) => void;
  onDelete: (id: number, name: string) => void;
};

export function LanguageCard({
  language,
  isActive,
  activeUnknown,
  onEdit,
  onSetActive,
  onClone,
  onDelete,
}: LanguageCardProps) {
  return (
    <article
      data-testid="language-card"
      data-language-active={isActive ? "true" : "false"}
      aria-current={isActive ? "true" : undefined}
      className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors ${
        isActive
          ? "border-[#3b305c] bg-[#251e3c]"
          : "border-white/5 bg-white/5 hover:bg-white/10"
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
                aria-label="Linguagem ativa"
              />
            )}
            <h3 className="truncate font-semibold text-white">{language.name}</h3>
          </div>
          {language.description && (
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {language.description}
            </p>
          )}
          {language.clonedFromId !== null && (
            <span className="text-[11px] text-slate-500">(clone)</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Editar ${language.name}`}
          title="Editar"
          onClick={() => onEdit(language.id)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Tornar ${language.name} ativa`}
          title="Tornar ativa"
          disabled={isActive || activeUnknown}
          onClick={() => onSetActive(language.id, language.name)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <Star className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Duplicar ${language.name}`}
          title="Duplicar"
          onClick={() => onClone(language.id, language.name)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <Copy className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Excluir ${language.name}`}
          title="Excluir"
          onClick={() => onDelete(language.id, language.name)}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  );
}
