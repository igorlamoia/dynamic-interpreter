import { Dna, Loader2, RefreshCw, X } from "lucide-react";
import { useLanguageDetail } from "@/hooks/useLanguages";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLanguageDNAChips } from "../language-dna";

type LanguageDnaDialogProps = {
  languageId: number | undefined;
  languageName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const OPERATOR_LABELS: Record<string, string> = {
  logical_or: "OU lógico",
  logical_and: "E lógico",
  logical_not: "Negação",
  less: "Menor que",
  less_equal: "Menor ou igual",
  greater: "Maior que",
  greater_equal: "Maior ou igual",
  equal_equal: "Igualdade",
  not_equal: "Diferença",
};

function ValueList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/3 p-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Configuração padrão</p>
      ) : (
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className="rounded-xl border border-white/6 bg-black/15 px-3 py-2"
            >
              <dt className="text-[11px] uppercase tracking-wider text-slate-500">
                {item.label}
              </dt>
              <dd className="mt-1 break-words font-mono text-sm text-cyan-100">
                {item.value || "Padrão do compilador"}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export function LanguageDnaDialog({
  languageId,
  languageName,
  open,
  onOpenChange,
}: LanguageDnaDialogProps) {
  const languageQuery = useLanguageDetail(languageId, open);
  const language = languageQuery.data;
  const customization = language?.customization;

  const keywords = (customization?.mappings ?? []).map((mapping) => ({
    label: mapping.original,
    value: mapping.custom,
  }));
  const operators = Object.entries(customization?.operatorWordMap ?? {}).map(
    ([key, value]) => ({ label: OPERATOR_LABELS[key] ?? key, value }),
  );
  const booleans = Object.entries(customization?.booleanLiteralMap ?? {}).map(
    ([key, value]) => ({
      label: key === "true" ? "Verdadeiro" : "Falso",
      value,
    }),
  );
  const documentation = Object.entries(
    customization?.languageDocumentation ?? {},
  ).map(([key, entry]) => ({ label: key, value: entry.description }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden border-cyan-400/20 bg-[#0c1019]/95 p-0 shadow-[0_0_80px_rgba(13,204,242,0.13)]">
        <DialogHeader className="border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(13,204,242,0.16),transparent_55%)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <Dna className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate text-xl">DNA da linguagem</DialogTitle>
              <DialogDescription className="truncate">
                {languageName || "Configuração da linguagem"}
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Fechar DNA da linguagem"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="overflow-y-auto p-5 sm:p-6">
          {languageQuery.isPending && (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="size-7 animate-spin text-cyan-300" />
              <p>Decodificando a linguagem...</p>
            </div>
          )}

          {languageQuery.isError && (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
              <p className="max-w-sm text-slate-300">
                Não foi possível carregar o DNA desta linguagem.
              </p>
              <button
                type="button"
                onClick={() => void languageQuery.refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
              >
                <RefreshCw className="size-4" />
                Tentar novamente
              </button>
            </div>
          )}

          {language && customization && (
            <div className="space-y-4">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Estrutura
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getLanguageDNAChips(language.dna).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 text-xs font-medium text-cyan-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <ValueList
                title="Delimitadores e terminador"
                items={[
                  {
                    label: "Abertura de bloco",
                    value: customization.blockDelimiters?.open ?? "",
                  },
                  {
                    label: "Fechamento de bloco",
                    value: customization.blockDelimiters?.close ?? "",
                  },
                  {
                    label: "Terminador",
                    value: customization.statementTerminatorLexeme ?? "",
                  },
                ]}
              />
              <ValueList title="Palavras-chave" items={keywords} />
              <ValueList title="Operadores por palavra" items={operators} />
              <ValueList title="Literais booleanos" items={booleans} />
              <ValueList title="Documentação" items={documentation} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
