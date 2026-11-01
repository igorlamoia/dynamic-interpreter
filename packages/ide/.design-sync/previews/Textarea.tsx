import "./_theme";
import { Textarea } from "@ts-compilator-for-java/ide";

export const Default = () => (
  <div className="flex max-w-lg flex-col gap-3 p-6">
    <Textarea
      rows={5}
      placeholder="Descreva o enunciado do exercício, a entrada esperada e a saída."
    />
  </div>
);

export const Filled = () => (
  <div className="flex max-w-lg flex-col gap-3 p-6">
    <Textarea
      rows={5}
      defaultValue={
        "Leia um número inteiro N e imprima a soma de 1 até N.\n\nEntrada: um inteiro N (1 ≤ N ≤ 1000).\nSaída: a soma calculada."
      }
    />
  </div>
);

export const Disabled = () => (
  <div className="flex max-w-lg flex-col gap-3 p-6">
    <Textarea
      disabled
      rows={3}
      defaultValue="O prazo desta submissão já terminou. Não é mais possível editar a resposta."
    />
  </div>
);
