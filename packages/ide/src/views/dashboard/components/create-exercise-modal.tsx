"use client";

import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { useCreateExerciseMutation } from "@/hooks/use-api-queries";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TestCaseFields } from "./test-case-fields";
import { t } from "@/i18n";
import { useRouter } from "next/router";

interface TestCase {
  label: string;
  input: string;
  expectedOutput: string;
}

const testCaseSchema = z.object({
  label: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
});

const createCreateExerciseSchema = (locale?: string) =>
  z.object({
    exTitle: z
      .string()
      .min(1, t(locale, "ui.dashboard_exercise_title_required")),
    exDesc: z
      .string()
      .min(1, t(locale, "ui.dashboard_description_required")),
    exWeight: z
      .string()
      .min(1, t(locale, "ui.dashboard_exercise_weight_required")),
    testCases: z.array(testCaseSchema),
  });

type CreateExerciseFormValues = z.infer<
  ReturnType<typeof createCreateExerciseSchema>
>;

const defaultTestCases: TestCase[] = [
  { label: "", input: "", expectedOutput: "" },
  { label: "", input: "", expectedOutput: "" },
  { label: "", input: "", expectedOutput: "" },
];

interface CreateExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function CreateExerciseModal({
  open,
  onOpenChange,
  classId,
  onSuccess,
  onError,
}: CreateExerciseModalProps) {
  const { locale } = useRouter();
  const createExercise = useCreateExerciseMutation();
  const createExerciseSchema = useMemo(
    () => createCreateExerciseSchema(locale),
    [locale],
  );
  const form = useForm<CreateExerciseFormValues>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      exTitle: "",
      exDesc: "",
      exWeight: "1",
      testCases: defaultTestCases,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = async (values: CreateExerciseFormValues) => {
    form.clearErrors();

    try {
      await createExercise.mutateAsync({
        classId,
        title: values.exTitle,
        description: values.exDesc,
        gradeWeight: values.exWeight,
        testCases: values.testCases.filter(
          (tc) => tc.input.trim() || tc.expectedOutput.trim(),
        ),
      });

      onSuccess?.(t(locale, "ui.dashboard_create_exercise_success"));
      resetForm();
      onOpenChange(false);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        t(locale, "ui.dashboard_create_exercise_error"),
      );
      onError?.(message);
    }
  };

  const resetForm = () => {
    form.reset({
      exTitle: "",
      exDesc: "",
      exWeight: "1",
      testCases: defaultTestCases,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>
            {t(locale, "ui.dashboard_create_exercise_title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t(locale, "ui.dashboard_create_exercise_description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-exercise-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 flex-1 overflow-y-auto max-h-[calc(90vh-180px)] p-6 font-sans"
          >
            <FormField
              control={form.control}
              name="exTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(locale, "ui.dashboard_exercise_title_label")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t(
                        locale,
                        "ui.dashboard_exercise_title_placeholder",
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
              name="exDesc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(locale, "ui.dashboard_exercise_description_label")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder={t(
                        locale,
                        "ui.dashboard_exercise_description_placeholder",
                      )}
                      className="focus:border-primary/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(locale, "ui.dashboard_exercise_weight_label")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="test-cases">
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between pr-2">
                    <span>{t(locale, "ui.dashboard_test_cases_title")}</span>
                    <span className="text-xs text-muted-foreground">
                      {t(locale, "ui.dashboard_test_cases_expand")}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <TestCaseFields fields={fields} control={form.control} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
            form="create-exercise-form"
            disabled={createExercise.isPending}
            className="bg-linear-to-r from-primary to-[#10b981] text-slate-800 hover:opacity-90"
          >
            {createExercise.isPending
              ? t(locale, "ui.dashboard_creating")
              : t(locale, "ui.dashboard_create_exercise_submit")}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
