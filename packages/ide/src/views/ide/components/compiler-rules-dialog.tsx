"use client";

import { BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCompilerRulesIntl } from "@/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompilerRulesDialogProps {
  locale?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompilerRulesDialog({
  locale,
  open,
  onOpenChange,
}: CompilerRulesDialogProps) {
  const rulesIntl = getCompilerRulesIntl(locale);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader className="items-start">
          <div className="flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-primary" aria-hidden="true" />
            <DialogTitle>{rulesIntl.title}</DialogTitle>
          </div>
          <DialogDescription>{rulesIntl.description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
          <div className="grid gap-3 md:grid-cols-2">
            {rulesIntl.sections.map((section) => (
              <section
                key={section.title}
                className="mt-4 rounded-lg border border-black/10 bg-background p-4 dark:border-white/10"
              >
                <h3 className="text-sm font-semibold">{section.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {section.code ? (
                  <pre className="mt-4 max-h-56 overflow-auto rounded-lg border border-black/10 bg-black/5 p-3 text-xs leading-relaxed text-foreground dark:border-white/10 dark:bg-black/30">
                    <code>{section.code}</code>
                  </pre>
                ) : null}
              </section>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {rulesIntl.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
