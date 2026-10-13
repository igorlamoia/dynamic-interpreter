// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Pointer } from "./pointer";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("motion/react", async () => {
  const React = await import("react");

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: {
      div: ({
        children,
        initial,
        animate,
        exit,
        ...props
      }: React.HTMLAttributes<HTMLDivElement> & {
        initial?: unknown;
        animate?: unknown;
        exit?: unknown;
      }) => {
        void initial;
        void animate;
        void exit;

        return <div {...props}>{children}</div>;
      },
    },
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: vi.fn(),
    }),
  };
});

describe("Pointer", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    document.elementFromPoint = vi.fn();
  });

  afterEach(() => {
    document.documentElement.classList.remove("custom-pointer-active");
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("stays visible when the cursor moves over body-level portal content", () => {
    const appContainer = document.createElement("div");
    document.body.appendChild(appContainer);
    const root = createRoot(appContainer);
    const portalContent = document.createElement("div");
    portalContent.setAttribute("role", "menuitem");
    document.body.appendChild(portalContent);
    vi.mocked(document.elementFromPoint).mockReturnValue(portalContent);

    act(() => {
      root.render(<Pointer />);
    });

    act(() => {
      portalContent.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          clientX: 12,
          clientY: 24,
        }),
      );
    });

    expect(document.body.querySelector(".text-cyan-300")).toBeInstanceOf(
      HTMLDivElement,
    );

    act(() => {
      root.unmount();
    });
  });
});
