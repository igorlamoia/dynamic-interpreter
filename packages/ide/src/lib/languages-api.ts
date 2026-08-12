import { api } from "@/lib/api";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";

export type LanguageDNA = {
  typing: "typed" | "untyped";
  array: "fixed" | "dynamic";
  block: "delimited" | "indentation";
  semicolon: "optional-eol" | "required";
};

export type CommunityLanguageFilters = Partial<LanguageDNA> & {
  query?: string;
};

export type LanguageSummary = {
  id: number;
  ownerId: number;
  ownerName: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  clonedFromId: number | null;
  isPublic: boolean;
  publishedAt: string | null;
  updatedAt: string;
  dna: LanguageDNA;
};

export type Language = LanguageSummary & {
  customization: StoredKeywordCustomization;
  imageQuery: string | null;
  presetId: string | null;
  createdAt: string;
};

export type CreateLanguageInput = {
  name: string;
  description?: string | null;
  customization: StoredKeywordCustomization;
  imageUrl?: string | null;
  imageQuery?: string | null;
  presetId?: string | null;
};

export type UpdateLanguageInput = Partial<{
  name: string;
  description: string | null;
  customization: StoredKeywordCustomization;
  imageUrl: string | null;
  imageQuery: string | null;
  presetId: string | null;
}>;

export const languagesApi = {
  list: async (): Promise<LanguageSummary[]> => {
    const { data } = await api.get<LanguageSummary[]>("/languages");
    return data;
  },
  listCommunity: async (
    filters: CommunityLanguageFilters = {},
  ): Promise<LanguageSummary[]> => {
    const { query, ...dnaFilters } = filters;
    const { data } = await api.get<LanguageSummary[]>("/languages/community", {
      params: {
        ...(query ? { q: query } : {}),
        ...dnaFilters,
      },
    });
    return data;
  },
  get: async (id: number): Promise<Language> => {
    const { data } = await api.get<Language>(`/languages/${id}`);
    return data;
  },
  create: async (input: CreateLanguageInput): Promise<Language> => {
    const { data } = await api.post<Language>("/languages", input);
    return data;
  },
  update: async (id: number, input: UpdateLanguageInput): Promise<Language> => {
    const { data } = await api.patch<Language>(`/languages/${id}`, input);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/languages/${id}`);
  },
  clone: async (id: number): Promise<Language> => {
    const { data } = await api.post<Language>(`/languages/${id}/clone`);
    return data;
  },
  import: async (id: number): Promise<Language> => {
    const { data } = await api.post<Language>(`/languages/${id}/import`);
    return data;
  },
  setPublication: async (id: number, isPublic: boolean): Promise<Language> => {
    const { data } = await api.put<Language>(
      `/languages/${id}/publication`,
      { isPublic },
    );
    return data;
  },
  getActive: async (): Promise<Language | null> => {
    const { data } = await api.get<Language | null>("/users/me/active-language");
    return data;
  },
  setActive: async (languageId: number | null): Promise<Language | null> => {
    const { data } = await api.put<Language | null>(
      "/users/me/active-language",
      { languageId },
    );
    return data;
  },
};
