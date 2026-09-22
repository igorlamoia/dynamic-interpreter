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
import { useRouter } from "next/router";
import { t } from "@/i18n";

export const createLoginSchema = (locale?: string) =>
  z.object({
    email: z.email(t(locale, "ui.login_error_invalid_email")),
    password: z
      .string()
      .min(4, t(locale, "ui.login_error_password_min")),
  });

export const loginSchema = createLoginSchema();

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
  const { locale } = useRouter();

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
              <FormLabel>{t(locale, "ui.login_email_label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t(locale, "ui.login_email_placeholder")}
                  type="email"
                  {...field}
                />
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
                  {t(locale, "ui.login_password_label")}
                </FormLabel>
                <Link
                  href="#"
                  className="text-xs text-primary hover:text-emerald-400 transition-colors"
                >
                  {t(locale, "ui.login_forgot_password")}
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
          {t(locale, "ui.login_submit")}
          <LogIn />
        </HeroButton>
      </form>
    </Form>
  );
}
