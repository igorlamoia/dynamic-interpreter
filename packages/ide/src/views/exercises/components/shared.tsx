import { Code2 } from "lucide-react";

export function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-card/70 dark:bg-white/2 rounded-3xl border border-border dark:border-white/5 backdrop-blur-xl">
      <div className="w-20 h-20 mb-5 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-border dark:border-white/10">
        <Code2 className="w-10 h-10 text-slate-600" />
      </div>
      <p className="text-foreground text-lg font-bold">
        Nenhum exercício encontrado
      </p>
      <p className="text-muted-foreground text-sm mt-2 max-w-xs text-center leading-relaxed">
        Crie seu primeiro exercício para utilizar nas listas das suas turmas.
      </p>
    </div>
  );
}
