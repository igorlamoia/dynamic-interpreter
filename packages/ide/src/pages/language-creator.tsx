import localFont from "next/font/local";
import { useRouter } from "next/router";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SpaceBackground } from "@/components/space-background";
import { KeywordCustomizer } from "@/components/keyword-customizer";
import { KeywordProvider } from "@/contexts/keyword/KeywordContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguageDetail } from "@/hooks/useLanguages";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function parseLanguageId(value: string | string[] | undefined): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default function LanguageCreatorPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, isProfileLoading } = useAuth();
  const editingLanguageId = parseLanguageId(router.query.id);
  // Só faz sentido buscar a linguagem se há sessão; deslogado o wizard é local.
  const shouldLoad = isAuthenticated && editingLanguageId !== null;
  const detailQuery = useLanguageDetail(
    editingLanguageId ?? undefined,
    shouldLoad,
  );

  // O provider semeia seu estado no mount e ignora props que cheguem depois,
  // então esperamos três coisas antes de montar: a query da URL (`isReady`
  // é falso no primeiro render de página estática), a sessão (o perfil chega
  // uma requisição depois do token) e, se há `?id=N`, a própria linguagem.
  // Sem isso o wizard montaria em branco e seria remontado logo em seguida.
  const isSessionSettled = isHydrated && !isProfileLoading;
  const isWaitingForLanguage =
    !router.isReady ||
    (editingLanguageId !== null && !isSessionSettled) ||
    (shouldLoad && detailQuery.isPending);

  return (
    <div className="relative overflow-x-hidden">
      <SpaceBackground />
      <Navbar />
      <main
        className={`${geistSans.variable} ${geistMono.variable} relative z-10 min-h-screen p-6 font-(family-name:--font-geist-sans) sm:p-8`}
      >
        <section>
          {isWaitingForLanguage ? (
            <p className="py-20 text-center text-slate-400">
              Carregando...
            </p>
          ) : (
            <KeywordProvider>
              <KeywordCustomizer
                editingLanguageId={shouldLoad ? editingLanguageId : null}
                initialLanguage={detailQuery.data ?? null}
              />
            </KeywordProvider>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
