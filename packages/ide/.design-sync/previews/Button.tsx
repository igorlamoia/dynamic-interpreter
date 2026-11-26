import "./_theme";
import { Button } from "@ts-compilator-for-java/ide";
import { Play, Save, Trash2, Plus } from "lucide-react";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Button>Executar</Button>
    <Button variant="secondary">Salvar rascunho</Button>
    <Button variant="outline">Cancelar</Button>
    <Button variant="ghost">Ver detalhes</Button>
    <Button variant="destructive">Excluir turma</Button>
    <Button variant="link">Esqueci minha senha</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Button size="sm">Pequeno</Button>
    <Button>Padrão</Button>
    <Button size="lg">Grande</Button>
    <Button size="icon" aria-label="Adicionar arquivo">
      <Plus />
    </Button>
  </div>
);

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Button>
      <Play /> Compilar e executar
    </Button>
    <Button variant="outline">
      <Save /> Salvar arquivo
    </Button>
    <Button variant="destructive" size="sm">
      <Trash2 /> Remover
    </Button>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Button disabled>Enviando…</Button>
    <Button variant="outline" disabled>
      Indisponível
    </Button>
  </div>
);

export const AsLink = () => (
  <div className="flex items-center gap-3 p-6">
    <Button asChild variant="outline">
      <a href="#exercicios">Ir para exercícios</a>
    </Button>
  </div>
);
