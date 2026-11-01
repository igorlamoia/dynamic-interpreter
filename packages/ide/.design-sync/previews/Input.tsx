import "./_theme";
import { Input } from "@ts-compilator-for-java/ide";

export const Default = () => (
  <div className="flex max-w-md flex-col gap-3 p-6">
    <Input placeholder="Ex.: Soma de dois números" />
  </div>
);

export const Types = () => (
  <div className="flex max-w-md flex-col gap-3 p-6">
    <Input type="text" defaultValue="Estruturas de repetição" />
    <Input type="email" placeholder="aluno@universidade.edu.br" />
    <Input type="password" defaultValue="segredo123" />
    <Input type="number" defaultValue={10} />
  </div>
);

export const WithLabel = () => (
  <div className="flex max-w-md flex-col gap-1.5 p-6">
    <label
      htmlFor="codigo-turma"
      className="ml-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
    >
      Código da turma
    </label>
    <Input id="codigo-turma" placeholder="ABC-1234" className="h-12" />
  </div>
);

export const States = () => (
  <div className="flex max-w-md flex-col gap-3 p-6">
    <Input placeholder="Nome da lista" />
    <Input defaultValue="Lista 3 — Vetores" />
    <Input disabled defaultValue="Turma encerrada" />
  </div>
);
