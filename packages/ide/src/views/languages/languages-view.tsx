import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useActiveLanguage,
  useCloneLanguage,
  useDeleteLanguage,
  useLanguagesList,
  useSetLanguagePublication,
  useSetActiveLanguage,
} from "@/hooks/useLanguages";
import { useToast } from "@/contexts/ToastContext";
import { Alert } from "@/components/ui/alert";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { LanguagesGrid } from "./components/languages-grid";
import { LanguagesHeader } from "./components/languages-header";
import { LanguageDnaDialog } from "./components/language-dna-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/i18n";

export function LanguagesView() {
  const router = useRouter();
  const { locale } = router;
  const { showToast } = useToast();
  const { isCommunity } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const listQuery = useLanguagesList({ page, pageSize });
  const activeQuery = useActiveLanguage();
  const setActiveMut = useSetActiveLanguage();
  const cloneMut = useCloneLanguage();
  const deleteMut = useDeleteLanguage();
  const publicationMut = useSetLanguagePublication();

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
          t(locale, "ui.languages_load_error"),
        ),
      );
    }
  }, [listQuery.isError, listQuery.error, locale]);

  const languages = Array.isArray(listQuery.data)
    ? listQuery.data
    : (listQuery.data?.items ?? []);
  const totalPages = Array.isArray(listQuery.data)
    ? 1
    : (listQuery.data?.totalPages ?? 1);
  const totalItems = Array.isArray(listQuery.data)
    ? listQuery.data.length
    : (listQuery.data?.total ?? languages.length);

  const activeLanguageId = activeQuery.data?.id ?? null;
  // Enquanto a linguagem ativa ainda não é conhecida, nenhum card pode se
  // afirmar ativo ou inativo — e "Tornar ativa" fica desabilitado em todos
  // para não deixar um clique apressado disparar uma mutação inútil na
  // linguagem que já está ativa.
  const activeUnknown = activeQuery.isPending;

  const success = (message: string) => showToast({ type: "success", message });
  const failure = (message: string) => showToast({ type: "error", message });

  const goToCreator = (id?: number) => {
    void router.push(
      id === undefined ? "/language-creator" : `/language-creator/${id}`,
    );
  };

  const handleSetActive = async (id: number, name: string) => {
    try {
      await setActiveMut.mutateAsync(id);
      success(t(locale, "ui.languages_set_active_success", { name }));
    } catch {
      failure(t(locale, "ui.languages_set_active_error"));
    }
  };

  const handleClone = async (id: number, name: string) => {
    try {
      const clone = await cloneMut.mutateAsync(id);
      success(
        t(locale, "ui.languages_clone_success", {
          name,
          cloneName: clone.name,
        }),
      );
    } catch {
      failure(t(locale, "ui.languages_clone_error"));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(t(locale, "ui.languages_delete_confirm", { name }))) {
      return;
    }
    try {
      await deleteMut.mutateAsync(id);
      success(t(locale, "ui.languages_delete_success", { name }));
    } catch (error: any) {
      // 409 significa que algum exercício trava nesta linguagem — vale dizer
      // isso ao usuário em vez de um erro genérico.
      failure(
        error?.response?.status === 409
          ? t(locale, "ui.languages_delete_locked_error")
          : t(locale, "ui.languages_delete_error"),
      );
    }
  };

  const handlePublication = async (
    id: number,
    name: string,
    isPublic: boolean,
  ) => {
    try {
      await publicationMut.mutateAsync({ id, isPublic });
      success(
        isPublic
          ? t(locale, "ui.languages_publish_success", { name })
          : t(locale, "ui.languages_unpublish_success", { name }),
      );
    } catch {
      failure(t(locale, "ui.languages_publication_error"));
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
          canPublish={isCommunity}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onCreate={() => goToCreator()}
          onEdit={(id) => goToCreator(id)}
          onSetActive={handleSetActive}
          onClone={handleClone}
          onDelete={handleDelete}
          onViewDna={(id, name) => setDnaLanguage({ id, name })}
          onTogglePublication={handlePublication}
        />
      )}
      <LanguageDnaDialog
        languageId={dnaLanguage?.id}
        name={dnaLanguage?.name ?? ""}
        open={dnaLanguage !== null}
        onOpenChange={(open) => {
          if (!open) setDnaLanguage(null);
        }}
      />
    </>
  );
}
