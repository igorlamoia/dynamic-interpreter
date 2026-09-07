"use client";

import { useEffect } from "react";
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

const createExerciseSchema = z.object({
  exTitle: z.string().min(1, "Título é obrigatório"),
  exDesc: z.string().min(1, "Descrição é obrigatória"),
  exWeight: z.string().min(1, "Peso é obrigatório"),
  testCases: z.array(testCaseSchema),
});

type CreateExerciseFormValues = z.infer<typeof createExerciseSchema>;

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
  const createExercise = useCreateExerciseMutation();
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

      onSuccess?.("Exercício criado com sucesso!");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      const message = getApiErrorMessage(error, "Erro ao criar exercício");
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
          <DialogTitle>Criar Exercício</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Defina os detalhes e casos de teste para o exercício
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
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Hello World em Java--"
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
                  <FormLabel>Descrição / Instruções</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Descreva o exercício em detalhes..."
                      className="focus:border-[#0dccf2]/50"
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
                    <FormLabel>Peso da Nota</FormLabel>
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
                    <span>Casos de Teste (Opcional)</span>
                    <span className="text-xs text-muted-foreground">
                      Expandir para configurar
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
            Cancelar
          </HeroButton>
          <HeroButton
            type="submit"
            form="create-exercise-form"
            disabled={createExercise.isPending}
            className="bg-linear-to-r from-[#0dccf2] to-[#10b981] text-slate-800 hover:opacity-90"
          >
            {createExercise.isPending ? "Criando..." : "Criar Exercício"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
