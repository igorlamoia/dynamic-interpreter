// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TeacherClassCard } from "./teacher-class-card";
import type { ClassSummary } from "@/types/api";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isTeacher: true }),
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ locale: "pt-BR" }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("lucide-react", () => ({
  Check: () => <span>check</span>,
  ClipboardList: () => <span>clipboard-list</span>,
  Copy: () => <span>copy</span>,
  LoaderCircle: () => <span>loader</span>,
  Users: () => <span>users</span>,
}));

const CLASS: ClassSummary = {
  id: 12,
  organizationId: 1,
  teacherId: 2,
  name: "Compiladores",
  description: "Turma de compiladores",
  accessCode: "A1B2C3",
  createdAt: "",
  status: "ACTIVE",
  _count: {
    members: 4,
    exerciseLists: 1,
  },
  teacher: {
    id: 2,
    name: "Professor",
    email: "teacher@example.com",
    avatarUrl: null,
    role: "TEACHER",
  },
};

describe("TeacherClassCard", () => {
  let root: Root;
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<TeacherClassCard cls={CLASS} />);
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.innerHTML = "";
  });

  it("copia o codigo de acesso e mostra o tooltip", async () => {
    const copyButton = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Copiar codigo de acesso da turma"]',
    );

    await act(async () => {
      copyButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(writeText).toHaveBeenCalledWith("A1B2C3");
    expect(document.body.textContent).toContain("Copiado!");
  });
});
