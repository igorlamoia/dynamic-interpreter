import "./_theme";
import { Highlighter } from "@ts-compilator-for-java/ide";

export const InSentence = () => (
  <div className="max-w-xl p-6 text-lg leading-relaxed text-foreground">
    <p>
      O Java-- é um subconjunto do Java pensado para{" "}
      <Highlighter action="highlight" color="rgba(13, 204, 242, 0.35)">
        ensinar compiladores
      </Highlighter>{" "}
      — da análise léxica até a{" "}
      <Highlighter action="underline" color="#34d399">
        execução do código intermediário
      </Highlighter>
      .
    </p>
  </div>
);

export const Actions = () => (
  <div className="flex max-w-2xl flex-col gap-5 p-6 text-base text-foreground">
    <p>
      Todo programa precisa de uma função{" "}
      <Highlighter action="box" color="#0dccf2" padding={4}>
        int main()
      </Highlighter>
      .
    </p>
    <p>
      Corrija o erro na{" "}
      <Highlighter action="circle" color="#f87171" padding={6}>
        linha 12
      </Highlighter>{" "}
      antes de enviar.
    </p>
    <p>
      O comando{" "}
      <Highlighter action="strike-through" color="#fbbf24">
        System.out.println
      </Highlighter>{" "}
      foi substituído por print.
    </p>
    <p>
      Para ler valores use scan, não{" "}
      <Highlighter action="crossed-off" color="#f87171">
        Scanner.nextInt()
      </Highlighter>
      .
    </p>
  </div>
);
