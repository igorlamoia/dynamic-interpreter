import { useForm } from "react-hook-form";
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

function defaultDeadline() {
  const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm for datetime-local
}

const publishSchema = z.object({
  classId: z.string().min(1, "Selecione uma turma"),
  totalGrade: z.string().min(1, "Nota total é obrigatória"),
  minRequired: z.string().min(1, "Mínimo obrigatório"),
  deadline: z.string().min(1, "Prazo é obrigatório"),
});
type PublishForm = z.infer<typeof publishSchema>;

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
  const { showToast } = useToast();
  const publishList = usePublishExerciseListMutation();
  const form = useForm<PublishForm>({
    resolver: zodResolver(publishSchema),
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
      showToast({ type: "success", message: "Lista publicada com sucesso!" });
      form.reset();
      onOpenChange(false);
      onPublished?.();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError?.response?.data?.detail;
      console.error("[publish] erro:", err);
      showToast({
        type: "error",
        message: detail ? `Erro: ${detail}` : "Erro ao publicar lista.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Publicar Lista</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure prazo e requisitos antes de publicar para a turma.
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
                  <FormLabel>Turma</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-11 bg-background/80 border border-input rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-primary/50 dark:bg-black/30 dark:border-white/10 dark:text-slate-100"
                    >
                      <option
                        value=""
                        className="bg-background text-foreground"
                      >
                        Selecione...
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
                    <FormLabel>Nota total</FormLabel>
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
                    <FormLabel>Mínimo obrigatório</FormLabel>
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
                  <FormLabel>Prazo de entrega</FormLabel>
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
            Cancelar
          </HeroButton>
          <HeroButton
            type="submit"
            form="publish-form"
            disabled={publishList.isPending}
          >
            {publishList.isPending ? "Publicando..." : "Publicar"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
