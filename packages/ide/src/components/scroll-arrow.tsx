import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/router";
import { t } from "@/i18n";

export function ScrollArrow() {
  const { locale } = useRouter();
  const [scrollY, setScrollY] = useState(() =>
    typeof window === "undefined" ? 0 : window.scrollY,
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (scrollY <= 700) return null;

  return (
    <button
      type="button"
      aria-label={t(locale, "ui.scroll_to_top")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-8 bottom-[90px] z-100 group cursor-pointer animate-bounce-down rounded-full border border-neutral-200 bg-white/90 px-3 py-3 shadow-lg backdrop-blur-xs transition-opacity duration-1000 dark:border-neutral-700 dark:bg-neutral-900/30"
    >
      <ArrowUp className="w-6 h-6 group-hover:text-(--color-primary) transition-colors" />
    </button>
  );
}
