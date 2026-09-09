import type { GetServerSidePropsContext } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { getServerSideProps } from "./server-props";

vi.mock("@/lib/api", () => ({ api: { get: vi.fn() } }));

function context(id?: string | string[], token?: string) {
  return {
    params: id === undefined ? {} : { id },
    req: { cookies: { lms_access_token: token } },
    res: { setHeader: vi.fn() },
  } as unknown as GetServerSidePropsContext;
}

describe("language creator server props", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens creation without fetching a language", async () => {
    expect(await getServerSideProps(context())).toEqual({
      props: { editingLanguageId: null, initialLanguage: null },
    });
    expect(api.get).not.toHaveBeenCalled();
  });

  it("fetches the route ID with request-scoped authentication", async () => {
    const language = { id: 12, name: "Example" };
    vi.mocked(api.get).mockResolvedValue({ data: language });
    const ctx = context("12", "session-token");
    expect(await getServerSideProps(ctx)).toEqual({
      props: { editingLanguageId: 12, initialLanguage: language },
    });
    expect(api.get).toHaveBeenCalledWith("/languages/12", {
      headers: { Authorization: "Bearer session-token" },
    });
    expect(ctx.res.setHeader).toHaveBeenCalledWith("Cache-Control", "private, no-store");
  });

  it.each(["0", "-1", "12abc", "1.5", "9007199254740992", ["12"]])(
    "rejects invalid ID %s",
    async (id) => {
      expect(await getServerSideProps(context(id, "token"))).toEqual({ notFound: true });
      expect(api.get).not.toHaveBeenCalled();
    },
  );

  it("redirects missing sessions to login", async () => {
    expect(await getServerSideProps(context("12"))).toEqual({
      redirect: { destination: "/login", permanent: false },
    });
    expect(api.get).not.toHaveBeenCalled();
  });

  it.each([401, 403, 404])("handles API status %s", async (status) => {
    vi.mocked(api.get).mockRejectedValue({ isAxiosError: true, response: { status } });
    expect(await getServerSideProps(context("12", "token"))).toEqual(
      status === 401
        ? { redirect: { destination: "/login", permanent: false } }
        : { notFound: true },
    );
  });

  it("propagates unexpected failures instead of opening an empty editor", async () => {
    const error = new Error("API unavailable");
    vi.mocked(api.get).mockRejectedValue(error);
    await expect(getServerSideProps(context("12", "token"))).rejects.toThrow(error);
  });
});
