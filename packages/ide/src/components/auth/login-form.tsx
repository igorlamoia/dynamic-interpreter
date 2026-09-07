import Link from "next/link";
import { LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HeroButton } from "@/components/buttons/hero";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(4, "Senha deve ter pelo menos 4 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  form,
  onSubmit,
  serverError,
}: {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  serverError: string;
}) {
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {serverError && (
          <div className="text-red-400 text-sm text-center">{serverError}</div>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel>Endereço de E-mail</FormLabel>
              <FormControl>
                <Input placeholder="nome@empresa.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="text-left">
              <div className="flex justify-between items-center ml-1">
                <FormLabel className="text-xs font-semibold uppercase tracking-wider">
                  Senha
                </FormLabel>
                <Link
                  href="#"
                  className="text-xs text-primary hover:text-emerald-400 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <HeroButton
          type="submit"
          className="py-3"
          isLoading={form.formState.isSubmitting}
        >
          Entrar no Painel
          <LogIn />
        </HeroButton>
      </form>
    </Form>
  );
}
