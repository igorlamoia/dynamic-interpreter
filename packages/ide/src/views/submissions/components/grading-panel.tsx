export function GradingPanel({
  score,
  setScore,
  feedback,
  setFeedback,
  saving,
  saved,
  error,
  onSubmit,
  submissionStatus,
}: {
  score: string;
  setScore: (v: string) => void;
  feedback: string;
  setFeedback: (v: string) => void;
  saving: boolean;
  saved: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  submissionStatus: string | undefined;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-card/80 dark:bg-[#182f34]/40 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl p-6 sticky top-24">
        <h3 className="text-lg font-bold mb-6">
          <span className="bg-linear-to-r from-primary to-[#10b981] bg-clip-text text-transparent">
            Avaliação
          </span>
        </h3>

        {error && (
          <div className="text-xs text-red-400 mb-3 p-2 bg-red-500/10 rounded-lg">
            {error}
          </div>
        )}
        {saved && (
          <div className="text-xs text-emerald-400 mb-3 p-2 bg-emerald-500/10 rounded-lg">
            ✅ Nota salva com sucesso!
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Nota
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background/80 dark:bg-black/30 border border-input dark:border-white/10 rounded-lg text-foreground text-2xl font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="0.0"
            />
            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
              <span>Mínimo: 0</span>
              <span>Máximo: 10</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Feedback para o Aluno
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-background/80 dark:bg-black/30 border border-input dark:border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm resize-none"
              placeholder="Escreva seu feedback sobre o código do aluno..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold bg-linear-to-r from-primary to-[#10b981] text-slate-800 shadow-[0_0_15px_rgba(13,204,242,0.3)] hover:shadow-[0_0_25px_rgba(13,204,242,0.5)] hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving
              ? "Salvando..."
              : submissionStatus === "GRADED"
                ? "Atualizar Nota"
                : "Atribuir Nota"}
          </button>
        </form>
      </div>
    </div>
  );
}
