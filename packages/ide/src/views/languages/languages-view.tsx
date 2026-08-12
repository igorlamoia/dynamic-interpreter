import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useActiveLanguage,
  useCloneLanguage,
  useDeleteLanguage,
  useLanguagesList,
  useSetActiveLanguage,
} from "@/hooks/useLanguages";
import { useToast } from "@/contexts/ToastContext";
import { Alert } from "@/components/ui/alert";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { LanguagesGrid } from "./components/languages-grid";
import { LanguagesHeader } from "./components/languages-header";
import { LanguageDnaDialog } from "./components/language-dna-dialog";

export function LanguagesView() {
  const router = useRouter();
  const { showToast } = useToast();
  const listQuery = useLanguagesList();
  const activeQuery = useActiveLanguage();
  const setActiveMut = useSetActiveLanguage();
  const cloneMut = useCloneLanguage();
  const deleteMut = useDeleteLanguage();

  // Um erro de carregamento não pode se disfarçar de conta vazia: sem isto,
  // GET /languages falhando (rede, sessão expirada, 500) mostraria "Nenhuma
  // linguagem — Criar a primeira", convidando o usuário a duplicar algo que
  // ele já tem.
  const [loadError, setLoadError] = useState("");
  const [dnaLanguage, setDnaLanguage] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (listQuery.isError) {
      setLoadError(
        getApiErrorMessage(
          listQuery.error,
          "Não foi possível carregar suas linguagens.",
        ),
      );
    }
  }, [listQuery.isError, listQuery.error]);

  const languages = listQuery.data ?? [];
  const activeLanguageId = activeQuery.data?.id ?? null;
  // Enquanto a linguagem ativa ainda não é conhecida, nenhum card pode se
  // afirmar ativo ou inativo — e "Tornar ativa" fica desabilitado em todos
  // para não deixar um clique apressado disparar uma mutação inútil na
  // linguagem que já está ativa.
  const activeUnknown = activeQuery.isPending;

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
      {loadError && (
        <Alert
          variant="error"
          onClose={() => setLoadError("")}
          className="mb-6"
        >
          {loadError}
        </Alert>
      )}
      {!listQuery.isError && (
        <LanguagesGrid
          languages={languages}
          loading={listQuery.isPending}
          activeLanguageId={activeLanguageId}
          activeUnknown={activeUnknown}
          onCreate={() => goToCreator()}
          onEdit={(id) => goToCreator(id)}
          onSetActive={handleSetActive}
          onClone={handleClone}
          onDelete={handleDelete}
          onViewDna={(id, name) => setDnaLanguage({ id, name })}
        />
      )}
      <LanguageDnaDialog
        languageId={dnaLanguage?.id}
        languageName={dnaLanguage?.name ?? ""}
        open={dnaLanguage !== null}
        onOpenChange={(open) => {
          if (!open) setDnaLanguage(null);
        }}
      />
    </>
  );
}
