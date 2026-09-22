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
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { HeroButton } from "@/components/buttons/hero";
import { useCreateClassMutation } from "@/hooks/use-api-queries";
import { t } from "@/i18n";
import { useRouter } from "next/router";

const createCreateClassSchema = (locale?: string) =>
  z.object({
    className: z
      .string()
      .min(1, t(locale, "ui.dashboard_class_name_required")),
    classDesc: z
      .string()
      .min(1, t(locale, "ui.dashboard_description_required")),
  });

type CreateClassFormValues = z.infer<
  ReturnType<typeof createCreateClassSchema>
>;

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string, accessCode: string) => void;
  onError?: (message: string) => void;
}

export function CreateClassModal({
  open,
  onOpenChange,
  onSuccess,
  onError,
}: CreateClassModalProps) {
  const { locale } = useRouter();
  const createClass = useCreateClassMutation();
  const createClassSchema = useMemo(
    () => createCreateClassSchema(locale),
    [locale],
  );
  const form = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      className: "",
      classDesc: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (values: CreateClassFormValues) => {
    form.clearErrors();

    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      await createClass.mutateAsync({
        name: values.className,
        description: values.classDesc,
        accessCode,
      });

      onSuccess?.(
        t(locale, "ui.dashboard_create_class_success", { accessCode }),
        accessCode,
      );
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        t(locale, "ui.dashboard_create_class_error"),
      );
      onError?.(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(locale, "ui.dashboard_create_class_title")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t(locale, "ui.dashboard_create_class_description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-class-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 flex-1 overflow-y-auto max-h-[60vh] p-6 font-sans"
          >
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(locale, "ui.dashboard_class_name_label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t(
                        locale,
                        "ui.dashboard_class_name_placeholder",
                      )}
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classDesc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(locale, "ui.dashboard_description_label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder={t(
                        locale,
                        "ui.dashboard_class_description_placeholder",
                      )}
                      className="focus:border-primary/50"
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
            form="create-class-form"
            disabled={createClass.isPending}
            className="bg-linear-to-r from-primary to-[#10b981] text-slate-800 hover:opacity-90"
          >
            {createClass.isPending
              ? t(locale, "ui.dashboard_creating")
              : t(locale, "ui.dashboard_create_class_submit")}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
