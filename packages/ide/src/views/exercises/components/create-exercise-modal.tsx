import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/contexts/ToastContext";
import { useCreateExerciseMutation } from "@/hooks/use-api-queries";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeroButton } from "@/components/buttons/hero";
import { TestCaseFields } from "./test-case-fields";

const testCaseSchema = z.object({
  label: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
});

const createExerciseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  languagePolicy: z.enum(["OPEN", "LOCKED"]),
  lockedLanguageId: z.number().int().positive().nullable(),
  testCases: z.array(testCaseSchema),
});

type CreateExerciseForm = z.infer<typeof createExerciseSchema>;

const defaultTestCases = [
  { label: "", input: "", expectedOutput: "" },
  { label: "", input: "", expectedOutput: "" },
  { label: "", input: "", expectedOutput: "" },
];

export function CreateExerciseModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
}) {
  const { showToast } = useToast();
  const createExercise = useCreateExerciseMutation();
  const languagesQuery = useLanguagesList(open);
  const form = useForm<CreateExerciseForm>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      title: "",
      description: "",
      languagePolicy: "OPEN",
      lockedLanguageId: null,
      testCases: defaultTestCases,
    },
  });
  const languagePolicy = form.watch("languagePolicy");

  const { fields } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  useEffect(() => {
    if (!open)
      form.reset({
        title: "",
        description: "",
        languagePolicy: "OPEN",
        lockedLanguageId: null,
        testCases: defaultTestCases,
      });
  }, [open, form]);

  const onSubmit = async (values: CreateExerciseForm) => {
    if (values.languagePolicy === "LOCKED" && values.lockedLanguageId === null) {
      form.setError("lockedLanguageId", {
        type: "manual",
        message: "Selecione uma linguagem para travar o exercício",
      });
      return;
    }
    try {
      await createExercise.mutateAsync({
        title: values.title,
        description: values.description,
        languagePolicy: values.languagePolicy,
        lockedLanguageId:
          values.languagePolicy === "LOCKED" ? values.lockedLanguageId : null,
        testCases: values.testCases.filter(
          (tc) => tc.input.trim() || tc.expectedOutput.trim(),
        ),
      });
      showToast({ type: "success", message: "Exercício criado!" });
      form.reset();
      onOpenChange(false);
      onCreated?.();
    } catch {
      showToast({ type: "error", message: "Erro ao criar exercício." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Novo Exercício</DialogTitle>
          <DialogDescription className="text-slate-400">
            Defina o enunciado e casos de teste para validação automática.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-exercise-page-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex-1 overflow-y-auto max-h-[calc(90vh-180px)] p-6 font-sans"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Hello World em Java"
                      className="h-12 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
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
                  <FormLabel>Descrição / Enunciado</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Descreva o exercício em detalhes..."
                      className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
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
                  <FormLabel>Linguagem permitida</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={field.value === "OPEN"}
                          onChange={() => {
                            field.onChange("OPEN");
                            form.setValue("lockedLanguageId", null);
                          }}
                        />
                        Aberto (aluno usa sua linguagem)
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={field.value === "LOCKED"}
                          onChange={() => field.onChange("LOCKED")}
                        />
                        Travado em uma linguagem
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {languagePolicy === "LOCKED" && (
              <FormField
                control={form.control}
                name="lockedLanguageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linguagem</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-slate-100"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      >
                        <option value="">— selecione —</option>
                        {(languagesQuery.data ?? []).map((lang) => (
                          <option key={lang.id} value={lang.id}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="test-cases">
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between pr-2">
                    <span>Casos de Teste</span>
                    <span className="text-xs text-slate-500">
                      {fields.length} casos
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
        <DialogFooter className="bg-white/5 border-t border-white/10">
          <HeroButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          >
            Cancelar
          </HeroButton>
          <HeroButton
            type="submit"
            form="create-exercise-page-form"
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
