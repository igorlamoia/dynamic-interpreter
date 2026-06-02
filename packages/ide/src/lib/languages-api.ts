import { api } from "@/lib/api";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";

export type LanguageSummary = {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  clonedFromId: number | null;
  updatedAt: string;
};

export type Language = LanguageSummary & {
  customization: StoredKeywordCustomization;
  createdAt: string;
};

export type CreateLanguageInput = {
  name: string;
  description?: string | null;
  customization: StoredKeywordCustomization;
};

export type UpdateLanguageInput = Partial<{
  name: string;
  description: string | null;
  customization: StoredKeywordCustomization;
}>;

export const languagesApi = {
  list: async (): Promise<LanguageSummary[]> => {
    const { data } = await api.get<LanguageSummary[]>("/languages");
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
