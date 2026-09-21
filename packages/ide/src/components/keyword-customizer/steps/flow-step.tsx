import { ExampleSnippet } from "../example-snippet";
import { KeywordReferenceTable } from "./components/keyword-reference-table";
import { Step } from "./components/step";
import { useWizardTranslation } from "../use-wizard-translation";

const FLOW_FIELDS = [
  "if",
  "else",
  "while",
  "for",
  "return",
  "break",
  "continue",
  "switch",
  "case",
  "default",
] as const;

export type FlowStepProps = {
  values: {
    snippet?: string;
    fields: Array<{
      key: (typeof FLOW_FIELDS)[number];
      value: string;
      description: string;
    }>;
  };
  actions: {
    syncKeyword: (
      original: (typeof FLOW_FIELDS)[number],
      value: string,
    ) => void;
    syncKeywordDescription: (
      original: (typeof FLOW_FIELDS)[number],
      value: string,
    ) => void;
  };
};

type FlowFieldKey = (typeof FLOW_FIELDS)[number];

const FLOW_REFERENCE_META: Record<
  FlowFieldKey,
  { glyph: string; className: string }
> = {
  if: {
    glyph: "IF",
    className: "text-cyan-300 shadow-[0_0_20px_-8px_rgba(34,211,238,0.95)]",
  },
  else: {
    glyph: "EL",
    className: "text-violet-300 shadow-[0_0_20px_-8px_rgba(196,181,253,0.9)]",
  },
  while: {
    glyph: "WH",
    className: "text-emerald-300 shadow-[0_0_20px_-8px_rgba(110,231,183,0.9)]",
  },
  for: {
    glyph: "FR",
    className: "text-emerald-300 shadow-[0_0_20px_-8px_rgba(110,231,183,0.9)]",
  },
  return: {
    glyph: "RT",
    className: "text-amber-300 shadow-[0_0_20px_-8px_rgba(251,191,36,0.9)]",
  },
  break: {
    glyph: "BR",
    className: "text-rose-300 shadow-[0_0_20px_-8px_rgba(253,164,175,0.9)]",
  },
  continue: {
    glyph: "CT",
    className: "text-sky-300 shadow-[0_0_20px_-8px_rgba(125,211,252,0.9)]",
  },
  switch: {
    glyph: "SW",
    className: "text-indigo-300 shadow-[0_0_20px_-8px_rgba(165,180,252,0.9)]",
  },
  case: {
    glyph: "CS",
    className: "text-fuchsia-300 shadow-[0_0_20px_-8px_rgba(240,171,252,0.9)]",
  },
  default: {
    glyph: "DF",
    className: "text-slate-300 shadow-[0_0_20px_-8px_rgba(148,163,184,0.75)]",
  },
};

export function FlowStep({ values, actions }: FlowStepProps) {
  const wt = useWizardTranslation();
  const conditionalKeys: FlowFieldKey[] = [
    "if",
    "else",
    "switch",
    "case",
    "default",
  ];
  const loopKeys: FlowFieldKey[] = ["for", "while"];
  const flowKeys: FlowFieldKey[] = ["break", "continue", "return"];

  const conditionalItems = values.fields.filter((field) =>
    conditionalKeys.includes(field.key),
  );
  const loopItems = values.fields.filter((field) =>
    loopKeys.includes(field.key),
  );
  const flowItems = values.fields.filter((field) =>
    flowKeys.includes(field.key),
  );

  const keywordMap = new Map(
    values.fields.map((field) => [field.key, field.value] as const),
  );
  const keywordFor = (key: FlowFieldKey) => keywordMap.get(key) || key;

  const conditionalSnippet = `${keywordFor("if")} (nota > 7) {\n  print("aprovado")\n} ${keywordFor(
    "else",
  )} {\n  print("recuperacao")\n}\n\n${keywordFor(
    "switch",
  )} (nivel) {\n  ${keywordFor("case")} 1:\n    print("iniciante")\n  ${keywordFor(
    "case",
  )} 2:\n    print("intermediario")\n  ${keywordFor(
    "default",
  )}:\n    print("avancado")\n}`;
  const loopSnippet = `${keywordFor("for")} (i = 0; i < 3; i = i + 1) {\n  print(i)\n}\n\n${keywordFor(
    "while",
  )} (tentativas < 3) {\n  tentativas = tentativas + 1\n}`;
  const flowSnippet = `${keywordFor("while")} (contador < 5) {\n  contador = contador + 1\n  ${keywordFor(
    "if",
  )} (contador == 2) {\n    ${keywordFor("continue")}\n  }\n  ${keywordFor(
    "if",
  )} (contador == 4) {\n    ${keywordFor("break")}\n  }\n}\n\n${keywordFor(
    "return",
  )} contador`;

  return (
    <section className="space-y-6">
      <Step.Header>
        <Step.Index>{wt("flow.index")}</Step.Index>
        <Step.Title>{wt("flow.title")}</Step.Title>
        <Step.Description>
          {wt("flow.description")}
        </Step.Description>
      </Step.Header>
      <KeywordReferenceTable
        title={wt("flow.conditionals")}
        items={conditionalItems.map((field) => ({
          id: field.key,
          value: field.value,
          description: field.description,
          reference: {
            ...FLOW_REFERENCE_META[field.key],
            label: field.key.toUpperCase(),
          },
        }))}
        onValueChange={(field, value) => actions.syncKeyword(field, value)}
        onDescriptionChange={(field, value) =>
          actions.syncKeywordDescription(field, value)
        }
      />
      <ExampleSnippet
        title={wt("flow.conditionalsExample")}
        code={conditionalSnippet}
      />
      <KeywordReferenceTable
        title={wt("flow.loops")}
        items={loopItems.map((field) => ({
          id: field.key,
          value: field.value,
          description: field.description,
          reference: {
            ...FLOW_REFERENCE_META[field.key],
            label: field.key.toUpperCase(),
          },
        }))}
        onValueChange={(field, value) => actions.syncKeyword(field, value)}
        onDescriptionChange={(field, value) =>
          actions.syncKeywordDescription(field, value)
        }
      />
      <ExampleSnippet title={wt("flow.loopsExample")} code={loopSnippet} />
      <KeywordReferenceTable
        title={wt("flow.flow")}
        items={flowItems.map((field) => ({
          id: field.key,
          value: field.value,
          description: field.description,
          reference: {
            ...FLOW_REFERENCE_META[field.key],
            label: field.key.toUpperCase(),
          },
        }))}
        onValueChange={(field, value) => actions.syncKeyword(field, value)}
        onDescriptionChange={(field, value) =>
          actions.syncKeywordDescription(field, value)
        }
      />
      <ExampleSnippet title={wt("flow.flowExample")} code={flowSnippet} />
    </section>
  );
}
