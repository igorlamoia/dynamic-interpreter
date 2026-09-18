// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SpaceBackground } from "./space-background";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("./background-mascot-marquee", () => ({
  BackgroundMascotMarquee: () => <div data-testid="background-mascot-marquee" />,
}));

vi.mock("./ui/meteors", () => ({
  Meteors: () => <div data-testid="meteors" />,
}));

vi.mock("@/components/ui/particles", () => ({
  Particles: () => <div data-testid="particles" />,
}));

describe("SpaceBackground", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders meteors and particles", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<SpaceBackground />);
    });

    // O <BackgroundMascotMarquee /> esta comentado no SpaceBackground desde
    // a61c581; o componente continua com o proprio spec.
    expect(container.querySelector('[data-testid="meteors"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="particles"]')).not.toBeNull();

    act(() => {
      root.unmount();
    });
  });
});
