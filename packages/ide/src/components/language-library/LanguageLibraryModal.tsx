import { useState } from "react";
import { Loader2, Plus, Star, Trash2, Copy, Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCloneLanguage,
  useCreateLanguage,
  useDeleteLanguage,
  useLanguagesList,
  useSetActiveLanguage,
  useUpdateLanguage,
} from "@/hooks/useLanguages";
import { useKeywords } from "@/contexts/keyword/KeywordContext";
import { useToast } from "@/contexts/ToastContext";

type LanguageLibraryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LanguageLibraryModal({
  open,
  onOpenChange,
}: LanguageLibraryModalProps) {
  const { customization, activeLanguageId } = useKeywords();
  const { showToast } = useToast();
  const listQuery = useLanguagesList(open);
  const createMut = useCreateLanguage();
  const updateMut = useUpdateLanguage();
  const deleteMut = useDeleteLanguage();
  const cloneMut = useCloneLanguage();
  const setActiveMut = useSetActiveLanguage();

  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const success = (message: string) =>
    showToast({ type: "success", message });
  const error = (message: string) => showToast({ type: "error", message });

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await createMut.mutateAsync({ name, customization });
      setNewName("");
      success(`Linguagem "${name}" criada.`);
    } catch (err: any) {
      error(
        err?.response?.status === 409
          ? "Você já tem uma linguagem com esse nome."
          : "Não foi possível criar a linguagem.",
      );
    }
  };

  const handleSetActive = async (id: number, name: string) => {
    try {
      await setActiveMut.mutateAsync(id);
      success(`"${name}" agora é sua linguagem ativa.`);
    } catch {
      error("Não foi possível ativar a linguagem.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Excluir a linguagem "${name}"?`)) return;
    try {
      await deleteMut.mutateAsync(id);
      success(`"${name}" excluída.`);
    } catch (err: any) {
      error(
        err?.response?.status === 409
          ? "Linguagem em uso por algum exercício — não pode ser excluída."
          : "Não foi possível excluir.",
      );
    }
  };

  const handleClone = async (id: number, name: string) => {
    try {
      const clone = await cloneMut.mutateAsync(id);
      success(`"${name}" duplicada como "${clone.name}".`);
    } catch {
      error("Não foi possível duplicar.");
    }
  };

  const startRename = (id: number, current: string) => {
    setRenamingId(id);
    setRenameValue(current);
  };

  const commitRename = async () => {
    if (renamingId === null) return;
    const name = renameValue.trim();
    if (!name) {
      setRenamingId(null);
      return;
    }
    try {
      await updateMut.mutateAsync({ id: renamingId, input: { name } });
      success("Linguagem renomeada.");
    } catch (err: any) {
      error(
        err?.response?.status === 409 ? "Nome já em uso." : "Falha ao renomear.",
      );
    } finally {
      setRenamingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Minhas Linguagens</DialogTitle>
          <DialogDescription>
            Gerencie as linguagens personalizadas que você usa no IDE.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome da nova linguagem"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
              }}
            />
            <Button
              onClick={() => void handleCreate()}
              disabled={!newName.trim() || createMut.isPending}
            >
              {createMut.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              <span className="ml-2">Criar com a customização atual</span>
            </Button>
          </div>

          {listQuery.isPending ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin opacity-60" />
            </div>
          ) : listQuery.data && listQuery.data.length > 0 ? (
            <ul className="divide-y rounded border">
              {listQuery.data.map((lang) => {
                const isActive = lang.id === activeLanguageId;
                const isRenaming = renamingId === lang.id;
                return (
                  <li
                    key={lang.id}
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <Input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => void commitRename()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void commitRename();
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          className="h-7"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <Star
                              className="size-4 text-yellow-500"
                              fill="currentColor"
                              aria-label="Linguagem ativa"
                            />
                          )}
                          <span className="font-medium truncate">{lang.name}</span>
                          {lang.clonedFromId !== null && (
                            <span className="text-xs opacity-60">(clone)</span>
                          )}
                        </div>
                      )}
                      {lang.description && (
                        <p className="text-xs opacity-70 truncate">
                          {lang.description}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      title="Tornar ativa"
                      onClick={() => void handleSetActive(lang.id, lang.name)}
                      disabled={isActive || setActiveMut.isPending}
                    >
                      <Star className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Renomear"
                      onClick={() => startRename(lang.id, lang.name)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Duplicar"
                      onClick={() => void handleClone(lang.id, lang.name)}
                      disabled={cloneMut.isPending}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Excluir"
                      onClick={() => void handleDelete(lang.id, lang.name)}
                      disabled={deleteMut.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm opacity-70 text-center py-8">
              Nenhuma linguagem salva. Crie uma a partir da customização atual.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
