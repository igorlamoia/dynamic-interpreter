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
  it.each(["roda a roda", "roda pra mim", "bora", "roda", "gg", "  RODA PRA MIM  "])(
    "requests compilation and execution for %s on every submission",
    async (command) => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      const onRun = vi.fn();

      await act(async () => {
        root.render(
          <RuntimeErrorProvider>
            <Body
              lines={[]}
              currentInput={command}
              inputRef={createRef<HTMLInputElement>()}
              setCurrentInput={vi.fn()}
              intermediateCode={[]}
              setIsExecuting={vi.fn()}
              setLines={vi.fn()}
              toggleTerminal={vi.fn()}
              onRun={onRun}
            />
          </RuntimeErrorProvider>,
        );
      });

      for (let submission = 0; submission < 2; submission += 1) {
        await act(async () => {
          container.querySelector("input")?.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
          );
        });
      }

      expect(onRun).toHaveBeenCalledTimes(2);
      expect(executeMock).not.toHaveBeenCalled();
      await act(async () => root.unmount());
    },
  );

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

  it("expõe os data-testid do output e do input do terminal para o E2E", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <RuntimeErrorProvider>
          <Body
            lines={[]}
            currentInput=""
            inputRef={createRef<HTMLInputElement>()}
            setCurrentInput={vi.fn()}
            intermediateCode={[]}
            setIsExecuting={vi.fn()}
            setLines={vi.fn()}
            toggleTerminal={vi.fn()}
          />
        </RuntimeErrorProvider>,
      );
    });

    expect(
      container.querySelector('[data-testid="terminal-output"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-testid="terminal-input"]'),
    ).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
  });

  it("routes terminal input to the waiting debug session and continues execution", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const provideInput = vi.fn();
    const onRun = vi.fn();
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
      const [currentInput, setCurrentInput] = useState("roda");

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
            onRun={onRun}
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

    expect(provideInput).toHaveBeenCalledWith("roda");
    expect(onRun).not.toHaveBeenCalled();
    expect(continueExecution).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("$ roda");

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
