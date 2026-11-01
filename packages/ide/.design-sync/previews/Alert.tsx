import "./_theme";
import { Alert } from "@ts-compilator-for-java/ide";

export const Variants = () => (
  <div className="flex max-w-xl flex-col gap-3 p-6">
    <Alert variant="error">
      Erro de sintaxe na linha 12: esperado &apos;;&apos; após a expressão.
    </Alert>
    <Alert variant="warning">
      A variável <code className="font-mono">contador</code> foi declarada mas nunca usada.
    </Alert>
    <Alert variant="info">
      O prazo de entrega da lista &quot;Estruturas de repetição&quot; termina amanhã.
    </Alert>
    <Alert variant="success">Programa compilado e executado com sucesso.</Alert>
  </div>
);

export const Dismissible = () => (
  <div className="max-w-xl p-6">
    <Alert variant="info" onClose={() => {}}>
      Suas palavras-chave personalizadas foram salvas neste navegador.
    </Alert>
  </div>
);
