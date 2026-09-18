// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubmissionsPanel } from "./submissions-panel";
import type { SubmissionRecord } from "./types";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("SubmissionsPanel", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders empty state when there are no submissions", () => {
    act(() => {
      root.render(
        <SubmissionsPanel
          submissions={[]}
          showSubmissions={true}
          loadingSubmissions={false}
          onToggle={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("Nenhuma submissão ainda.");
  });

  it("renders submission rows with student name, exercise title, score, and link to grading screen", () => {
    const mockSubmissions: SubmissionRecord[] = [
      {
        id: 42,
        studentId: 2,
        exerciseId: 1,
        status: "SUBMITTED",
        score: null,
        submittedAt: "2026-09-05T15:35:00.000Z",
        student: { name: "Maria Aluna", email: "maria@test.com" },
        exercise: { title: "Soma de Dois Números" },
      },
      {
        id: 43,
        studentId: 2,
        exerciseId: 2,
        status: "GRADED",
        score: 9.5,
        submittedAt: "2026-09-05T15:37:00.000Z",
        student: { name: "Maria Aluna", email: "maria@test.com" },
        exercise: { title: "Fatorial Recursivo" },
      },
    ];

    act(() => {
      root.render(
        <SubmissionsPanel
          submissions={mockSubmissions}
          showSubmissions={true}
          loadingSubmissions={false}
          onToggle={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("Maria Aluna");
    expect(container.textContent).toContain("Soma de Dois Números");
    expect(container.textContent).toContain("Fatorial Recursivo");
    expect(container.textContent).toContain("Submetido");
    expect(container.textContent).toContain("Avaliado");
    expect(container.textContent).toContain("9.5");

    const links = container.querySelectorAll("a");
    expect(links.length).toBe(2);
    expect(links[0]?.getAttribute("href")).toBe("/submissions/42");
    expect(links[0]?.textContent).toContain("Corrigir");
    expect(links[1]?.getAttribute("href")).toBe("/submissions/43");
    expect(links[1]?.textContent).toContain("Corrigir");
  });
});
