import { useEffect, useState } from "react";
import { Check, ClipboardList, Copy, Users } from "lucide-react";
import { HeroLink } from "@/components/buttons/hero";
import { useAuth } from "@/contexts/AuthContext";
import type { ClassSummary } from "@/types/api";
import { t } from "@/i18n";
import { useRouter } from "next/router";

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.className = "fixed left-[-9999px] top-0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

export function TeacherClassCard({ cls }: { cls: ClassSummary }) {
  const { isTeacher } = useAuth();
  const { locale } = useRouter();
  const [copied, setCopied] = useState(false);
  const exerciseListLabel =
    cls._count.exerciseLists === 1
      ? t(locale, "ui.dashboard_exercise_list_singular")
      : t(locale, "ui.dashboard_exercise_list_plural");

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyAccessCode = async () => {
    try {
      await copyTextToClipboard(cls.accessCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden group shadow-[0_1px_10px_rgba(0,0,0,0.08)] dark:shadow-none relative bg-card/80 dark:bg-white/3 backdrop-blur-2xl border border-border dark:border-white/10 rounded-3xl p-7 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(13,204,242,0.15)] hover:-translate-y-1 flex flex-col h-full">
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl shadow-[0_0_10px_rgba(13,204,242,0.5)]" />

      <div className="flex justify-between items-start mb-1">
        <h3 className="capitalize text-xl font-bold group-hover:text-primary transition-colors leading-tight pr-4">
          {cls.name}
        </h3>
        {cls._count && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/70 dark:bg-white/5 border border-border dark:border-white/10 backdrop-blur-md shadow-inner shrink-0">
            <Users className="w-4 h-4 text-[#10b981]" />{" "}
            <span className="text-xs font-bold text-foreground">
              {cls._count.members || 0}
            </span>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed flex-1">
        {cls.description}
      </p>

      {isTeacher && (
        <button
          type="button"
          aria-label={t(locale, "ui.dashboard_copy_access_code")}
          onClick={copyAccessCode}
          className="group/code relative mb-3 flex w-full cursor-copy items-center justify-between rounded-2xl border border-border bg-muted/70 p-2 text-left backdrop-blur-md transition hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-white/5 dark:bg-gray-400/20 dark:hover:bg-primary/10"
        >
          <span
            role="status"
            className={`pointer-events-none absolute -top-9 right-2 rounded-md border border-primary/30 bg-background px-2.5 py-1 text-xs font-semibold text-primary shadow-lg transition-all duration-200 dark:bg-slate-950 ${
              copied
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0"
            }`}
          >
            {t(locale, "ui.dashboard_access_code_copied")}
          </span>
          <span>
            <span className="block text-xs font-semibold tracking-wider text-muted-foreground">
              {t(locale, "ui.dashboard_access_code_label")}
            </span>
            <span className="block text-base font-mono font-bold tracking-widest text-primary drop-shadow-[0_0_8px_rgba(13,204,242,0.4)] transition-colors group-hover/code:text-accent-foreground">
              {cls.accessCode}
            </span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition group-hover/code:border-primary/40 group-hover/code:text-primary dark:border-white/10 dark:bg-black/20">
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </span>
        </button>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground font-medium mb-6 px-1">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary/70" />
          <span>
            {cls._count.exerciseLists} {exerciseListLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-linear-to-br from-primary to-[#10b981] flex items-center justify-center text-[10px] font-bold text-slate-800">
            {(cls.teacher?.name || "P")[0].toUpperCase()}
          </div>
          <span>{cls.teacher?.name || t(locale, "ui.dashboard_teacher_fallback")}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-border dark:border-white/10 flex gap-3 mt-auto">
        <HeroLink
          variant="outline"
          href={`/classes/${cls.id}`}
          className="py-2 ml-auto"
        >
          {t(locale, "ui.dashboard_access_class")}
        </HeroLink>
      </div>
    </div>
  );
}
