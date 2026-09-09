import { SpaceBackground } from "@/components/space-background";
import { BorderBeam } from "@/components/ui/border-beam";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/navbar";
import { Copyright } from "@/components/copyright";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useToast } from "@/contexts/ToastContext";
import {
  RegisterForm,
  registerSchema,
  type RegisterFormValues,
} from "@/components/auth/register-form";
import { SocialLogin } from "@/components/auth/social-login";
import {
  useOrganizationsQuery,
  useRegisterMutation,
} from "@/hooks/use-api-queries";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState("");
  const organizationsQuery = useOrganizationsQuery();
  const registerMutation = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      organizationId: "",
    },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    setServerError("");

    try {
      const data = await registerMutation.mutateAsync(values);
      login({ token: data.accessToken, user: data.user });
      router.push("/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Erro de rede. Tente novamente.",
      );
      setServerError(message);
      showToast({ type: "error", message });
    }
  };

  return (
    <div className="relative min-h-screen text-foreground flex flex-col overflow-hidden">
      <SpaceBackground />

      <Navbar links={[{ label: "Entrar", href: "/login" }]} hasAuth={false} />

      {/* Main Content */}
      <main className="relative font-sans z-10 grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="relative bg-card/85 dark:bg-[#182f34]/40 backdrop-blur-[3px] border border-border dark:border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
            <BorderBeam
              colorFrom="#0dccf2"
              colorTo="#34d399"
              duration={8}
              size={80}
            />

            <div className="mb-8 text-center mt-2">
              <Title>
                <GradientText>Crie sua Conta</GradientText>
              </Title>
              <p className="text-muted-foreground text-sm mt-1">
                Entre para o futuro da educação em programação.
              </p>
            </div>

            <RegisterForm
              form={form}
              onSubmit={handleRegister}
              serverError={serverError}
              organizations={organizationsQuery.data ?? []}
              loadingOrgs={organizationsQuery.isPending}
            />

            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="relative w-full flex items-center">
                <div className="grow border-t border-border dark:border-white/10"></div>
                <span className="shrink-0 mx-4 text-muted-foreground text-xs">
                  OU CONTINUE COM
                </span>
                <div className="grow border-t border-border dark:border-white/10"></div>
              </div>
              <SocialLogin fullWidth />

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-emerald-400 transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8">
            <Copyright />
          </p>
        </div>
      </main>
    </div>
  );
}
