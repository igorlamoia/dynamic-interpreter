import { Input } from "@/components/ui/input";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";
import { Textarea } from "@/components/ui/textarea";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { cn } from "@/lib/utils";

export type KeywordReference = {
  glyph: string;
  label: string;
  className?: string;
};

export type KeywordReferenceTableItem<TKey extends string> = {
  id: TKey;
  value: string;
  description: string;
  reference: KeywordReference;
  editLabel?: string;
  placeholder?: string;
};

type KeywordReferenceRowProps<TKey extends string> = {
  item: KeywordReferenceTableItem<TKey>;
  onValueChange: (id: TKey, value: string) => void;
  onDescriptionChange: (id: TKey, value: string) => void;
};

export function KeywordReferenceRow<TKey extends string>({
  item,
  onValueChange,
  onDescriptionChange,
}: KeywordReferenceRowProps<TKey>) {
  const editLabel = item.editLabel ?? item.id;
  const { matches } = useBreakpoint("md");
  return (
    <div className="grid grid-cols-[6rem_minmax(9rem,1fr)] gap-4 px-4 py-5 md:grid-cols-[7rem_minmax(12rem,0.8fr)_minmax(16rem,1.2fr)] md:items-center">
      <div className="flex w-16 flex-col items-center justify-center gap-2 sm:w-20">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-9 min-w-9 items-center justify-center rounded-md border border-white/8 bg-black px-2 font-mono text-base font-bold leading-none",
            item.reference.className ?? "text-slate-300",
          )}
        >
          {item.reference.glyph}
        </span>
        <span className="text-center text-[10px] font-semibold uppercase leading-3 text-slate-600 dark:text-slate-500">
          {item.reference.label}
        </span>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500 md:sr-only">
          Nome customizado
        </span>
        <Input
          value={item.value}
          onChange={(event) => onValueChange(item.id, event.target.value)}
          placeholder={item.placeholder}
          aria-label={`Nome customizado para ${editLabel}`}
          spellCheck={false}
          className="h-11  text-cyan-300"
        />
      </label>

      <label className="col-span-2 flex flex-col gap-2 md:col-span-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500 md:sr-only">
          Definição semântica
        </span>
        <PerfectScrollbar>
          <Textarea
            value={item.description}
            onChange={(event) =>
              onDescriptionChange(item.id, event.target.value)
            }
            aria-label={`Definição semântica para ${editLabel}`}
            rows={matches ? 1 : 2}
            className="min-h-11 resize-y border-white/10 bg-transparent py-2.5 text-sm font-medium leading-6 md:resize-none"
          />
        </PerfectScrollbar>
      </label>
    </div>
  );
}

export function KeywordReferenceTable<TKey extends string>({
  title,
  items,
  referenceHeader = "Padrão",
  onValueChange,
  onDescriptionChange,
}: {
  title?: string;
  items: Array<KeywordReferenceTableItem<TKey>>;
  referenceHeader?: string;
  onValueChange: (id: TKey, value: string) => void;
  onDescriptionChange: (id: TKey, value: string) => void;
}) {
  return (
    <div className={cn(title && "space-y-3")}>
      {title && (
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
      )}

      <div className="overflow-hidden rounded-lg border border-white/7 bg-[#101827] shadow-[0_22px_70px_-42px_rgba(2,6,23,0.95)] dark:border-white/6 dark:bg-[#0D1424]">
        <div className="grid grid-cols-[6rem_minmax(9rem,1fr)] gap-4 border-b border-white/7 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-600 dark:text-slate-500 md:grid-cols-[7rem_minmax(12rem,0.8fr)_minmax(16rem,1.2fr)]">
          <span>{referenceHeader}</span>
          <span>Nome customizado</span>
          <span className="hidden md:block">Definição semântica</span>
        </div>

        <div className="divide-y divide-white/6">
          {items.map((item) => (
            <KeywordReferenceRow
              key={item.id}
              item={item}
              onValueChange={onValueChange}
              onDescriptionChange={onDescriptionChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
