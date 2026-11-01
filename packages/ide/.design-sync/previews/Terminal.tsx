import "./_theme";
import {
  AnimatedSpan,
  Terminal,
  TerminalTypingAnimation,
} from "@ts-compilator-for-java/ide";

// `initial={false}` renders each line at its final state - a static snapshot of
// the log. Drop it in the app to get the fade-in (sequence plays line by line).

export const CompileAndRun = () => (
  <div className="p-6">
    <Terminal sequence={false}>
      <TerminalTypingAnimation duration={8}>
        $ jmm run fatorial.java
      </TerminalTypingAnimation>
      <AnimatedSpan initial={false} className="text-green-500">
        ✔ Análise léxica: 48 tokens
      </AnimatedSpan>
      <AnimatedSpan initial={false} className="text-green-500">
        ✔ Análise sintática concluída
      </AnimatedSpan>
      <AnimatedSpan initial={false} className="text-green-500">
        ✔ Código intermediário: 23 instruções
      </AnimatedSpan>
      <AnimatedSpan initial={false} className="text-muted-foreground">
        Digite n: 5
      </AnimatedSpan>
      <AnimatedSpan initial={false}>Fatorial de 5 = 120</AnimatedSpan>
      <AnimatedSpan initial={false} className="text-sky-400">
        Programa finalizado em 4 ms.
      </AnimatedSpan>
    </Terminal>
  </div>
);

export const CompileError = () => (
  <div className="p-6">
    <Terminal sequence={false}>
      <TerminalTypingAnimation duration={8}>
        $ jmm run soma-pares.java
      </TerminalTypingAnimation>
      <AnimatedSpan initial={false} className="text-green-500">
        ✔ Análise léxica: 61 tokens
      </AnimatedSpan>
      <AnimatedSpan initial={false} className="text-red-500">
        ✖ Erro sintático (linha 7, coluna 18): esperado &apos;;&apos;
      </AnimatedSpan>
      <AnimatedSpan initial={false} className="text-muted-foreground">
        {"    soma = soma + i"}
      </AnimatedSpan>
      <AnimatedSpan initial={false} className="text-red-500">
        {"                   ^"}
      </AnimatedSpan>
    </Terminal>
  </div>
);
