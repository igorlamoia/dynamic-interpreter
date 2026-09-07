"use client";

import { useEffect } from "react";
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

const joinClassSchema = z.object({
  joinCode: z
    .string()
    .min(1, "Código de acesso é obrigatório")
    .max(6, "Código deve ter no máximo 6 caracteres"),
});

type JoinClassFormValues = z.infer<typeof joinClassSchema>;

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
  const joinClass = useJoinClassMutation();
  const { showToast } = useToast();
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

      onSuccess?.("Você entrou na turma!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const message = getApiErrorMessage(error, "Código inválido");
      showToast({ type: "error", message });
      onError?.(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover text-popover-foreground dark:bg-[#182f34] dark:border-white/10 dark:text-white">
        <DialogHeader className="flex flex-col">
          <DialogTitle>Entrar em Turma</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Digite o código de acesso fornecido por seu professor
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
                  <FormLabel>Código de Acesso</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) =>
                        field.onChange(event.target.value.toUpperCase())
                      }
                      maxLength={6}
                      placeholder="EX: A3F9K2"
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
            Cancelar
          </HeroButton>
          <HeroButton
            type="submit"
            form="join-class-form"
            disabled={joinClass.isPending}
            className="bg-linear-to-r from-[#0dccf2] to-[#10b981] text-slate-800 hover:opacity-90"
          >
            {joinClass.isPending ? "Entrando..." : "Entrar"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
