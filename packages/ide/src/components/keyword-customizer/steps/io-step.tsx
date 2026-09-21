import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";
import { HyperText } from "@/components/ui/hyper-text";
import { Terminal } from "lucide-react";
import { Step } from "./components/step";
import { useWizardTranslation } from "../use-wizard-translation";

export type IOKeyword = "print" | "scan";

export type IOStepProps = {
  values: {
    snippet?: string;
    printKeyword: string;
    printDescription: string;
    scanKeyword: string;
    scanDescription: string;
  };
  actions: {
    syncKeyword: (original: IOKeyword, value: string) => void;
    syncKeywordDescription: (original: IOKeyword, value: string) => void;
  };
};

export function IOStep({ values, actions }: IOStepProps) {
  const wt = useWizardTranslation();
  const localizedHelloWorld = wt("io.localizedHelloWorld");

  return (
    <section className="space-y-6">
      <Step.Header>
        <Step.Index>{wt("io.index")}</Step.Index>
        <Step.Title>{wt("io.title")}</Step.Title>
        <Step.Description>
          {wt("io.description.before")}{" "}
          <strong>Hello World</strong>, {wt("io.description.after")}{" "}
          <HyperText
            key={localizedHelloWorld}
            as="span"
            className="text-sm text-slate-900 dark:text-slate-100"
          >
            {localizedHelloWorld}
          </HyperText>
        </Step.Description>
      </Step.Header>

      <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
        {wt("io.question")}
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <DocumentedField
          label={wt("io.scanLabel")}
          value={values.scanKeyword}
          description={values.scanDescription}
          onValueChange={(value) => actions.syncKeyword("scan", value)}
          onDescriptionChange={(value) =>
            actions.syncKeywordDescription("scan", value)
          }
          icon={{
            icon: <Terminal />,
            color: "emerald",
          }}
        />
        <DocumentedField
          label={wt("io.printLabel")}
          value={values.printKeyword}
          description={values.printDescription}
          onValueChange={(value) => actions.syncKeyword("print", value)}
          onDescriptionChange={(value) =>
            actions.syncKeywordDescription("print", value)
          }
          icon={{
            icon: <Terminal />,
            color: "rose",
          }}
        />
      </div>

      <ExampleSnippet
        title={wt("io.liveExample")}
        code={values.snippet ?? `${values.printKeyword}("Ola mundo")`}
        input={["Kiki"]}
        output={["Ola mundo", "Me chamo: Kiki"]}
      />
    </section>
  );
}
