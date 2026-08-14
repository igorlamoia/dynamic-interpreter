// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LockedLanguageBanner } from "@/components/exercise-workspace/LockedLanguageBanner";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mutateAsyncMock = vi.fn();

vi.mock("@/hooks/useLanguages", () => ({
  useCloneLanguage: () => ({ mutateAsync: mutateAsyncMock, isPending: false }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("lucide-react", () => ({
  Copy: () => <span>copy</span>,
  Lock: () => <span>lock</span>,
}));

const LANGUAGE = { id: 3, name: "Portugolzinho", description: null };

function render(props: Record<string, unknown>) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<LockedLanguageBanner language={LANGUAGE} {...props} />);
  });
  return { container, root };
}

describe("LockedLanguageBanner", () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    mutateAsyncMock.mockResolvedValue({ name: "Portugolzinho (cópia)" });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("diz que a trava e do exercicio", () => {
    const { container } = render({ source: "exercise" });
    expect(container.textContent).toContain("este exercício");
    expect(container.textContent).toContain("Portugolzinho");
  });

  it("diz que a trava e da lista e nomeia a lista", () => {
    const { container } = render({ source: "list", listTitle: "Recursao" });
    expect(container.textContent).toContain("Recursao");
  });

  it("mantem o botao de clonar", () => {
    const { container } = render({ source: "list", listTitle: "Recursao" });
    const button = container.querySelector("button");
    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(mutateAsyncMock).toHaveBeenCalledWith(3);
  });
});
