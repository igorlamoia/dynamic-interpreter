import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";
import { OptionCard } from "../option-card";
import { Braces, Form, ListPlus, LockKeyhole, TextQuote } from "lucide-react";
import { Step } from "./components/step";
import { useWizardTranslation } from "../use-wizard-translation";

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
  const wt = useWizardTranslation();

  return (
    <section className="space-y-6">
      <Step.Header>
        <Step.Index>{wt("structure.index")}</Step.Index>
        <Step.Title>{wt("structure.title")}</Step.Title>
        <Step.Description>
          {wt("structure.description")}
        </Step.Description>
      </Step.Header>

      <div className="grid gap-3 md:grid-cols-2">
        <OptionCard
          title={wt("structure.delimitedTitle")}
          subtitle={wt("structure.delimitedSubtitle")}
          icon={<Form className="h-5 w-5" />}
          iconColor="emerald"
          description={wt("structure.delimitedDescription")}
          selected={values.blockMode === "delimited"}
          onClick={() => actions.syncBlockMode("delimited")}
        >
          <ExampleSnippet showHeader={false} code={values.delimiterSnippet} />
        </OptionCard>
        <OptionCard
          title={wt("structure.indentationTitle")}
          subtitle={wt("structure.indentationSubtitle")}
          description={wt("structure.indentationDescription")}
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
          label={wt("structure.openDelimiter")}
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
          label={wt("structure.closeDelimiter")}
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
        title={wt("structure.structuralExample")}
        code={values.snippet ?? 'if (condicao) {\n  print("ok")\n}'}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <OptionCard
          title={wt("structure.optionalTerminatorTitle")}
          subtitle={wt("structure.optionalTerminatorSubtitle")}
          description={wt("structure.optionalTerminatorDescription")}
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
          title={wt("structure.requiredTerminatorTitle")}
          subtitle={wt("structure.requiredTerminatorSubtitle")}
          description={wt("structure.requiredTerminatorDescription")}
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
          label={wt("structure.statementTerminator")}
          value={values.statementTerminator.value}
          description={values.statementTerminator.description}
          onValueChange={actions.syncStatementTerminator}
          onDescriptionChange={actions.syncStatementTerminatorDescription}
          placeholder={wt("structure.optionalPlaceholder")}
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
          title={wt("structure.fixedArrayTitle")}
          subtitle={wt("structure.arraySubtitle")}
          description={wt("structure.fixedArrayDescription")}
          selected={values.arrayMode === "fixed"}
          onClick={() => actions.syncArrayMode("fixed")}
          icon={<Braces className="h-5 w-5" />}
          iconColor="cyan"
        >
          <ExampleSnippet showHeader={false} code={values.fixedArraySnippet} />
        </OptionCard>
        <OptionCard
          title={wt("structure.dynamicArrayTitle")}
          subtitle={wt("structure.arraySubtitle")}
          description={wt("structure.dynamicArrayDescription")}
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
