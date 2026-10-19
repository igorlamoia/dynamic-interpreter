import { vi } from "vitest";

vi.mock("next/router", () => ({
  useRouter: () => ({
    locale: "pt-BR",
    defaultLocale: "pt-BR",
    locales: ["pt-BR", "pt-PT", "es", "en"],
    pathname: "/",
    route: "/",
    query: {},
    asPath: "/",
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    reload: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isReady: true,
  }),
}));

/**
 * APIs de layout/rolagem que o navegador tem e o jsdom não implementa.
 * Componentes que rolam áreas (ex.: o wizard do keyword-customizer chama
 * `scrollArea.scrollTo`) quebravam com "scrollTo is not a function", e os
 * que leem breakpoints (`useBreakpoint`) com "matchMedia is not a function".
 * Os shims não fazem nada: o jsdom não calcula layout, então não há o que
 * rolar. Só são instalados quando ausentes.
 */
if (typeof window !== "undefined" && typeof Element !== "undefined") {
  const proto = Element.prototype as Element & {
    scrollTo?: unknown;
    scrollIntoView?: unknown;
  };
  if (typeof proto.scrollTo !== "function") {
    proto.scrollTo = function scrollTo() {};
  }
  if (typeof proto.scrollIntoView !== "function") {
    proto.scrollIntoView = function scrollIntoView() {};
  }
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  // Sem layout, nenhuma media query casa: os componentes renderizam o layout
  // base (mobile-first), que é o que os testes já esperavam.
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
