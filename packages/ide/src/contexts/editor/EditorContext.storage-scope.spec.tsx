// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { useFileSystem, FileData } from "@/hooks/useFileSystem";
import { getSourceCodeStorageKey } from "@/contexts/editor/EditorContext";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function renderFileSystemHook(storageScope?: string) {
  let resultRef: ReturnType<typeof useFileSystem> | null = null;
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);

  function Component() {
    resultRef = useFileSystem(storageScope);
    return null;
  }

  act(() => {
    root.render(createElement(Component));
  });

  return {
    get current() {
      return resultRef!;
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      host.remove();
    },
  };
}

const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, String(value));
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => {
    store.clear();
  },
  get length() {
    return store.size;
  },
  key: (i: number) => Array.from(store.keys())[i] ?? null,
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Exercise Code Isolation with storageScope", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("getSourceCodeStorageKey", () => {
    it("returns default key when storageScope is undefined", () => {
      expect(getSourceCodeStorageKey("src/main.?")).toBe("source-code-src/main.?");
    });

    it("scopes key to exercise when storageScope is provided", () => {
      expect(getSourceCodeStorageKey("src/main.?", "exercise-1")).toBe(
        "exercise-1:source-code-src/main.?",
      );
      expect(getSourceCodeStorageKey("src/main.?", "exercise-2")).toBe(
        "exercise-2:source-code-src/main.?",
      );
    });
  });

  describe("useFileSystem storage scoping", () => {
    it("isolates files between different exercise scopes", () => {
      // Mount hook for exercise 1
      const hookEx1 = renderFileSystemHook("exercise-1");

      act(() => {
        hookEx1.current.createOrUpdateFile(
          "src/main.?",
          'print("hello exercise 1");',
        );
      });

      expect(hookEx1.current.getFile("src/main.?")?.content).toBe(
        'print("hello exercise 1");',
      );

      // Verify localStorage key for exercise 1 was written
      const storedEx1 = localStorage.getItem("exercise-1:files-storage");
      expect(storedEx1).toContain("hello exercise 1");

      // Verify exercise 2 storage key does NOT exist
      expect(localStorage.getItem("exercise-2:files-storage")).toBeNull();

      // Mount hook for exercise 2
      const hookEx2 = renderFileSystemHook("exercise-2");

      // Exercise 2 should not have exercise 1's file
      expect(hookEx2.current.getFile("src/main.?")).toBeUndefined();

      // Write code for exercise 2
      act(() => {
        hookEx2.current.createOrUpdateFile(
          "src/main.?",
          'print("hello exercise 2");',
        );
      });

      expect(hookEx2.current.getFile("src/main.?")?.content).toBe(
        'print("hello exercise 2");',
      );

      // Verify exercise 1 storage was not overwritten
      const storedEx1After = localStorage.getItem("exercise-1:files-storage");
      const storedEx2After = localStorage.getItem("exercise-2:files-storage");

      expect(storedEx1After).toContain("hello exercise 1");
      expect(storedEx2After).toContain("hello exercise 2");
      expect(storedEx1After).not.toContain("hello exercise 2");
      expect(storedEx2After).not.toContain("hello exercise 1");

      hookEx1.unmount();
      hookEx2.unmount();
    });

    it("persists and restores separate exercise files on re-entry", () => {
      // Save code for exercise 1
      const session1 = renderFileSystemHook("exercise-1");
      act(() => {
        session1.current.createOrUpdateFile("src/main.?", "int x = 10;");
      });
      session1.unmount();

      // Save code for exercise 2
      const session2 = renderFileSystemHook("exercise-2");
      act(() => {
        session2.current.createOrUpdateFile("src/main.?", "int y = 20;");
      });
      session2.unmount();

      // Return to exercise 1
      const returnSession1 = renderFileSystemHook("exercise-1");
      expect(returnSession1.current.getFile("src/main.?")?.content).toBe(
        "int x = 10;",
      );
      returnSession1.unmount();

      // Return to exercise 2
      const returnSession2 = renderFileSystemHook("exercise-2");
      expect(returnSession2.current.getFile("src/main.?")?.content).toBe(
        "int y = 20;",
      );
      returnSession2.unmount();
    });
  });
});
