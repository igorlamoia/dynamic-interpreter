// @vitest-environment jsdom

import type { DebugTerminalSession } from ".";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import TerminalView, { appendOutputLines, createOutputLines } from ".";

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

  it("matches normal execution line splitting for debug output with trailing newlines", () => {
    expect(createOutputLines("debug hello\r\n", "output")).toMatchObject([
      { content: "debug hello", type: "output" },
    ]);
    expect(createOutputLines("a\r\n\r\n", "output")).toMatchObject([
      { content: "a", type: "output" },
      { content: "", type: "output" },
    ]);
  });

  it("merges debugger output chunks until a printed newline closes the line", () => {
    let state = { lines: [], lineOpen: false };

    for (const chunk of ["#", "\r\n", "#", "#", "\r\n", "#", "#", "#"]) {
      state = appendOutputLines(
        state.lines,
        chunk,
        "output",
        state.lineOpen,
      );
    }

    expect(state.lines).toMatchObject([
      { content: "#", type: "output" },
      { content: "##", type: "output" },
      { content: "###", type: "output" },
    ]);
  });
});
