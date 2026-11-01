import "./_theme";
import { Badge } from "@ts-compilator-for-java/ide";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Badge>Professor</Badge>
    <Badge variant="secondary">Aluno</Badge>
    <Badge variant="success">Aceito</Badge>
    <Badge variant="error">Erro de compilação</Badge>
    <Badge variant="warning">Pendente</Badge>
    <Badge variant="info">Em correção</Badge>
  </div>
);

export const SubmissionStatus = () => (
  <div className="flex w-full max-w-md flex-col gap-2 p-6">
    {[
      { title: "Soma de dois números", variant: "success" as const, label: "Aceito" },
      { title: "Fatorial recursivo", variant: "error" as const, label: "Resposta errada" },
      { title: "Média de notas", variant: "warning" as const, label: "Aguardando" },
    ].map((row) => (
      <div
        key={row.title}
        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
      >
        <span className="text-sm text-foreground">{row.title}</span>
        <Badge variant={row.variant}>{row.label}</Badge>
      </div>
    ))}
  </div>
);

export const Compact = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Badge variant="secondary" className="px-2 py-0 text-[9px]">
      Professor
    </Badge>
    <Badge variant="info" className="px-2 py-0 text-[9px]">
      Novo
    </Badge>
  </div>
);
