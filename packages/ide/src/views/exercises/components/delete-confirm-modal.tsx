import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HeroButton } from "@/components/buttons/hero";

export function DeleteConfirmModal({
  open,
  onOpenChange,
  exerciseTitle,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exerciseTitle: string;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Excluir Exercício</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tem certeza que deseja excluir{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{exerciseTitle}&rdquo;
            </span>
            ? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-muted/60 border-t border-border dark:bg-white/5 dark:border-white/10">
          <HeroButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border bg-card/80 text-foreground hover:bg-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            Cancelar
          </HeroButton>
          <HeroButton
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-rose-600 text-white hover:bg-rose-700 border-rose-600"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
