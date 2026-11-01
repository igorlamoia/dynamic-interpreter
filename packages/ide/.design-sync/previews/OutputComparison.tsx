import "./_theme";
import { OutputComparison } from "@ts-compilator-for-java/ide";

export const Failed = () => (
  <div className="max-w-xl p-6">
    <OutputComparison
      expectedOutput={"Digite n: 5\nFatorial de 5 = 120\nFim."}
      actualOutput={"Digite n: 5\nFatorial de 5 = 24\nFim."}
      passed={false}
    />
  </div>
);

export const Passed = () => (
  <div className="max-w-xl p-6">
    <OutputComparison
      expectedOutput={"Soma dos pares: 30\nQuantidade: 5"}
      actualOutput={"Soma dos pares: 30\nQuantidade: 5"}
      passed
    />
  </div>
);

export const MissingLines = () => (
  <div className="max-w-xl p-6">
    <OutputComparison
      expectedOutput={"1\n2\nFizz\n4\nBuzz"}
      actualOutput={"1\n2\nFizz"}
      passed={false}
    />
  </div>
);

export const EmptyOutput = () => (
  <div className="max-w-xl p-6">
    <OutputComparison
      expectedOutput={"Olá, Java--!"}
      actualOutput=""
      passed={false}
    />
  </div>
);
