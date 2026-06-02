import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  languagesApi,
  type CreateLanguageInput,
  type Language,
  type LanguageSummary,
  type UpdateLanguageInput,
} from "@/lib/languages-api";
import { queryKeys } from "@/lib/query-keys";

export function useLanguagesList(enabled = true) {
  return useQuery<LanguageSummary[]>({
    queryKey: queryKeys.languages.all,
    queryFn: languagesApi.list,
    enabled,
  });
}

export function useLanguageDetail(id: number | undefined, enabled = true) {
  return useQuery<Language>({
    queryKey: queryKeys.languages.detail(id),
    queryFn: () => languagesApi.get(id as number),
    enabled: enabled && id !== undefined,
  });
}

export function useActiveLanguage(enabled = true) {
  return useQuery<Language | null>({
    queryKey: queryKeys.languages.active,
    queryFn: languagesApi.getActive,
    enabled,
  });
}

function useInvalidateLanguages() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.languages.all });
    qc.invalidateQueries({ queryKey: queryKeys.languages.active });
  };
}

export function useCreateLanguage() {
  const invalidate = useInvalidateLanguages();
  return useMutation({
    mutationFn: (input: CreateLanguageInput) => languagesApi.create(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateLanguage() {
  const invalidate = useInvalidateLanguages();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateLanguageInput }) =>
      languagesApi.update(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteLanguage() {
  const invalidate = useInvalidateLanguages();
  return useMutation({
    mutationFn: (id: number) => languagesApi.remove(id),
    onSuccess: () => invalidate(),
  });
}

export function useCloneLanguage() {
  const invalidate = useInvalidateLanguages();
  return useMutation({
    mutationFn: (id: number) => languagesApi.clone(id),
    onSuccess: () => invalidate(),
  });
}

export function useSetActiveLanguage() {
  const invalidate = useInvalidateLanguages();
  return useMutation({
    mutationFn: (languageId: number | null) => languagesApi.setActive(languageId),
    onSuccess: () => invalidate(),
  });
}
