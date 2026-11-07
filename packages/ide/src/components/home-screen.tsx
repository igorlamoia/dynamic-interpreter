import { FileCode2, FolderOpen, Book, Rocket } from "lucide-react";
import { PerfectScrollbar } from "./ui/perfect-scrollbar";
import { t } from "@/i18n";
import { useRouter } from "next/router";

export function HomeScreen({ onStart }: { onStart: () => void }) {
  const { locale } = useRouter();
  return (
    <PerfectScrollbar className="flex h-full w-full items-center justify-center overflow-y-auto py-8">
      <div className="flex flex-col items-center gap-8 px-8 text-center max-h-full">
        {/* Logo/Icon */}
        {/* Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/20 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30">
            <FileCode2 className="h-12 w-12 text-cyan-400" />
          </div>
        </div>

        {/* Getting Started */}
        <button
          type="button"
          onClick={onStart}
          className="group w-full max-w-3xl cursor-pointer rounded-lg border bg-white/5 p-6 text-left transition-all hover:scale-[1.01] hover:border-blue-500/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
              <Rocket className="h-5 w-5 text-blue-400" />
            </div>
            <div className="space-y-2 text-left">
              <h3 className="text-sm font-semibold text-foreground">
                {t(locale, "ui.home_start_title")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(locale, "ui.home_start_description")} {" "}
                <code className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-400">
                  main()
                </code>{" "}
                {t(locale, "ui.home_start_entry_suffix")}
              </p>
            </div>
          </div>
        </button>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 w-full max-w-3xl">
          <button
            type="button"
            className="group flex flex-col items-center gap-3 rounded-lg border dark:border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-cyan-500/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                {t(locale, "ui.home_explore_files")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t(locale, "ui.home_explore_files_description")}
              </p>
            </div>
          </button>

          <button
            type="button"
            className="group flex flex-col items-center gap-3 rounded-lg border dark:border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-emerald-500/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
              <FileCode2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                {t(locale, "ui.home_create_file_description")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t(locale, "ui.create_file")}
              </p>
            </div>
          </button>

          <button
            type="button"
            className="group flex flex-col items-center gap-3 rounded-lg border dark:border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-purple-500/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500/20">
              <Book className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                {t(locale, "ui.home_documentation")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t(locale, "ui.home_documentation_description")}
              </p>
            </div>
          </button>
        </div>
      </div>
    </PerfectScrollbar>
  );
}
