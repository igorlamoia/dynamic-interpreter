import "./_theme";
import { Marquee } from "@ts-compilator-for-java/ide";
import { Star, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { CSSProperties } from "react";

// Token cards in the IDE's token palette (src/utils/compiler/styles).
const reserved = { text: "text-blue-500", bg: "bg-blue-100 dark:bg-sky-900/55", border: "border-blue-500" };
const identifier = { text: "text-purple-500", bg: "bg-purple-100 dark:bg-fuchsia-900/55", border: "border-purple-500" };
const literal = { text: "text-red-500", bg: "bg-red-100 dark:bg-rose-900/55", border: "border-red-500" };
const arithmetic = { text: "text-yellow-500", bg: "bg-yellow-100 dark:bg-amber-900/55", border: "border-yellow-500" };

const firstTokens = [
  { label: "Palavra reservada", type: 7, lexeme: "int", line: 1, column: 0, style: reserved },
  { label: "Identificador", type: 1, lexeme: "main", line: 1, column: 4, style: identifier },
  { label: "Palavra reservada", type: 12, lexeme: "while", line: 3, column: 2, style: reserved },
];

const lastTokens = [
  { label: "Literal inteiro", type: 2, lexeme: "10", line: 2, column: 10, style: literal },
  { label: "Soma", type: 20, lexeme: "+", line: 4, column: 8, style: arithmetic },
  { label: "Literal string", type: 4, lexeme: "\"fim\"", line: 6, column: 8, style: literal },
];

const TokenTile = ({ t }: { t: (typeof firstTokens)[number] }) => (
  <div className={`mx-2 w-64 rounded-xl border p-4 shadow-lg dark:shadow-black/50 ${t.style.bg} ${t.style.border}`}>
    <div className={`mb-3 text-center ${t.style.text}`}>
      <strong className="tracking-wide">{t.label}</strong>
    </div>
    <div className="grid grid-cols-12 text-sm text-slate-100">
      <div className="col-span-5">
        <strong>Linha:</strong> {t.line}
      </div>
      <div className="col-span-2 rounded-full border dark:border-white/20 dark:bg-slate-950/60 px-2 text-center">
        <strong className={t.style.text}>{t.type}</strong>
      </div>
      <div className="col-span-5 text-end">
        <strong>Coluna:</strong> {t.column}
      </div>
    </div>
    <div className="mt-3 rounded-lg border dark:border-white/20 dark:bg-slate-950/55 px-2.5 py-1.5 text-sm text-slate-100">
      <strong>Lexema:</strong> <span className={t.style.text}>{t.lexeme}</span>
    </div>
  </div>
);

const testimonials = [
  { name: "Ana Souza", turma: "Algoritmos I", text: "Ver os tokens do meu código me ajudou a entender o analisador léxico." },
  { name: "Bruno Lima", turma: "Compiladores", text: "Trocar as palavras-chave para português deixou as aulas muito mais leves." },
  { name: "Carla Dias", turma: "Algoritmos I", text: "O terminal integrado mostra exatamente onde meu while travou." },
  { name: "Diego Rocha", turma: "Estruturas de Dados", text: "Corrigir as listas de exercícios ficou bem mais rápido." },
];

const submissions = [
  { name: "Eduarda Melo", exercise: "Fatorial com while", tone: "ok" },
  { name: "Felipe Nunes", exercise: "Soma de pares", tone: "fail" },
  { name: "Gabriela Reis", exercise: "Tabuada com for", tone: "ok" },
  { name: "Henrique Alves", exercise: "Maior de três números", tone: "wait" },
  { name: "Isabela Costa", exercise: "Média da turma", tone: "ok" },
];

const toneIcon = {
  ok: <CheckCircle2 className="size-4 text-emerald-400" />,
  fail: <XCircle className="size-4 text-red-400" />,
  wait: <Clock className="size-4 text-amber-400" />,
};

const fadeX: CSSProperties = {
  maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
  WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
};

export const TokenRows = () => (
  <div
    className="relative mx-auto flex flex-col overflow-hidden py-6"
    style={{ ...fadeX, width: 720, "--duration": "30s" } as CSSProperties}
  >
    <Marquee pauseOnHover repeat={6}>
      {firstTokens.map((t) => (
        <TokenTile key={t.lexeme} t={t} />
      ))}
    </Marquee>
    <Marquee pauseOnHover reverse repeat={6}>
      {lastTokens.map((t) => (
        <TokenTile key={t.lexeme} t={t} />
      ))}
    </Marquee>
  </div>
);

export const Testimonials = () => (
  <div
    className="relative mx-auto overflow-hidden py-6"
    style={{ ...fadeX, width: 720, "--duration": "40s" } as CSSProperties}
  >
    <Marquee pauseOnHover className="[--gap:1.5rem]">
      {testimonials.map((t) => (
        <figure key={t.name} className="w-72 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
          <div className="mb-2 flex gap-0.5 text-amber-400">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-4" fill="currentColor" />
            ))}
          </div>
          <blockquote className="text-sm text-foreground">“{t.text}”</blockquote>
          <figcaption className="mt-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{t.name}</span> · {t.turma}
          </figcaption>
        </figure>
      ))}
    </Marquee>
  </div>
);

export const VerticalFeed = () => (
  <div className="flex justify-center p-6">
    <div
      className="relative h-80 w-72 overflow-hidden rounded-xl border border-border bg-background"
      style={
        {
          "--duration": "20s",
          maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        } as CSSProperties
      }
    >
      <Marquee vertical repeat={3} className="h-full [--gap:0.5rem]">
        {submissions.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2.5"
          >
            {toneIcon[s.tone as keyof typeof toneIcon]}
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
              <span className="truncate text-xs text-muted-foreground">{s.exercise}</span>
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  </div>
);
