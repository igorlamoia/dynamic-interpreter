import "./_theme";
import { TypingAnimation } from "@ts-compilator-for-java/ide";

export const HeroFileExtension = () => (
  <div className="flex flex-col items-center gap-1 p-6 text-center">
    <h1 className="text-4xl font-bold text-foreground">Interpretador dinâmico</h1>
    <div className="text-lg text-gray-400">
      Crie sua própria linguagem de programação
      <code className="text-gray-400">
        {" "}
        main.
        <TypingAnimation
          words={["java", "c", "js", "py"]}
          typeSpeed={100}
          deleteSpeed={100}
          pauseDelay={2000}
          startOnView={false}
          loop
        />
      </code>
    </div>
  </div>
);

export const SingleLine = () => (
  <div className="p-6">
    <TypingAnimation
      as="h2"
      typeSpeed={12}
      startOnView={false}
      className="text-3xl font-bold text-foreground"
    >
      Bem-vindo ao Java--, o compilador da sua turma.
    </TypingAnimation>
    <p className="mt-2 text-sm text-muted-foreground">
      Com um único texto, o cursor some quando a digitação termina.
    </p>
  </div>
);

export const CursorStyles = () => (
  <div className="flex max-w-xl flex-col gap-3 p-6 font-mono text-sm">
    {(
      [
        ["line", ["compilando main.java…", "executando main.java…"]],
        ["block", ["scan(n);", "print(n * 2);"]],
        ["underscore", ["while (i < 10) {", "for (int i = 0; i < n; i++) {"]],
      ] as const
    ).map(([style, words]) => (
      <div key={style} className="flex items-center gap-3 rounded-lg border border-border dark:bg-black/30 px-4 py-3">
        <span className="w-24 shrink-0 text-xs text-muted-foreground">{style}</span>
        <span className="text-primary">$</span>
        <TypingAnimation
          words={[...words]}
          cursorStyle={style}
          typeSpeed={25}
          pauseDelay={3000}
          startOnView={false}
          loop
          className="text-foreground"
        />
      </div>
    ))}
  </div>
);
