import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/contexts/ToastContext";
import { usePublishExerciseListMutation } from "@/hooks/use-api-queries";
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
import { HeroButton } from "@/components/buttons/hero";
import type { ClassOption } from "./types";
import { t } from "@/i18n";

function defaultDeadline() {
  const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm for datetime-local
}

function getPublishSchema(locale: string | undefined) {
  return z.object({
    classId: z.string().min(1, t(locale, "ui.exercise_lists_select_class")),
    totalGrade: z
      .string()
      .min(1, t(locale, "ui.exercise_lists_total_grade_required")),
    minRequired: z
      .string()
      .min(1, t(locale, "ui.exercise_lists_min_required_required")),
    deadline: z
      .string()
      .min(1, t(locale, "ui.exercise_lists_deadline_required")),
  });
}
type PublishForm = z.infer<ReturnType<typeof getPublishSchema>>;

export function PublishModal({
  open,
  onOpenChange,
  listId,
  classes,
  onPublished,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string;
  classes: ClassOption[];
  onPublished?: () => void;
}) {
  const { locale } = useRouter();
  const { showToast } = useToast();
  const publishList = usePublishExerciseListMutation();
  const form = useForm<PublishForm>({
    resolver: zodResolver(getPublishSchema(locale)),
    defaultValues: {
      classId: "",
      totalGrade: "10",
      minRequired: "1",
      deadline: defaultDeadline(),
    },
  });

  const onSubmit = async (values: PublishForm) => {
    try {
      await publishList.mutateAsync({
        listId,
        classId: Number(values.classId),
        totalGrade: Number(values.totalGrade),
        minRequired: Number(values.minRequired),
        deadline: new Date(values.deadline).toISOString(),
      });
      showToast({
        type: "success",
        message: t(locale, "ui.exercise_lists_publish_success"),
      });
      form.reset();
      onOpenChange(false);
      onPublished?.();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      console.error("[publish] erro:", err);
      showToast({
        type: "error",
        message: detail
          ? t(locale, "ui.error_with_detail", { detail })
          : t(locale, "ui.exercise_lists_publish_error"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>{t(locale, "ui.exercise_lists_publish_title")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t(locale, "ui.exercise_lists_publish_description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="publish-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-1"
          >
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(locale, "ui.exercise_lists_class_label")}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-11 bg-background/80 border border-input rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-primary/50 dark:bg-black/30 dark:border-white/10 dark:text-slate-100"
                    >
                      <option
                        value=""
                        className="bg-background text-foreground"
                      >
                        {t(locale, "ui.select_placeholder")}
                      </option>
                      {classes.map((c) => (
                        <option
                          key={c.id}
                          value={c.id}
                          className="bg-background text-foreground"
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(locale, "ui.exercise_lists_total_grade")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="0.5"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(locale, "ui.exercise_lists_min_required")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(locale, "ui.exercise_lists_deadline")}</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} className="h-11" />
                  </FormControl>
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
            form="publish-form"
            disabled={publishList.isPending}
          >
            {publishList.isPending
              ? t(locale, "ui.exercise_lists_publishing")
              : t(locale, "ui.exercise_lists_publish")}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
