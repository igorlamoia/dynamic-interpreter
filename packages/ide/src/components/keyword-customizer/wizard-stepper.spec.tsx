// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WizardStepper } from "./wizard-stepper";
import type { WizardStepId } from "./wizard-model";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("WizardStepper", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders icon-only circular step buttons below lg and names only the active step", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const onStepClick = vi.fn();

    act(() => {
      root.render(
        <WizardStepper
          steps={[
            {
              id: "identity",
              title: "Identidade",
              description: "Escolha a identidade.",
              icon: "fingerprint",
            },
            {
              id: "types",
              title: "Tipos",
              description: "Configure tipos.",
              icon: "book-open-text",
            },
          ]}
          activeStepId={"types" as WizardStepId}
          onStepClick={onStepClick}
          preview={{
            name: "Teste",
            basedOnLabel: "JavaMM",
            languageImageUrl: "",
            dna: ["tipada", "vetores dinâmicos"],
            baselineSnippet: "",
            snippet: "",
            tokenPreview: [],
            chosenLexemes: [],
          }}
        />,
      );
    });

    const stepper = container.querySelector("[data-wizard-stepper]");
    const stepList = container.querySelector("[data-wizard-step-list]");
    const stepButtons = Array.from(
      container.querySelectorAll("[data-wizard-step-button]"),
    );
    const stepLabels = Array.from(
      container.querySelectorAll("[data-wizard-step-label]"),
    );
    const activeTitle = container.querySelector("[data-wizard-active-title]");
    const languageCard = container.querySelector("[data-wizard-language-card]");

    expect(stepper?.className).toContain("max-lg:sticky");
    expect(stepList?.className).toContain("max-lg:flex-row");
    expect(stepList?.className).toContain("max-lg:overflow-x-auto");
    expect(stepButtons[0].className).toContain("max-lg:rounded-full");
    expect(stepButtons[0].className).toContain("max-lg:h-10");
    expect(stepButtons[0].className).toContain("max-lg:w-10");
    expect(stepLabels[0].className).toContain("max-lg:sr-only");
    expect(activeTitle?.textContent).toBe("Tipos");
    expect(languageCard?.className).toContain("max-lg:hidden");
    expect(languageCard?.textContent).toContain("vetores dinâmicos");

    act(() => {
      root.unmount();
    });
  });
});
