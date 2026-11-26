import "./_theme";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ts-compilator-for-java/ide";
import { BookOpenText } from "lucide-react";

const sections = [
  {
    title: "Estrutura do programa",
    items: [
      "Todo programa começa por uma função sem parâmetros.",
      "Blocos são delimitados por chaves.",
    ],
    code: "int main() {\n  int x = 10;\n  print(x);\n}",
  },
  {
    title: "Entrada e saída",
    items: ["Use print para escrever no terminal.", "Use scan para ler um valor."],
    code: "int n;\nscan(n);\nprint(n * 2);",
  },
];

export const CompilerRules = () => (
  <Dialog defaultOpen>
    <DialogContent className="flex max-h-[88vh] max-w-3xl flex-col overflow-hidden">
      <DialogHeader className="items-start">
        <div className="flex items-center gap-2">
          <BookOpenText className="h-5 w-5 text-primary" aria-hidden="true" />
          <DialogTitle>Regras do compilador Java--</DialogTitle>
        </div>
        <DialogDescription>
          Referência rápida da sintaxe aceita pelo analisador.
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
        <div className="grid gap-3 md:grid-cols-2">
          {sections.map((section) => (
            <section
              key={section.title}
              className="mt-4 rounded-lg border border-black/10 bg-background p-4 dark:border-white/10"
            >
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <pre className="mt-4 overflow-auto rounded-lg border border-black/10 bg-black/5 p-3 text-xs leading-relaxed text-foreground dark:border-white/10 dark:bg-black/30">
                <code>{section.code}</code>
              </pre>
            </section>
          ))}
        </div>
      </div>
      <DialogFooter className="gap-2 sm:justify-end">
        <Button type="button" variant="outline">
          Fechar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
