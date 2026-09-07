import { TToken, TTokenStyle } from "@/@types/token";
import { useEditor } from "@/hooks/useEditor";
import { t, translateTokenDescription } from "@/i18n";
import { TOKENS } from "@ts-compilator-for-java/compiler/src/token/constants";
import { useRouter } from "next/router";

export type TokenCardProps = {
  token: TToken;
  styles: TTokenStyle;
};

export function TokenCard({ token, styles }: TokenCardProps) {
  const { showLineIssues } = useEditor();
  const { locale } = useRouter();
  const tokenName = TOKENS.BY_ID[token.type];
  const tokenLabel =
    token.custom?.trim() ||
    (tokenName ? translateTokenDescription(locale, tokenName) : token.lexeme);

  const handleTokenClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    showLineIssues([
      {
        startLineNumber: token.line,
        startColumn: token.column + 1,
        endLineNumber: token.line,
        endColumn: token.column + 1 + token.lexeme.length,
        message: t(locale, "ui.token_selected", { lexeme: token.lexeme }),
        severity: 2,
      },
    ]);
  };

  return (
    <div
      className={`
        group
        relative
        isolate
        w-full min-w-64
        cursor-pointer
        overflow-hidden
        rounded-xl
        border
        dark:border-white/35 dark:border-white/20
        ${styles.bg}
        p-4
        shadow-lg shadow-black/5 dark:shadow-black/50
        backdrop-blur-md
        transition-all duration-300
        hover:-translate-y-0.5
        hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/65
        ${styles.border}
      `}
      onClick={handleTokenClick}
      style={{ flex: "1 1 20%", height: "100%" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-br from-white/35 to-white/0 dark:from-white/14 dark:to-transparent" />
      <div className="pointer-events-none absolute -top-10 right-8 h-24 w-24 rounded-full bg-white/30 blur-2xl dark:bg-cyan-200/15" />
      <div className="pointer-events-none absolute -top-14 left-8 h-36 w-36 rounded-full bg-white/60 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-cyan-100/30" />

      <div className={`relative z-10 mx-auto mb-3 text-center ${styles.text}`}>
        <strong className="tracking-wide">{tokenLabel}</strong>
      </div>
      <div className="relative z-10 grid grid-cols-12 text-sm text-slate-700 dark:text-slate-100">
        <div className="col-span-5">
          <strong>{t(locale, "ui.line")}: </strong> <span>{token.line}</span>
        </div>
        <div
          className={`
            col-span-2
            text-center
            rounded-full
            border dark:border-white/35 dark:border-white/20
            bg-white/35 dark:bg-slate-950/60
            px-2.5 py-0.5
            text-sm
            shadow-sm
            backdrop-blur-sm
          `}
        >
          <span className={styles.text}>
            <strong>{token.type}</strong>
          </span>
        </div>
        <div className="col-span-5 text-end">
          <strong>{t(locale, "ui.column")}: </strong>{" "}
          <span>{token.column}</span>
        </div>
      </div>
      <div
        className={`
          relative z-10 mt-3
          rounded-lg
          border dark:border-white/35 dark:border-white/20
          bg-white/30 dark:bg-slate-950/55
          px-2.5 py-1.5
          text-sm
          text-slate-700 dark:text-slate-100
          shadow-sm
          backdrop-blur-sm
        `}
      >
        <strong>{t(locale, "ui.lexeme")}: </strong>
        <span className={styles.text} style={{ whiteSpace: "pre-wrap" }}>
          {token.lexeme
            .replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t")
            .replace(/\r/g, "\\r")}
        </span>
      </div>
    </div>
  );
}
