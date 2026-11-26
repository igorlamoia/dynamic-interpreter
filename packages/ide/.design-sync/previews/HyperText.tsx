import "./_theme";
import { HyperText } from "@ts-compilator-for-java/ide";

export const Heading = () => (
  <div className="p-6 text-foreground">
    <HyperText startOnView={false} duration={300}>
      Compilador Java--
    </HyperText>
  </div>
);

export const InlineInSentence = () => (
  <div className="max-w-xl p-6">
    <p className="text-sm text-muted-foreground">
      Escolha como o seu programa <strong className="text-foreground">Hello World</strong> vai imprimir no
      terminal:{" "}
      <HyperText as="span" startOnView={false} duration={300} className="text-sm text-slate-100">
        Olá, mundo
      </HyperText>
    </p>
  </div>
);

export const CustomCharacterSet = () => (
  <div className="p-6 text-primary">
    <HyperText
      as="h2"
      startOnView={false}
      duration={300}
      characterSet={["0", "1"]}
      className="text-2xl"
    >
      Analisador léxico
    </HyperText>
  </div>
);
