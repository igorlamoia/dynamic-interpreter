// @vitest-environment jsdom

import type { DebugTerminalSession } from ".";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import TerminalView from ".";

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("TerminalView", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("appends debug output to the terminal", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const debugSession: DebugTerminalSession = {
      output: ["debug hello"],
      snapshot: null,
      provideInput: vi.fn(),
      continueExecution: vi.fn(),
    };

    await act(async () => {
      root.render(
        <RuntimeErrorProvider>
          <TerminalView
            debugSession={debugSession}
            intermediateCode={[]}
            isTerminalOpen={true}
            toggleTerminal={vi.fn()}
          />
        </RuntimeErrorProvider>,
      );
    });

    expect(container.textContent).toContain("debug hello");

    await act(async () => {
      root.unmount();
    });
  });
});
