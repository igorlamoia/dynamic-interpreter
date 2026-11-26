import "./_theme";
import { CodeComparison, ThemeProvider } from "@ts-compilator-for-java/ide";

const beforeCode = `int main() {
  int n;
  scan(n);
  if (n % 2 == 0) {
    print("par");
  } else {
    print("impar");
  }
  return 0;
}`;

const afterCode = `inteiro principal() {
  inteiro n;
  leia(n);
  se (n % 2 == 0) {
    escreva("par");
  } senao {
    escreva("impar");
  }
  retorne 0;
}`;

const loopBefore = `int main() {
  int i;
  int soma = 0;
  for (i = 1; i <= 10; i = i + 1) {
    soma = soma + i;
  }
  print(soma);
}`;

const loopAfter = `int main() {
  int i;
  int soma = 0;
  while (i <= 10) {
    soma = soma + i;
    i = i + 1;
  }
  print(soma);
}`;

export const KeywordCustomization = () => (
  <ThemeProvider>
    <div className="p-6">
      <CodeComparison
        beforeCode={beforeCode}
        afterCode={afterCode}
        language="java"
        filename="par-ou-impar.java"
        lightTheme="github-light"
        darkTheme="github-dark"
        highlightColor="rgba(101, 117, 133, 0.16)"
      />
    </div>
  </ThemeProvider>
);

export const FocusedLines = () => (
  <ThemeProvider>
    <div className="p-6">
      <CodeComparison
        beforeCode={loopBefore}
        afterCode={loopAfter}
        language="java"
        filename="soma.java"
        lightTheme="github-light"
        darkTheme="github-dark"
        beforeFocusedLines={[4]}
        afterFocusedLines={[4, 6]}
      />
    </div>
  </ThemeProvider>
);
