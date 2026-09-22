import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/contexts/ToastContext";
import { useCreateExerciseListMutation } from "@/hooks/use-api-queries";
import { useLanguagesList } from "@/hooks/useLanguages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { HeroButton } from "@/components/buttons/hero";
import { LanguagePolicyField } from "@/components/language-policy-field";
import { t } from "@/i18n";

const createListSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  languagePolicy: z.enum(["OPEN", "LOCKED"]),
  lockedLanguageId: z.number().int().positive().nullable(),
});
type CreateListForm = z.infer<typeof createListSchema>;

export function CreateListModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
}) {
  const { locale } = useRouter();
  const { showToast } = useToast();
  const createList = useCreateExerciseListMutation();
  const languagesQuery = useLanguagesList(open);
  const form = useForm<CreateListForm>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      title: "",
      description: "",
      languagePolicy: "OPEN",
      lockedLanguageId: null,
    },
  });

  const onSubmit = async (values: CreateListForm) => {
    if (
      values.languagePolicy === "LOCKED" &&
      values.lockedLanguageId === null
    ) {
      form.setError("lockedLanguageId", {
        type: "manual",
        message: t(locale, "ui.exercise_lists_choose_language"),
      });
      return;
    }
    try {
      await createList.mutateAsync({
        title: values.title,
        description: values.description,
        languagePolicy: values.languagePolicy,
        lockedLanguageId:
          values.languagePolicy === "LOCKED" ? values.lockedLanguageId : null,
      });
      showToast({
        type: "success",
        message: t(locale, "ui.exercise_lists_create_success"),
      });
      form.reset();
      onOpenChange(false);
      onCreated?.();
    } catch {
      showToast({
        type: "error",
        message: t(locale, "ui.exercise_lists_create_error"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>{t(locale, "ui.exercise_lists_create_title")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t(locale, "ui.exercise_lists_create_description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-list-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(locale, "ui.dashboard_exercise_title_label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t(
                        locale,
                        "ui.exercise_lists_title_placeholder",
                      )}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(locale, "ui.exercise_lists_description_optional")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder={t(
                        locale,
                        "ui.exercise_lists_description_placeholder",
                      )}
                      className="focus:border-primary/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="languagePolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(locale, "ui.exercises_language_policy")}</FormLabel>
                  <FormControl>
                    <LanguagePolicyField
                      value={{
                        policy: field.value,
                        lockedLanguageId: form.watch("lockedLanguageId"),
                      }}
                      onChange={(next) => {
                        field.onChange(next.policy);
                        form.setValue(
                          "lockedLanguageId",
                          next.lockedLanguageId,
                        );
                      }}
                      languages={languagesQuery.data ?? []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* o guard do onSubmit registra o erro em lockedLanguageId; o
                FormMessage acima só enxerga languagePolicy, então a mensagem
                precisa do seu próprio campo para aparecer */}
            <FormField
              control={form.control}
              name="lockedLanguageId"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="bg-muted/60 border-t border-border dark:bg-white/5 dark:border-white/10">
          <HeroButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border bg-card/80 text-foreground hover:bg-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {t(locale, "ui.dashboard_cancel")}
          </HeroButton>
          <HeroButton
            type="submit"
            form="create-list-form"
            disabled={createList.isPending}
          >
            {createList.isPending
              ? t(locale, "ui.dashboard_creating")
              : t(locale, "ui.exercise_lists_create_submit")}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
