import "./_theme";
import { CodeScrollArea } from "@ts-compilator-for-java/ide";

const submittedCode = `// Lista 02 — Exercício 3: tabuada com laços aninhados (aluno: Ana Ribeiro, matrícula 2026104512)
int main() {
  int i, j;
  print("=== Tabuada de 1 a 5 ===\\n");
  for (i = 1; i <= 5; i = i + 1) {
    for (j = 1; j <= 10; j = j + 1) {
      print(i);
      print(" x ");
      print(j);
      print(" = ");
      print(i * j);
      print("\\n");
    }
    print("------------------------------\\n");
  }
  print("Fim da tabuada. Obrigado por usar o compilador Java--!\\n");
  return 0;
}`;

const tokens = [
  "INT  int        1:1",
  "IDENT main      1:5",
  "LPAREN (        1:9",
  "RPAREN )        1:10",
  "LBRACE {        1:12",
  "INT  int        2:3",
  "IDENT i         2:7",
  "COMMA ,         2:8",
  "IDENT j         2:10",
  "SEMI ;          2:11",
  "FOR  for        5:3",
  "LPAREN (        5:7",
  "IDENT i         5:8",
  "ASSIGN =        5:10",
  "INT_LIT 1       5:12",
  "SEMI ;          5:13",
  "IDENT i         5:15",
  "LE   <=         5:17",
  "INT_LIT 5       5:20",
  "SEMI ;          5:21",
  "IDENT i         5:23",
  "ASSIGN =        5:25",
  "IDENT i         5:27",
  "PLUS +          5:29",
  "INT_LIT 1       5:31",
  "RPAREN )        5:32",
  "LBRACE {        5:34",
];

export const SubmittedCode = () => (
  <div className="max-w-lg p-6">
    <CodeScrollArea className="h-64 rounded-xl border border-border bg-muted/60 dark:border-white/10 dark:bg-black/20">
      <pre className="w-max min-w-full p-6 font-mono text-sm leading-relaxed text-foreground">
        <code>{submittedCode}</code>
      </pre>
    </CodeScrollArea>
  </div>
);

export const VerticalOnly = () => (
  <div className="max-w-xs p-6">
    <CodeScrollArea
      axis="y"
      size={8}
      className="h-64 rounded-xl bg-card/40 ring-1 ring-black/8 dark:bg-[#0a1020]/80 dark:ring-white/8"
    >
      <ul className="space-y-1 p-4 font-mono text-xs text-muted-foreground">
        {tokens.map((token, i) => (
          <li key={i} className="whitespace-pre">
            {token}
          </li>
        ))}
      </ul>
    </CodeScrollArea>
  </div>
);
