import { t } from "@/i18n";
import { useRouter } from "next/router";

export function SubmissionInfoBar({
  submission,
  formatDate,
}: {
  submission: any;
  formatDate: (d: string) => string;
}) {
  const { locale } = useRouter();

  return (
    <div className="bg-card/80 dark:bg-[#182f34]/40 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            <span className="bg-linear-to-r from-primary to-[#10b981] bg-clip-text text-transparent">
              {submission?.exercise?.title}
            </span>
          </h2>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <span>
              👤{" "}
              {submission?.student?.name ||
                submission?.student?.email ||
                t(locale, "ui.submissions_student")}
            </span>
            <span>
              📅 {submission ? formatDate(submission.submittedAt) : ""}
            </span>
            <span>
              {t(locale, "ui.submissions_weight", {
                weight: submission?.exercise?.gradeWeight ?? "",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
              submission?.status === "GRADED"
                ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                : submission?.status === "SUBMITTED"
                  ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                  : "bg-yellow-500/15 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300"
            }`}
          >
            {submission?.status === "GRADED"
              ? `✅ ${t(locale, "ui.submission_status_corrected")}`
              : submission?.status === "SUBMITTED"
                ? `📩 ${t(locale, "ui.submission_status_sent")}`
                : t(locale, "ui.submission_status_pending_icon")}
          </span>
        </div>
      </div>
    </div>
  );
}
