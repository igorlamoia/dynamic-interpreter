import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../language-images/search";

// A rota usa so o Unsplash (search.ts). Dois testes deste arquivo cobriam uma
// integracao com o Pixabay que nunca existiu em nenhum commit da rota; foram
// removidos quando o spec entrou no CI. Ficam no historico do git.
describe("/api/language-images/search", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.PIXABAY_API_KEY;
    delete process.env.UNSPLASH_ACCESS_KEY;
  });

  it("rejects missing or blank queries", async () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();

    await handler(
      {
        method: "GET",
        query: { q: "   " },
      } as any,
      { status, json } as any,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: "A search query is required.",
    });
  });

  it("fails when neither Pixabay nor Unsplash is configured", async () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();

    await handler(
      {
        method: "GET",
        query: { q: "neon language" },
      } as any,
      { status, json } as any,
    );

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: "Language image search is not configured.",
    });
  });

  it("falls back to Unsplash when the Pixabay key is not configured", async () => {
    process.env.UNSPLASH_ACCESS_KEY = "unsplash-test-key";
    const fetchMock = vi.fn(async (_url, init) => ({
      ok: true,
      json: async () => ({
        results: [
          {
            id: "abc123",
            alt_description: "neon laptop on a desk",
            description: "ignored description",
            urls: {
              raw: "https://img.example/raw.jpg",
              small: "https://img.example/small.jpg",
              regular: "https://img.example/regular.jpg",
            },
          },
        ],
      }),
      requestInit: init,
    }));
    vi.stubGlobal("fetch", fetchMock);

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();

    await handler(
      {
        method: "GET",
        query: { q: "neon language" },
      } as any,
      { status, json } as any,
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      "https://api.unsplash.com/search/photos",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: {
        Authorization: "Client-ID unsplash-test-key",
      },
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      images: [
        {
          id: 0,
          provider: "unsplash",
          previewURL:
            "https://img.example/raw.jpg?w=480&h=320&crop=entropy&fm=jpg&auto=format&q=80&fit=crop&dpr=1",
          webformatURL: "https://img.example/regular.jpg",
          tags: "neon laptop on a desk",
        },
      ],
    });
  });

  it("surfaces upstream failures without exposing internals", async () => {
    process.env.PIXABAY_API_KEY = "pixabay-test-key";
    process.env.UNSPLASH_ACCESS_KEY = "unsplash-test-key";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
        }),
    );

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();

    await handler(
      {
        method: "GET",
        query: { q: "retro compiler" },
      } as any,
      { status, json } as any,
    );

    expect(status).toHaveBeenCalledWith(502);
    expect(json).toHaveBeenCalledWith({
      error: "Unable to fetch language images right now.",
    });
  });

});
