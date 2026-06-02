import { Copy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCloneLanguage } from "@/hooks/useLanguages";
import { useToast } from "@/contexts/ToastContext";

type LockedLanguageBannerProps = {
  language: { id: number; name: string; description: string | null };
};

export function LockedLanguageBanner({ language }: LockedLanguageBannerProps) {
  const cloneMut = useCloneLanguage();
  const { showToast } = useToast();

  const handleClone = async () => {
    try {
      const clone = await cloneMut.mutateAsync(language.id);
      showToast({
        type: "success",
        message: `"${language.name}" copiada para o seu acervo como "${clone.name}".`,
      });
    } catch (err: any) {
      showToast({
        type: "error",
        message:
          err?.response?.status === 403
            ? "Você não tem acesso a esta linguagem."
            : "Não foi possível clonar.",
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <Lock className="size-4 text-amber-500 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium truncate">
            Linguagem fixa: <span className="font-semibold">{language.name}</span>
          </p>
          {language.description && (
            <p className="opacity-70 truncate text-xs">{language.description}</p>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => void handleClone()}
        disabled={cloneMut.isPending}
        title="Salvar no meu acervo de linguagens"
      >
        <Copy className="size-4" />
        <span className="ml-2">Clonar para meu acervo</span>
      </Button>
    </div>
  );
}
