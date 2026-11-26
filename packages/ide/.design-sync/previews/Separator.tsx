import "./_theme";
import { Separator } from "@ts-compilator-for-java/ide";

export const Horizontal = () => (
  <div className="w-full max-w-sm p-6">
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-foreground">Lista 3 — Vetores</h4>
      <p className="text-xs text-muted-foreground">5 exercícios · prazo em 12/11</p>
    </div>
    <Separator className="my-4" />
    <p className="text-sm text-muted-foreground">
      Pratique leitura, soma e busca em vetores de inteiros.
    </p>
  </div>
);

export const Vertical = () => (
  <div className="p-6">
    <div className="flex h-5 items-center gap-4 text-sm text-foreground">
      <span>Léxico</span>
      <Separator orientation="vertical" />
      <span>Sintático</span>
      <Separator orientation="vertical" />
      <span>Intermediário</span>
      <Separator orientation="vertical" />
      <span>Execução</span>
    </div>
  </div>
);
