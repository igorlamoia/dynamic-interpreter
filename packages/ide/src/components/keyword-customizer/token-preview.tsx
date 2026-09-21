import { useWizardTranslation } from "./use-wizard-translation";

type TokenPreviewProps = {
  tokens: Array<{
    lexeme: string;
    type: number;
  }>;
};

export function TokenPreview({ tokens }: TokenPreviewProps) {
  const wt = useWizardTranslation();

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {wt("tokens.title")}
      </p>
      <div className="flex flex-wrap gap-2">
        {tokens.length ? (
          tokens.map((token, index) => (
            <span
              key={`${token.lexeme}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <span className="font-mono text-cyan-600 dark:text-cyan-300">
                {token.lexeme}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {token.type}
              </span>
            </span>
          ))
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {wt("tokens.empty")}
          </p>
        )}
      </div>
    </section>
  );
}
