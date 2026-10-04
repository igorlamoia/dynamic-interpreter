// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SideMenu } from "./side-menu";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

const useRouterMock = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => useRouterMock(),
}));

vi.mock("@/components/buttons/icon-button", () => ({
  default: ({
    children,
    tooltip,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    tooltip?: string;
  }) => (
    <button aria-label={tooltip} type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  BugPlay: () => <span>debug</span>,
  FileCode2: () => <span>files</span>,
  GitBranch: () => <span>git</span>,
  Languages: () => <span>languages</span>,
  Search: () => <span>search</span>,
  Settings: () => <span>settings</span>,
  Sparkles: () => <span>sparkles</span>,
}));

describe("SideMenu", () => {
  beforeEach(() => {
    useRouterMock.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("opens the language sidebar from the language slot", () => {
    useRouterMock.mockReturnValue({ locale: "pt-BR", push: vi.fn() });
    const setActiveView = vi.fn();
    const setIsSidebarOpen = vi.fn();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <SideMenu
          isSidebarOpen
          setIsSidebarOpen={setIsSidebarOpen}
          activeView="explorer"
          setActiveView={setActiveView}
        />,
      );
    });

    const languageButton = container.querySelector(
      'button[aria-label="Linguagens"]',
    );
    expect(languageButton).toBeTruthy();

    act(() => {
      languageButton?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(setActiveView).toHaveBeenCalledWith("language");
    expect(setIsSidebarOpen).toHaveBeenCalledWith(true);

    act(() => {
      root.unmount();
    });
  });

  it("opens the debug sidebar from the former source-control slot", () => {
    useRouterMock.mockReturnValue({ locale: "pt-BR", push: vi.fn() });
    const setActiveView = vi.fn();
    const setIsSidebarOpen = vi.fn();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <SideMenu
          isSidebarOpen
          setIsSidebarOpen={setIsSidebarOpen}
          activeView="explorer"
          setActiveView={setActiveView}
        />,
      );
    });

    expect(container.textContent).toContain("debug");
    expect(container.textContent).not.toContain("git");

    const debugButton = container.querySelector('button[aria-label="Debug"]');
    expect(debugButton).toBeTruthy();

    act(() => {
      debugButton?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(setActiveView).toHaveBeenCalledWith("debug");
    expect(setIsSidebarOpen).toHaveBeenCalledWith(true);

    act(() => {
      root.unmount();
    });
  });
});
