import { ReviewStepProps } from ".";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";

const CATEGORY_TONES: Record<string, string> = {
  tipos: "bg-cyan-400/5 text-cyan-300 ring-cyan-400/30",
  "i/o": "bg-emerald-400/5 text-emerald-300 ring-emerald-400/30",
  estrutura: "bg-slate-400/5 text-slate-300 ring-slate-400/30",
  booleanos: "bg-lime-400/5 text-lime-300 ring-lime-400/30",
  operadores: "bg-sky-400/5 text-sky-300 ring-sky-400/30",
  fluxo: "bg-violet-400/5 text-violet-300 ring-violet-400/30",
};

const LEXEME_CHIP_BASE =
  "inline-flex items-center rounded-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ring-1";

function resolveLexemeTone(title: string) {
  const key = title.trim().toLowerCase();
  return (
    CATEGORY_TONES[key] ?? "bg-slate-400/15 text-slate-300 ring-slate-400/30"
  );
}

export function CurrentVocabulary({ values }: Pick<ReviewStepProps, "values">) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/85 p-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Vocabulário atual da linguagem
      </p>
      <PerfectScrollbar className="px-1 py-1  mt-3 max-h-30 gap-2 flex flex-wrap">
        {values.vocabularySections.map((section) => {
          const tone = resolveLexemeTone(section.title);
          if (!section.items.length) return null;
          return section.items.map((item) => (
            <span
              key={`${section.title}-${item}`}
              className={`${LEXEME_CHIP_BASE} ${tone}`}
            >
              {item}
            </span>
          ));
        })}
      </PerfectScrollbar>
    </div>
  );
}
