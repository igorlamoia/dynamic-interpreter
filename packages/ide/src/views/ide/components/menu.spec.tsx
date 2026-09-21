// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Menu } from "./menu";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("next/router", () => ({
  useRouter: () => ({ locale: "en" }),
}));

vi.mock("@/components/buttons/icon-button", () => ({
  default: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/rainbow-button", () => ({
  RainbowButton: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

describe("Menu", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("calls onHelp from the Help button", () => {
    const onHelp = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <Menu
          handleRun={vi.fn()}
          isFullscreen={false}
          onHelp={onHelp}
          runAll={vi.fn()}
          toggleFullscreen={vi.fn()}
          toggleTerminal={vi.fn()}
        />,
      );
    });

    act(() => {
      Array.from(container.querySelectorAll("button"))
        .find((button) => button.textContent === "Help")
        ?.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        );
    });

    expect(onHelp).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });
});
