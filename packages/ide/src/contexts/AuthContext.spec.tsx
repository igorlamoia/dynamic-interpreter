// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";

import { AuthProvider, useAuth } from "./AuthContext";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("AuthContext", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.cookie = "lms_access_token=; Path=/; Max-Age=0; SameSite=Lax";
  });

  it("exposes whether the authenticated user is a teacher", () => {
    let auth: ReturnType<typeof useAuth> | undefined;

    function Consumer() {
      auth = useAuth();
      return null;
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const queryClient = new QueryClient();

    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Consumer />
          </AuthProvider>
        </QueryClientProvider>,
      );
    });

    expect(auth?.isTeacher).toBe(false);

    act(() => {
      auth?.login({
        token: "token",
        user: {
          id: 1,
          name: "Teacher",
          email: "teacher@example.com",
          role: "TEACHER",
          organizationId: 1,
        },
      });
    });

    expect(auth?.isTeacher).toBe(true);

    act(() => {
      root.unmount();
    });
  });

  it("identifies a community member without academic privileges", () => {
    let auth: ReturnType<typeof useAuth> | undefined;

    function Consumer() {
      auth = useAuth();
      return null;
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const queryClient = new QueryClient();

    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Consumer />
          </AuthProvider>
        </QueryClientProvider>,
      );
    });

    act(() => {
      auth?.login({
        token: "token",
        user: {
          id: 2,
          name: "Community",
          email: "community@example.com",
          role: "COMMUNITY",
          organizationId: null,
        },
      });
    });

    expect(auth?.isCommunity).toBe(true);
    expect(auth?.isTeacher).toBe(false);
    expect(auth?.organizationId).toBeNull();

    act(() => root.unmount());
  });
});
