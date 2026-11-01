import "./_theme";
import { PerfectScrollbar } from "@ts-compilator-for-java/ide";
import { FileCode2, X } from "lucide-react";

const openTabs = [
  "main.java",
  "fatorial.java",
  "soma-pares.java",
  "fibonacci.java",
  "tabuada.java",
  "media-notas.java",
  "maior-de-tres.java",
  "contador.java",
];

const files = [
  "lista-01/ola-mundo.java",
  "lista-01/media-notas.java",
  "lista-01/maior-de-tres.java",
  "lista-02/fatorial.java",
  "lista-02/fibonacci.java",
  "lista-02/soma-pares.java",
  "lista-02/tabuada.java",
  "lista-03/vetor-inverso.java",
  "lista-03/busca-binaria.java",
  "lista-03/bubble-sort.java",
  "lista-04/palindromo.java",
  "lista-04/contador-vogais.java",
  "rascunhos/teste-for.java",
];

export const ExplorerList = () => (
  <div className="max-w-xs p-6">
    <PerfectScrollbar
      axis="y"
      size={6}
      className="h-64 rounded-xl border border-border bg-card/60 p-2 dark:border-white/10 dark:bg-[#182f34]/40"
    >
      {files.map((file) => (
        <div
          key={file}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <FileCode2 className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{file}</span>
        </div>
      ))}
    </PerfectScrollbar>
  </div>
);

export const HorizontalTabs = () => (
  <div className="max-w-md p-6">
    <PerfectScrollbar
      height={4}
      className="flex items-center gap-2 border-b border-black/10 bg-white/5 px-2 py-2 dark:border-white/10"
    >
      {openTabs.map((tab, i) => (
        <span
          key={tab}
          className={
            i === 0
              ? "flex shrink-0 items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-xs text-foreground"
              : "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground"
          }
        >
          {tab}
          <X className="ml-1 h-3 w-3" />
        </span>
      ))}
    </PerfectScrollbar>
  </div>
);
