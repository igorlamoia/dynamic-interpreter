// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Editor } from "./editor";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  darkMode: true,
  initializeEditor: vi.fn(),
  setConfig: vi.fn(),
}));

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ darkMode: mocks.darkMode }),
}));

vi.mock("@/hooks/useEditor", () => ({
  useEditor: () => ({
    initializeEditor: mocks.initializeEditor,
    setConfig: mocks.setConfig,
  }),
}));

describe("Editor", () => {
  beforeEach(() => {
    mocks.darkMode = true;
    mocks.initializeEditor.mockClear();
    mocks.setConfig.mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("passes bottom padding through to Monaco editor options", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<Editor bottomPadding={320} />);
    });

    expect(mocks.setConfig).toHaveBeenCalledWith({
      editorOptions: {
        padding: { bottom: 320 },
      },
    });

    await act(async () => {
      root.unmount();
    });
  });
});
