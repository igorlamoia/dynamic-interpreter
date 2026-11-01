import "./_theme";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "@ts-compilator-for-java/ide";

type ClassValues = { name: string; description: string };

const CreateClassForm = ({ withErrors = false }: { withErrors?: boolean }) => {
  const form = useForm<ClassValues>({
    defaultValues: withErrors
      ? { name: "", description: "" }
      : { name: "Algoritmos I — 2026.2", description: "Turma noturna de introdução à programação." },
  });

  useEffect(() => {
    if (withErrors) {
      form.setError("name", { message: "Informe o nome da turma." });
      form.setError("description", { message: "A descrição deve ter ao menos 10 caracteres." });
    }
  }, [withErrors, form]);

  return (
    <Form {...form}>
      <form className="w-full max-w-lg space-y-4 p-6 font-sans" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da turma</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex.: Algoritmos I" className="h-12" />
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
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} placeholder="Conte aos alunos sobre a turma" />
              </FormControl>
              <FormDescription>Visível para os alunos ao entrar na turma.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit">Criar turma</Button>
        </div>
      </form>
    </Form>
  );
};

export const CreateClass = () => <CreateClassForm />;

export const ValidationErrors = () => <CreateClassForm withErrors />;
