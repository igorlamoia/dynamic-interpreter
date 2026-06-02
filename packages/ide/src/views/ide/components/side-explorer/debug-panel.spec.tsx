// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DebugPanel } from "./debug-panel";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("lucide-react", () => ({
  CircleDot: () => <span>status</span>,
  LogIn: () => <span>into</span>,
  LogOut: () => <span>out</span>,
  Pause: () => <span>pause</span>,
  Play: () => <span>play</span>,
  RotateCcw: () => <span>restart</span>,
  Square: () => <span>stop</span>,
  StepForward: () => <span>step</span>,
}));

afterEach(() => {
  document.body.innerHTML = "";
});

describe("DebugPanel", () => {
  it("renders debug controls, breakpoints, variables, and call stack without output", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <DebugPanel
          breakpoints={[3]}
          boundBreakpoints={[3]}
          locale="en"
          unboundBreakpoints={[9]}
          snapshot={{
            status: "paused",
            stopReason: "breakpoint",
            instructionPointer: 4,
            currentSource: { line: 3, column: 3 },
            variables: [
              { name: "x", type: "int", value: 1, scope: "global" },
            ],
            callStack: [{ name: "main", returnAddress: 0 }],
            error: null,
          }}
        />,
      );
    });

    expect(
      container.querySelector('button[aria-label="Start debug"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('button[aria-label="Continue"]'),
    ).toBeTruthy();
    expect(container.textContent).toContain("Breakpoints");
    expect(container.textContent).toContain("Line 3");
    expect(container.textContent).toContain("Line 9");
    expect(container.textContent).toContain("Unbound");
    expect(container.textContent).toContain("Variables");
    expect(container.textContent).toContain("x");
    expect(container.textContent).toContain("Call Stack");
    expect(container.textContent).toContain("main");
    expect(container.textContent).not.toContain("Output");
    expect(container.textContent).not.toContain("hello");

    act(() => {
      root.unmount();
    });
  });

  it("translates debug status and labels with the selected locale", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <DebugPanel
          breakpoints={[12]}
          locale="es"
          snapshot={{
            status: "waiting-for-input",
            stopReason: "input",
            instructionPointer: 4,
            currentSource: { line: 12, column: 3 },
            variables: [],
            callStack: [],
            error: null,
          }}
          isStale
        />,
      );
    });

    expect(
      container.querySelector('button[aria-label="Iniciar depuración"]'),
    ).toBeTruthy();
    expect(container.textContent).toContain("Depuración");
    expect(container.textContent).toContain("Esperando entrada");
    expect(container.textContent).toContain("Entrada");
    expect(container.textContent).toContain("Desactualizado");
    expect(container.textContent).toContain("Puntos de interrupción");
    expect(container.textContent).toContain("Línea 12");
    expect(container.textContent).toContain("Enlazado");
    expect(container.textContent).toContain("Variables");
    expect(container.textContent).toContain("Sin variables");
    expect(container.textContent).toContain("Pila de llamadas");
    expect(container.textContent).toContain("Sin marcos de pila");

    act(() => {
      root.unmount();
    });
  });
});
