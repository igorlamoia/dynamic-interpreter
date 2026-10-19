import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HeroButton } from "@/components/buttons/hero";
import { t } from "@/i18n";
import { useRouter } from "next/router";
import type { Exercise } from "@/types/api";

export function ExerciseDetailModal({
  open,
  onOpenChange,
  exercise,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exercise: Exercise | null;
}) {
  const { locale } = useRouter();
  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{exercise.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {t(locale, "ui.exercises_created_at", {
              date: new Date(exercise.createdAt).toLocaleDateString(locale, {
              day: "2-digit",
              month: "long",
              year: "numeric",
              }),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] space-y-6 p-6">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {t(locale, "ui.exercises_statement")}
            </h4>
            <div className="p-4 bg-muted/60 dark:bg-black/20 rounded-xl border border-border dark:border-white/5 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {exercise.description}
            </div>
          </div>

          {/* Test Cases */}
          {exercise.testCases.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {t(locale, "ui.exercises_test_cases_with_count", {
                  count: exercise.testCases.length,
                })}
              </h4>
              <div className="space-y-3">
                {exercise.testCases.map((tc, idx) => (
                  <div
                    key={tc.id}
                    className="p-3 bg-muted/60 dark:bg-black/20 rounded-lg border border-border dark:border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-primary">
                        #{idx + 1}
                      </span>
                      {tc.label && (
                        <span className="text-xs text-muted-foreground">
                          {tc.label}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          {t(locale, "ui.dashboard_test_case_input_label")}
                        </p>
                        <pre className="text-xs font-mono text-emerald-700 dark:text-emerald-300 bg-background/80 dark:bg-black/30 p-2 rounded border border-border dark:border-white/5 whitespace-pre-wrap">
                          {tc.input || t(locale, "ui.empty_value")}
                        </pre>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          {t(locale, "ui.exercises_expected_output")}
                        </p>
                        <pre className="text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-background/80 dark:bg-black/30 p-2 rounded border border-border dark:border-white/5 whitespace-pre-wrap">
                          {tc.expectedOutput || t(locale, "ui.empty_value")}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-muted/60 border-t border-border dark:bg-white/5 dark:border-white/10">
          <HeroButton
            onClick={() => onOpenChange(false)}
            className="border-border bg-card/80 text-foreground hover:bg-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            variant="outline"
          >
            {t(locale, "ui.close")}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
