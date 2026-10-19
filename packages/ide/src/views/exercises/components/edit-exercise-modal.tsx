import { useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { HeroButton } from "@/components/buttons/hero";
import { LanguagePolicyField } from "@/components/language-policy-field";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useToast } from "@/contexts/ToastContext";
import { useUpdateExerciseMutation } from "@/hooks/use-api-queries";
import { useLanguagesList } from "@/hooks/useLanguages";
import type { Exercise } from "@/types/api";
import { TestCaseFields } from "./test-case-fields";
import { t } from "@/i18n";

const testCaseSchema = z.object({
  label: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
});

const editExerciseSchema = z.object({
  title: z.string().min(1, "Titulo e obrigatorio"),
  description: z.string().min(1, "Descricao e obrigatoria"),
  languagePolicy: z.enum(["OPEN", "LOCKED"]),
  lockedLanguageId: z.number().int().positive().nullable(),
  testCases: z.array(testCaseSchema),
});

type EditExerciseForm = z.infer<typeof editExerciseSchema>;

const emptyTestCase = { label: "", input: "", expectedOutput: "" };
const defaultTestCases = [emptyTestCase, emptyTestCase, emptyTestCase];

function formValuesFromExercise(exercise: Exercise | null): EditExerciseForm {
  if (!exercise) {
    return {
      title: "",
      description: "",
      languagePolicy: "OPEN",
      lockedLanguageId: null,
      testCases: defaultTestCases,
    };
  }

  return {
    title: exercise.title,
    description: exercise.description,
    languagePolicy: exercise.languagePolicy ?? "OPEN",
    lockedLanguageId: exercise.lockedLanguageId ?? null,
    testCases:
      exercise.testCases.length > 0
        ? exercise.testCases
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((testCase) => ({
              label: testCase.label ?? "",
              input: testCase.input ?? "",
              expectedOutput: testCase.expectedOutput ?? "",
            }))
        : defaultTestCases,
  };
}

export function EditExerciseModal({
  open,
  onOpenChange,
  exercise,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exercise: Exercise | null;
  onUpdated?: (exercise: Exercise) => void;
}) {
  const { locale } = useRouter();
  const { showToast } = useToast();
  const updateExercise = useUpdateExerciseMutation();
  const languagesQuery = useLanguagesList(open);
  const form = useForm<EditExerciseForm>({
    resolver: zodResolver(editExerciseSchema),
    defaultValues: formValuesFromExercise(exercise),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  useEffect(() => {
    if (open) {
      form.reset(formValuesFromExercise(exercise));
    }
  }, [exercise, form, open]);

  const onSubmit = async (values: EditExerciseForm) => {
    if (!exercise) return;
    if (
      values.languagePolicy === "LOCKED" &&
      values.lockedLanguageId === null
    ) {
      form.setError("lockedLanguageId", {
        type: "manual",
        message: t(locale, "ui.exercises_select_locked_language"),
      });
      return;
    }

    try {
      const updated = await updateExercise.mutateAsync({
        id: exercise.id,
        title: values.title,
        description: values.description,
        languagePolicy: values.languagePolicy,
        lockedLanguageId:
          values.languagePolicy === "LOCKED" ? values.lockedLanguageId : null,
        testCases: values.testCases.filter(
          (tc) => tc.input.trim() || tc.expectedOutput.trim(),
        ),
      });
      showToast({
        type: "success",
        message: t(locale, "ui.exercises_update_success"),
      });
      onUpdated?.(updated);
      onOpenChange(false);
    } catch {
      showToast({
        type: "error",
        message: t(locale, "ui.exercises_update_error"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>{t(locale, "ui.exercises_edit_title")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t(locale, "ui.exercises_edit_description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="edit-exercise-page-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex-1 overflow-y-auto max-h-[calc(90vh-180px)] p-6 font-sans"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(locale, "ui.dashboard_exercise_title_label")}</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12" />
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
                    {t(locale, "ui.dashboard_exercise_description_label")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
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

            <FormField
              control={form.control}
              name="lockedLanguageId"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion
              type="single"
              collapsible
              defaultValue="test-cases"
              className="w-full"
            >
              <AccordionItem value="test-cases">
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between pr-2">
                    <span>{t(locale, "ui.exercises_test_cases")}</span>
                    <span className="text-xs text-muted-foreground">
                      {t(
                        locale,
                        fields.length === 1
                          ? "ui.exercises_case_count_singular"
                          : "ui.exercises_case_count_plural",
                        { count: fields.length },
                      )}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <TestCaseFields fields={fields} control={form.control} />
                    <div className="flex flex-wrap gap-2">
                      <HeroButton
                        type="button"
                        variant="outline"
                        onClick={() => append(emptyTestCase)}
                        className="px-3 py-2 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {t(locale, "ui.exercises_add_case")}
                      </HeroButton>
                      {fields.length > 1 && (
                        <HeroButton
                          type="button"
                          variant="outline"
                          onClick={() => remove(fields.length - 1)}
                          className="px-3 py-2 text-xs text-rose-300 hover:text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t(locale, "ui.exercises_remove_last")}
                        </HeroButton>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
            form="edit-exercise-page-form"
            disabled={updateExercise.isPending}
            className="bg-linear-to-r from-primary to-[#10b981] text-slate-800 hover:opacity-90"
          >
            {updateExercise.isPending
              ? t(locale, "ui.exercises_saving")
              : t(locale, "ui.exercises_save_changes")}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
