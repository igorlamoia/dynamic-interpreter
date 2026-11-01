import "./_theme";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ts-compilator-for-java/ide";

const testCases = [
  { input: "3 5", output: "8" },
  { input: "10 -4", output: "6" },
];

export const TestCases = () => (
  <div className="w-full max-w-lg p-6">
    <Accordion type="single" collapsible defaultValue="test-cases" className="w-full">
      <AccordionItem value="test-cases">
        <AccordionTrigger>
          <div className="flex w-full items-center justify-between pr-2">
            <span>Casos de teste</span>
            <span className="text-xs text-muted-foreground">2 casos</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {testCases.map((tc, i) => (
              <div
                key={tc.input}
                className="flex items-center gap-6 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs"
              >
                <span className="text-muted-foreground">#{i + 1}</span>
                <span>Entrada: {tc.input}</span>
                <span>Saída: {tc.output}</span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

export const Faq = () => (
  <div className="w-full max-w-lg p-6">
    <Accordion type="single" collapsible defaultValue="q1" className="flex w-full flex-col gap-2">
      <AccordionItem value="q1">
        <AccordionTrigger>O que é Java--?</AccordionTrigger>
        <AccordionContent>
          Um subconjunto simplificado de Java usado para ensinar compiladores: tipos
          básicos, condicionais, laços e entrada/saída.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="q2">
        <AccordionTrigger>Como envio uma submissão?</AccordionTrigger>
        <AccordionContent>Abra o exercício, escreva o código e clique em Enviar.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="q3">
        <AccordionTrigger>Posso mudar as palavras-chave?</AccordionTrigger>
        <AccordionContent>Sim, pelo personalizador de palavras-chave da IDE.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

export const Collapsed = () => (
  <div className="w-full max-w-lg p-6">
    <Accordion type="multiple" className="flex w-full flex-col gap-2">
      <AccordionItem value="lexer">
        <AccordionTrigger>Analisador léxico</AccordionTrigger>
        <AccordionContent>Gera a lista de tokens do código-fonte.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="parser">
        <AccordionTrigger>Analisador sintático</AccordionTrigger>
        <AccordionContent>Valida a gramática e emite código intermediário.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);
