import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HeroButton } from "@/components/buttons/hero";
import { t } from "@/i18n";
import { useRouter } from "next/router";

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
  const { locale } = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>{t(locale, "ui.exercises_delete_title")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t(locale, "ui.exercises_delete_description_before")}{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{exerciseTitle}&rdquo;
            </span>
            {t(locale, "ui.exercises_delete_description_after")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-muted/60 border-t border-border dark:bg-white/5 dark:border-white/10">
          <HeroButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border bg-card/80 text-foreground hover:bg-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {t(locale, "ui.dashboard_cancel")}
          </HeroButton>
          <HeroButton
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-rose-600 text-white hover:bg-rose-700 border-rose-600"
          >
            {isDeleting
              ? t(locale, "ui.exercises_deleting")
              : t(locale, "ui.delete")}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
