import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";
import { OptionCard } from "../option-card";
import { Braces, Form, ListPlus, LockKeyhole, TextQuote } from "lucide-react";
import { Step } from "./components/step";

export type StructureStepProps = {
  values: {
    snippet?: string;
    optionalTerminatorSnippet: string;
    requiredTerminatorSnippet: string;
    delimiterSnippet: string;
    identationSnippet: string;
    fixedArraySnippet: string;
    dynamicArraySnippet: string;
    semicolonMode: StoredKeywordCustomization["modes"]["semicolon"];
    arrayMode: StoredKeywordCustomization["modes"]["array"];
    blockMode: StoredKeywordCustomization["modes"]["block"];
    usesCustomDelimiters: boolean;
    statementTerminator: {
      value: string;
      description: string;
    };
    keywords: Array<{
      key: "void" | "function";
      value: string;
      description: string;
    }>;
    delimiters: {
      open: {
        value: string;
        description: string;
      };
      close: {
        value: string;
        description: string;
      };
    };
  };
  errors: {
    delimiter: string | null;
    statementTerminator: string | null;
  };
  actions: {
    syncBlockMode: (mode: "delimited" | "indentation") => void;
    syncDelimiter: (field: "open" | "close", value: string) => void;
    syncDelimiterDescription: (field: "open" | "close", value: string) => void;
    syncStatementTerminator: (value: string) => void;
    syncStatementTerminatorDescription: (value: string) => void;
    syncSemicolonMode: (mode: "optional-eol" | "required") => void;
    syncArrayMode: (mode: "fixed" | "dynamic") => void;
    syncKeyword: (original: "void" | "function", value: string) => void;
    syncKeywordDescription: (
      original: "void" | "function",
      value: string,
    ) => void;
  };
};

export function StructureStep({ values, errors, actions }: StructureStepProps) {
  return (
    <section className="space-y-6">
      <Step.Header>
        <Step.Index>Etapa 4</Step.Index>
        <Step.Title>Estrutura</Step.Title>
        <Step.Description>
          Configure blocos, delimitadores e como cada instrução termina.
        </Step.Description>
      </Step.Header>

      <div className="grid gap-3 md:grid-cols-2">
        <OptionCard
          title="Delimitada"
          subtitle="Abertura e fechamento"
          icon={<Form className="h-5 w-5" />}
          iconColor="emerald"
          description="Mantém a estrutura delimitada (início e fim)."
          selected={values.blockMode === "delimited"}
          onClick={() => actions.syncBlockMode("delimited")}
        >
          <ExampleSnippet showHeader={false} code={values.delimiterSnippet} />
        </OptionCard>
        <OptionCard
          title="Indentação"
          subtitle="Espaços em branco"
          description="Organiza blocos pela indentação, sem delimitadores."
          selected={values.blockMode === "indentation"}
          onClick={() => actions.syncBlockMode("indentation")}
          icon={<TextQuote className="h-5 w-5" />}
          iconColor="violet"
        >
          <ExampleSnippet showHeader={false} code={values.identationSnippet} />
        </OptionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DocumentedField
          label="Delimitador de abertura"
          value={values.delimiters.open.value}
          description={values.delimiters.open.description}
          onValueChange={(value) => actions.syncDelimiter("open", value)}
          onDescriptionChange={(value) =>
            actions.syncDelimiterDescription("open", value)
          }
          disabled={values.blockMode === "indentation"}
          placeholder="begin"
          icon={{
            icon: "{",
            color: "emerald",
          }}
        />

        <DocumentedField
          label="Delimitador de fechamento"
          value={values.delimiters.close.value}
          description={values.delimiters.close.description}
          onValueChange={(value) => actions.syncDelimiter("close", value)}
          onDescriptionChange={(value) =>
            actions.syncDelimiterDescription("close", value)
          }
          disabled={values.blockMode === "indentation"}
          placeholder="end"
          icon={{
            icon: "}",
            color: "emerald",
          }}
        />
      </div>

      {values.blockMode === "delimited" && errors.delimiter && (
        <p className="text-sm text-red-600 dark:text-red-300">
          {errors.delimiter}
        </p>
      )}
      <ExampleSnippet
        title="Exemplo estrutural"
        code={values.snippet ?? 'if (condicao) {\n  print("ok")\n}'}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <OptionCard
          title="Sem ponto e vírgula"
          subtitle="Linha"
          description="Não precisa se preocupar com terminadores, mas não pode colocar mais de uma instrução na mesma linha."
          selected={values.semicolonMode === "optional-eol"}
          onClick={() => actions.syncSemicolonMode("optional-eol")}
          icon={<TextQuote className="h-5 w-5" />}
          iconColor="slate"
        >
          <ExampleSnippet
            showHeader={false}
            code={values.optionalTerminatorSnippet}
          />
        </OptionCard>

        <OptionCard
          title="Exigir terminador"
          subtitle="Explícito"
          description="Mantém o terminador explícito. Pode ser um ponto e vírgula ou outro símbolo customizado. Se esquecer, o código não roda."
          selected={values.semicolonMode === "required"}
          onClick={() => actions.syncSemicolonMode("required")}
          icon={<LockKeyhole className="h-5 w-5" />}
          iconColor="amber"
        >
          <ExampleSnippet
            showHeader={false}
            code={values.requiredTerminatorSnippet}
          />
        </OptionCard>
      </div>

      <div className="space-y-2">
        <DocumentedField
          label="Terminador customizado"
          value={values.statementTerminator.value}
          description={values.statementTerminator.description}
          onValueChange={actions.syncStatementTerminator}
          onDescriptionChange={actions.syncStatementTerminatorDescription}
          placeholder="Opcional"
          icon={{
            icon: ";",
          }}
          disabled={values.semicolonMode === "optional-eol"}
        />
        {errors.statementTerminator && (
          <span className="text-sm text-red-600 dark:text-red-300">
            {errors.statementTerminator}
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <OptionCard
          title="Tamanho fixo"
          subtitle="Vetor/Matriz"
          description="Mantém os vetores e matrizes fixas. O tamanho deve ser declarado no momento da criação e não pode ser alterado depois."
          selected={values.arrayMode === "fixed"}
          onClick={() => actions.syncArrayMode("fixed")}
          icon={<Braces className="h-5 w-5" />}
          iconColor="cyan"
        >
          <ExampleSnippet showHeader={false} code={values.fixedArraySnippet} />
        </OptionCard>
        <OptionCard
          title="Tamanho dinâmico"
          subtitle="Vetor/Matriz"
          description="Permite explorar estruturas mais flexíveis, sem informar o tamanho previamente."
          selected={values.arrayMode === "dynamic"}
          onClick={() => actions.syncArrayMode("dynamic")}
          icon={<ListPlus className="h-5 w-5" />}
          iconColor="emerald"
        >
          <ExampleSnippet
            showHeader={false}
            code={values.dynamicArraySnippet}
          />
        </OptionCard>
      </div>
    </section>
  );
}
