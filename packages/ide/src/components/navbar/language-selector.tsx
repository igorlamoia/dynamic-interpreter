import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { ChevronDown, LanguagesIcon } from "lucide-react";

import { SUPPORTED_LOCALES, t } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";

export function LanguageSelector() {
  const { locale, pathname, query } = useRouter();

  const currentLocale = useMemo(
    () =>
      SUPPORTED_LOCALES.find((targetLocale) => targetLocale.code === locale),
    [locale],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t(locale, "footer.language")}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/20 text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
        >
          <LanguagesIcon className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            {currentLocale?.code || locale}
          </span>
          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-35">
        {SUPPORTED_LOCALES.map((targetLocale) => (
          <DropdownMenuItem key={targetLocale.code} asChild>
            <Link
              href={{ pathname, query }}
              locale={targetLocale.code}
              className={cn(
                "flex items-center gap-2 text-xs",
                targetLocale.code === locale
                  ? "font-semibold text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-300",
              )}
            >
              <span>{targetLocale.flag}</span>
              <span>{targetLocale.code}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
