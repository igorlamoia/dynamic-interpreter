// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/sidebar";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const useRouterMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => useRouterMock(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("lucide-react", () => ({
  BookOpen: () => <span>book</span>,
  Code2: () => <span>code</span>,
  Languages: () => <span>languages</span>,
  LayoutDashboard: () => <span>dashboard</span>,
  ListChecks: () => <span>list</span>,
}));

function render(pathname: string, isTeacher: boolean) {
  useRouterMock.mockReturnValue({ pathname });
  useAuthMock.mockReturnValue({ isAuthenticated: true, isTeacher });

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<Sidebar />);
  });

  return { container, root };
}

describe("Sidebar", () => {
  beforeEach(() => {
    useRouterMock.mockReset();
    useAuthMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("mostra Minhas Linguagens para o aluno", () => {
    const { container, root } = render("/dashboard", false);

    const link = container.querySelector('a[href="/languages"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain("Minhas Linguagens");

    act(() => root.unmount());
  });

  it("mostra Minhas Linguagens para o professor", () => {
    const { container, root } = render("/dashboard", true);

    const link = container.querySelector('a[href="/languages"]');
    expect(link).toBeTruthy();

    act(() => root.unmount());
  });

  it("marca o item como ativo em /languages", () => {
    const { container, root } = render("/languages", false);

    const link = container.querySelector('a[href="/languages"]');
    expect(link?.className).toContain("bg-[#251e3c]");

    act(() => root.unmount());
  });

  it("mantém o item ativo enquanto o wizard está aberto", () => {
    const { container, root } = render("/language-creator", false);

    const link = container.querySelector('a[href="/languages"]');
    expect(link?.className).toContain("bg-[#251e3c]");

    act(() => root.unmount());
  });
});
