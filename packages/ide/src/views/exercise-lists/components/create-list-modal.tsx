import { useForm } from "react-hook-form";
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
    if (values.languagePolicy === "LOCKED" && values.lockedLanguageId === null) {
      form.setError("lockedLanguageId", {
        type: "manual",
        message: "Escolha uma linguagem",
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
      showToast({ type: "success", message: "Lista criada com sucesso!" });
      form.reset();
      onOpenChange(false);
      onCreated?.();
    } catch {
      showToast({ type: "error", message: "Erro ao criar lista." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Nova Lista de Exercícios</DialogTitle>
          <DialogDescription className="text-slate-400">
            Crie uma lista para organizar seus exercícios e publicar para turmas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-list-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-1"
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
                      placeholder="Ex: Algoritmos de Ordenação"
                      className="h-11 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
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
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Descreva o objetivo desta lista..."
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
                    <LanguagePolicyField
                      value={{
                        policy: field.value,
                        lockedLanguageId: form.watch("lockedLanguageId"),
                      }}
                      onChange={(next) => {
                        field.onChange(next.policy);
                        form.setValue("lockedLanguageId", next.lockedLanguageId);
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
            form="create-list-form"
            disabled={createList.isPending}
          >
            {createList.isPending ? "Criando..." : "Criar Lista"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
