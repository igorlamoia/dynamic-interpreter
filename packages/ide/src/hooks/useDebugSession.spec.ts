// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { useDebugSession, UseDebugSessionResult } from "./useDebugSession";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function renderHook(
  options: Parameters<typeof useDebugSession>[0],
): { getResult: () => UseDebugSessionResult } {
  const resultRef: { current: UseDebugSessionResult | null } = {
    current: null,
  };

  function Harness() {
    resultRef.current = useDebugSession(options);
    return null;
  }

  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);

  act(() => {
    root!.render(createElement(Harness));
  });

  return {
    getResult: () => {
      if (!resultRef.current) throw new Error("Hook did not render");
      return resultRef.current;
    },
  };
}

afterEach(() => {
  if (root) {
    act(() => root!.unmount());
  }
  host?.remove();
  root = null;
  host = null;
});

describe("useDebugSession", () => {
  it("starts, continues to a breakpoint, and tracks output", async () => {
    const currentLines: Array<number | null> = [];
    const { getResult } = renderHook({
      breakpoints: [4],
      onCurrentLineChange: (line) => currentLines.push(line),
    });

    await act(async () => {
      await getResult().start(`
int main() {
  int x = 1;
  print(x);
}
`);
    });

    await act(async () => {
      await getResult().continueExecution();
    });

    expect(getResult().snapshot?.status).toBe("paused");
    expect(getResult().snapshot?.stopReason).toBe("breakpoint");
    expect(getResult().snapshot?.currentSource?.line).toBe(4);
    expect(getResult().output).toEqual([]);
    expect(getResult().boundBreakpoints).toEqual([4]);
    expect(getResult().unboundBreakpoints).toEqual([]);
    expect(currentLines).toContain(4);
  });

  it("steps and captures output until completion", async () => {
    const { getResult } = renderHook({ breakpoints: [] });

    await act(async () => {
      await getResult().start(`
int main() {
  int x = 2;
  print(x);
}
`);
    });

    await act(async () => {
      await getResult().stepInto();
      await getResult().continueExecution();
    });

    expect(getResult().snapshot?.status).toBe("completed");
    expect(getResult().output).toEqual(["2"]);
  });

  it("marks breakpoints without generated instructions as unbound", async () => {
    const { getResult } = renderHook({ breakpoints: [99] });

    await act(async () => {
      await getResult().start(`
int main() {
  print(1);
}
`);
    });

    expect(getResult().boundBreakpoints).toEqual([]);
    expect(getResult().unboundBreakpoints).toEqual([99]);
  });

  it("keeps compile errors visible when debug start fails", async () => {
    const { getResult } = renderHook({ breakpoints: [] });

    await act(async () => {
      await getResult().start(`
int main() {
  int x = ;
}
`);
    });

    expect(getResult().snapshot).toBeNull();
    expect(getResult().error).toBeTruthy();
  });

  it("marks a started session stale only when the source changes", async () => {
    const { getResult } = renderHook({ breakpoints: [] });
    const source = `
int main() {
  print(1);
}
`;

    act(() => {
      getResult().markStale(source);
    });
    expect(getResult().isStale).toBe(false);

    await act(async () => {
      await getResult().start(source);
    });

    act(() => {
      getResult().markStale(source);
    });
    expect(getResult().isStale).toBe(false);

    act(() => {
      getResult().markStale(`${source}\n`);
    });
    expect(getResult().isStale).toBe(true);
  });
});
