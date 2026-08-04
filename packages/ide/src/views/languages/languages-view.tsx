import { useRouter } from "next/router";
import {
  useActiveLanguage,
  useCloneLanguage,
  useDeleteLanguage,
  useLanguagesList,
  useSetActiveLanguage,
} from "@/hooks/useLanguages";
import { useToast } from "@/contexts/ToastContext";
import { LanguagesGrid } from "./components/languages-grid";
import { LanguagesHeader } from "./components/languages-header";

export function LanguagesView() {
  const router = useRouter();
  const { showToast } = useToast();
  const listQuery = useLanguagesList();
  const activeQuery = useActiveLanguage();
  const setActiveMut = useSetActiveLanguage();
  const cloneMut = useCloneLanguage();
  const deleteMut = useDeleteLanguage();

  const languages = listQuery.data ?? [];
  const activeLanguageId = activeQuery.data?.id ?? null;

  const success = (message: string) => showToast({ type: "success", message });
  const failure = (message: string) => showToast({ type: "error", message });

  const goToCreator = (id?: number) => {
    void router.push(id === undefined ? "/language-creator" : `/language-creator?id=${id}`);
  };

  const handleSetActive = async (id: number, name: string) => {
    try {
      await setActiveMut.mutateAsync(id);
      success(`"${name}" agora é sua linguagem ativa.`);
    } catch {
      failure("Não foi possível ativar a linguagem.");
    }
  };

  const handleClone = async (id: number, name: string) => {
    try {
      const clone = await cloneMut.mutateAsync(id);
      success(`"${name}" duplicada como "${clone.name}".`);
    } catch {
      failure("Não foi possível duplicar.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Excluir a linguagem "${name}"?`)) return;
    try {
      await deleteMut.mutateAsync(id);
      success(`"${name}" excluída.`);
    } catch (error: any) {
      // 409 significa que algum exercício trava nesta linguagem — vale dizer
      // isso ao usuário em vez de um erro genérico.
      failure(
        error?.response?.status === 409
          ? "Esta linguagem está travada em algum exercício e não pode ser excluída."
          : "Não foi possível excluir.",
      );
    }
  };

  return (
    <>
      <LanguagesHeader onCreate={() => goToCreator()} />
      <LanguagesGrid
        languages={languages}
        loading={listQuery.isPending}
        activeLanguageId={activeLanguageId}
        onCreate={() => goToCreator()}
        onEdit={(id) => goToCreator(id)}
        onSetActive={handleSetActive}
        onClone={handleClone}
        onDelete={handleDelete}
      />
    </>
  );
}
