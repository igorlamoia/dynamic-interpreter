import { useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, Code2, Dna, Languages, Plus, Sparkles } from "lucide-react";
import { HeroButton } from "@/components/buttons/hero";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveLanguage, useLanguagesList } from "@/hooks/useLanguages";
import { getLanguageDNAChips } from "@/views/languages/language-dna";
import { LanguageDnaDialog } from "@/views/languages/components/language-dna-dialog";

export function CommunityDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const languagesQuery = useLanguagesList();
  const activeLanguageQuery = useActiveLanguage();
  const [dnaLanguage, setDnaLanguage] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const languages = languagesQuery.data ?? [];
  const recentLanguages = languages.slice(0, 3);
  const firstName = user?.name.trim().split(/\s+/)[0] || "criador";

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-300/12 bg-[#101522]/80 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-16 h-px w-1/2 bg-linear-to-r from-transparent via-cyan-300/50 to-transparent" />
        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
            <Sparkles className="size-3.5" />
            Laboratório de linguagens
          </div>
          <Title>
            Olá, <GradientText>{firstName}</GradientText>
          </Title>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Modele a sintaxe, escolha as regras e construa linguagens com uma
            identidade própria. Cada decisão passa a fazer parte do DNA da sua
            criação.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <HeroButton
              onClick={() => void router.push("/language-creator")}
              className="group gap-2 px-5 py-3"
            >
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              Nova Linguagem
            </HeroButton>
            <button
              type="button"
              onClick={() => void router.push("/languages")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/8"
            >
              Ver meu acervo
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="mb-9 grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Languages}
          label="Linguagens criadas"
          value={languagesQuery.isPending ? "—" : String(languages.length)}
        />
        <MetricCard
          icon={Code2}
          label="Linguagem ativa"
          value={activeLanguageQuery.isPending
            ? "Carregando"
            : activeLanguageQuery.data?.name || "Nenhuma"}
        />
        <MetricCard
          icon={Dna}
          label="DNA disponível"
          value={languages.length > 0 ? "Completo" : "Ao criar"}
        />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Criações recentes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Uma leitura rápida das regras que tornam cada linguagem única.
            </p>
          </div>
          {languages.length > 3 && (
            <button
              type="button"
              onClick={() => void router.push("/languages")}
              className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Ver todas
            </button>
          )}
        </div>

        {languagesQuery.isPending ? (
          <div className="grid gap-4 md:grid-cols-3" aria-label="Carregando linguagens">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : recentLanguages.length === 0 ? (
          <button
            type="button"
            onClick={() => void router.push("/language-creator")}
            className="group flex min-h-52 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-300/15 bg-cyan-300/3 p-8 text-center transition hover:border-cyan-300/35 hover:bg-cyan-300/6"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 transition-transform group-hover:-translate-y-1">
              <Plus className="size-6" />
            </div>
            <span className="font-bold text-white">Crie sua primeira linguagem</span>
            <span className="mt-2 max-w-md text-sm text-slate-500">
              Comece por um estilo pronto ou defina cada detalhe da gramática.
            </span>
          </button>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recentLanguages.map((language) => (
              <article
                key={language.id}
                className="flex min-h-48 flex-col rounded-2xl border border-white/7 bg-white/4 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/15 hover:bg-white/6"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={language.imageUrl || "/images/language-default.png"}
                    alt=""
                    className="size-11 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-white">{language.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {language.description || "Linguagem personalizada"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {getLanguageDNAChips(language.dna).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-cyan-300/12 bg-cyan-300/5 px-2 py-1 text-[10px] font-medium text-cyan-100/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setDnaLanguage({ id: language.id, name: language.name })}
                  className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-bold text-cyan-300 hover:text-cyan-200"
                >
                  <Dna className="size-4" />
                  Explorar DNA
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <LanguageDnaDialog
        languageId={dnaLanguage?.id}
        languageName={dnaLanguage?.name ?? ""}
        open={dnaLanguage !== null}
        onOpenChange={(open) => {
          if (!open) setDnaLanguage(null);
        }}
      />
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Languages;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-white/7 bg-white/4 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-cyan-200">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-bold text-slate-100">{value}</p>
        </div>
      </div>
    </article>
  );
}
