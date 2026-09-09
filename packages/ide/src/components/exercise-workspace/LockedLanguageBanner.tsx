import { Lock } from "lucide-react";
import Image from "next/image";

type LockedLanguageBannerProps = {
  language: {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
  source?: "exercise" | "list";
  listTitle?: string | null;
};

export function LockedLanguageBanner({
  language,
  source = "exercise",
  listTitle,
}: LockedLanguageBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3  border-x-2 border-primary/80 bg-primary/10 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <Lock className="size-4 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="font-medium truncate">Linguagem fixa:</p>
          <p className="opacity-70 truncate text-xs">
            {source === "list" && listTitle
              ? `Travada pela lista "${listTitle}"`
              : "Travada por este exercício"}
          </p>
        </div>
      </div>
      <div className="group relative overflow-hidden rounded-2xl bg-slate-950 shadow-lg ring-1 ring-white/10 dark:border-slate-800">
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/5 via-slate-950/10 to-slate-950/80" />
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/15 to-transparent dark:from-white/5" />
        <Image
          src={language.imageUrl || "/images/language-default.png"}
          alt={language.name}
          width={320}
          height={500}
          unoptimized
          className="h-22 w-full object-cover object-center opacity-95 transition duration-500 group-hover:scale-[1.02]"
        />

        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="rounded-xl border border-white/10 bg-slate-950/55 p-2 backdrop-blur-[3px]">
            <p className="mt-1 text-sm font-semibold tracking-[0.02em] text-white">
              {language.name}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cyan-400/10" />
      </div>
    </div>
  );
}
