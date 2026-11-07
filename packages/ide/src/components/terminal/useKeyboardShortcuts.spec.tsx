// @vitest-environment jsdom

import { act, type Dispatch, type SetStateAction } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function ShortcutHarness({
  setIsFullscreen,
  toggleTerminal,
}: {
  setIsFullscreen: Dispatch<SetStateAction<boolean>>;
  toggleTerminal: () => void;
}) {
  useKeyboardShortcuts(
    toggleTerminal,
    true,
    undefined,
    undefined,
    undefined,
    true,
    setIsFullscreen,
  );
  return null;
}

describe("useKeyboardShortcuts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("exits fullscreen with Escape without closing the terminal", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const setIsFullscreen = vi.fn();
    const toggleTerminal = vi.fn();

    act(() => {
      root.render(
        <ShortcutHarness
          setIsFullscreen={setIsFullscreen}
          toggleTerminal={toggleTerminal}
        />,
      );
    });

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(setIsFullscreen).toHaveBeenCalledWith(false);
    expect(toggleTerminal).not.toHaveBeenCalled();

    act(() => root.unmount());
  });
});
