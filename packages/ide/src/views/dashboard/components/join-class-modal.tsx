"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { HeroButton } from "@/components/buttons/hero";
import { useJoinClassMutation } from "@/hooks/use-api-queries";
import { useToast } from "@/contexts/ToastContext";
import { t } from "@/i18n";
import { useRouter } from "next/router";

const createJoinClassSchema = (locale?: string) => z.object({
  joinCode: z
    .string()
    .min(1, t(locale, "ui.dashboard_join_code_required"))
    .max(6, t(locale, "ui.dashboard_join_code_max")),
});

type JoinClassFormValues = z.infer<ReturnType<typeof createJoinClassSchema>>;

interface JoinClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function JoinClassModal({
  open,
  onOpenChange,
  onSuccess,
  onError,
}: JoinClassModalProps) {
  const { locale } = useRouter();
  const joinClass = useJoinClassMutation();
  const { showToast } = useToast();
  const joinClassSchema = useMemo(
    () => createJoinClassSchema(locale),
    [locale],
  );
  const form = useForm<JoinClassFormValues>({
    resolver: zodResolver(joinClassSchema),
    defaultValues: {
      joinCode: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (values: JoinClassFormValues) => {
    form.clearErrors();

    try {
      await joinClass.mutateAsync(values.joinCode.toUpperCase());

      onSuccess?.(t(locale, "ui.dashboard_join_class_success"));
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        t(locale, "ui.dashboard_join_class_invalid_code"),
      );
      showToast({ type: "error", message });
      onError?.(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover text-popover-foreground dark:bg-[#182f34] dark:border-white/10 dark:text-white">
        <DialogHeader className="flex flex-col">
          <DialogTitle>{t(locale, "ui.dashboard_join_class_title")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t(locale, "ui.dashboard_join_class_description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="join-class-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 p-6 font-sans"
          >
            <FormField
              control={form.control}
              name="joinCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(locale, "ui.dashboard_join_code_label")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) =>
                        field.onChange(event.target.value.toUpperCase())
                      }
                      maxLength={6}
                      placeholder={t(
                        locale,
                        "ui.dashboard_join_code_placeholder",
                      )}
                      className="h-12 font-mono text-center text-base tracking-widest uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="bg-muted/60 border-t border-border dark:bg-white/5 dark:border-white/10">
          <HeroButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border bg-card/80 text-foreground hover:bg-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {t(locale, "ui.dashboard_cancel")}
          </HeroButton>
          <HeroButton
            type="submit"
            form="join-class-form"
            disabled={joinClass.isPending}
            className="bg-linear-to-r from-primary to-[#10b981] text-slate-800 hover:opacity-90"
          >
            {joinClass.isPending
              ? t(locale, "ui.dashboard_joining")
              : t(locale, "ui.dashboard_join")}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
