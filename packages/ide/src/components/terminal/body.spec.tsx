// @vitest-environment jsdom

import type { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import type { DebugTerminalSession, TerminalLine } from ".";
import { StrictMode, createRef, useState } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const executeMock = vi.fn(async () => undefined);

vi.mock("@ts-compilator-for-java/compiler/interpreter", () => ({
  Interpreter: class Interpreter {
    execute = executeMock;
  },
  RuntimeError: class RuntimeError extends Error {
    instructionPointer = 0;
  },
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

import { Body } from "./body";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("Body", () => {
  afterEach(() => {
    executeMock.mockClear();
    document.body.innerHTML = "";
  });

  it("runs the interpreter only once on the first strict-mode mount", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <StrictMode>
          <RuntimeErrorProvider>
            <Body
              lines={[]}
              currentInput=""
              inputRef={createRef<HTMLInputElement>()}
              setCurrentInput={vi.fn()}
              intermediateCode={[{} as Instruction]}
              setIsExecuting={vi.fn()}
              setLines={vi.fn()}
              toggleTerminal={vi.fn()}
            />
          </RuntimeErrorProvider>
        </StrictMode>,
      );
    });

    expect(executeMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
  });

  it("routes terminal input to the waiting debug session and continues execution", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const provideInput = vi.fn();
    const continueExecution = vi.fn(async () => null);
    const debugSession: DebugTerminalSession = {
      output: [],
      snapshot: {
        status: "waiting-for-input",
        stopReason: "input",
        instructionPointer: 2,
        currentSource: { line: 4, column: 3 },
        variables: [],
        callStack: [],
        error: null,
      },
      provideInput,
      continueExecution,
    };

    function Harness() {
      const [lines, setLines] = useState<TerminalLine[]>([]);
      const [currentInput, setCurrentInput] = useState("42");

      return (
        <RuntimeErrorProvider>
          <Body
            lines={lines}
            currentInput={currentInput}
            inputRef={createRef<HTMLInputElement>()}
            setCurrentInput={setCurrentInput}
            intermediateCode={[]}
            setIsExecuting={vi.fn()}
            setLines={setLines}
            toggleTerminal={vi.fn()}
            debugSession={debugSession}
          />
        </RuntimeErrorProvider>
      );
    }

    await act(async () => {
      root.render(<Harness />);
    });

    const input = container.querySelector("input");
    expect(input).toBeTruthy();

    await act(async () => {
      input?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });

    expect(provideInput).toHaveBeenCalledWith("42");
    expect(continueExecution).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("$ 42");

    await act(async () => {
      root.unmount();
    });
  });

  it("removes line terminators from submitted debug input", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const provideInput = vi.fn();
    const continueExecution = vi.fn(async () => null);
    const debugSession: DebugTerminalSession = {
      output: [],
      snapshot: {
        status: "waiting-for-input",
        stopReason: "input",
        instructionPointer: 2,
        currentSource: { line: 4, column: 3 },
        variables: [],
        callStack: [],
        error: null,
      },
      provideInput,
      continueExecution,
    };

    function Harness() {
      const [lines, setLines] = useState<TerminalLine[]>([]);
      const [currentInput, setCurrentInput] = useState("42\n");

      return (
        <RuntimeErrorProvider>
          <Body
            lines={lines}
            currentInput={currentInput}
            inputRef={createRef<HTMLInputElement>()}
            setCurrentInput={setCurrentInput}
            intermediateCode={[]}
            setIsExecuting={vi.fn()}
            setLines={setLines}
            toggleTerminal={vi.fn()}
            debugSession={debugSession}
          />
        </RuntimeErrorProvider>
      );
    }

    await act(async () => {
      root.render(<Harness />);
    });

    const input = container.querySelector("input");
    expect(input).toBeTruthy();

    await act(async () => {
      input?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });

    expect(provideInput).toHaveBeenCalledWith("42");
    expect(provideInput).not.toHaveBeenCalledWith("42\n");

    await act(async () => {
      root.unmount();
    });
  });
});
