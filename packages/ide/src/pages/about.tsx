import Head from "next/head";
import Image from "next/image";
import {
  BookOpen,
  Code2,
  GraduationCap,
  Microscope,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";

import { Footer } from "@/components/footer";
import { t } from "@/i18n";
import { Navbar } from "@/components/navbar";
import { SpaceBackground } from "@/components/space-background";

const highlights = [
  {
    icon: Code2,
    titleKey: "ui.about_highlight_ide_title",
    descriptionKey: "ui.about_highlight_ide_description",
  },
  {
    icon: SlidersHorizontal,
    titleKey: "ui.about_highlight_languages_title",
    descriptionKey: "ui.about_highlight_languages_description",
  },
  {
    icon: Users,
    titleKey: "ui.about_highlight_flows_title",
    descriptionKey: "ui.about_highlight_flows_description",
  },
  {
    icon: Microscope,
    titleKey: "ui.about_highlight_checks_title",
    descriptionKey: "ui.about_highlight_checks_description",
  },
];

const gallery = [
  {
    src: "/readme/v1.5IDE.png",
    altKey: "ui.about_gallery_ide_alt",
    titleKey: "ui.about_gallery_ide_title",
    descriptionKey: "ui.about_gallery_ide_description",
  },
  {
    src: "/readme/tokens.png",
    altKey: "ui.about_gallery_tokens_alt",
    titleKey: "ui.about_gallery_tokens_title",
    descriptionKey: "ui.about_gallery_tokens_description",
  },
  {
    src: "/readme/creating-language.png",
    altKey: "ui.about_gallery_language_alt",
    titleKey: "ui.about_gallery_language_title",
    descriptionKey: "ui.about_gallery_language_description",
  },
  {
    src: "/readme/professor-panel.png",
    altKey: "ui.about_gallery_teacher_alt",
    titleKey: "ui.about_gallery_teacher_title",
    descriptionKey: "ui.about_gallery_teacher_description",
  },
  {
    src: "/readme/doing-exercise.png",
    altKey: "ui.about_gallery_exercise_alt",
    titleKey: "ui.about_gallery_exercise_title",
    descriptionKey: "ui.about_gallery_exercise_description",
  },
];

export default function AboutPage() {
  const { locale } = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Head>
        <title>{t(locale, "ui.about_meta_title")}</title>
        <meta
          name="description"
          content={t(locale, "ui.about_meta_description")}
        />
      </Head>
      <SpaceBackground />
      <Navbar />

      <main className="relative z-10 pb-28">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-screen-2xl flex-col justify-center gap-10 px-6 py-14 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                <GraduationCap className="h-4 w-4" />
                {t(locale, "ui.about_badge")}
              </p>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                {t(locale, "ui.about_title")}
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-700 dark:text-slate-300">
                {t(locale, "ui.about_intro")}
              </p>
              <div className="mt-8 grid gap-3 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                <div className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                  <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    {t(locale, "ui.about_authors_label")}
                  </span>
                  <span className="mt-1 block text-base font-semibold text-slate-950 dark:text-white">
                    {t(locale, "ui.about_authors_value")}
                  </span>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                  <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    {t(locale, "ui.about_area_label")}
                  </span>
                  <span className="mt-1 block text-base font-semibold text-slate-950 dark:text-white">
                    {t(locale, "ui.about_area_value")}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-black/10 bg-white/80 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/10">
              <Image
                src="/readme/v1.5IDE.png"
                alt={t(locale, "ui.about_gallery_ide_alt")}
                width={1200}
                height={720}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-black/10 bg-white/80 py-16 backdrop-blur dark:border-white/10 dark:bg-black/20">
          <div className="mx-auto grid max-w-screen-2xl gap-6 px-6 lg:grid-cols-4 lg:px-10">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.titleKey}
                  className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10"
                >
                  <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                  <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
                    {t(locale, item.titleKey)}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {t(locale, item.descriptionKey)}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl px-6 py-16 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                <BookOpen className="h-4 w-4" />
                {t(locale, "ui.about_tcc_badge")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
                {t(locale, "ui.about_tcc_title")}
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-slate-700 dark:text-slate-300">
              <p>{t(locale, "ui.about_tcc_paragraph_1")}</p>
              <p>{t(locale, "ui.about_tcc_paragraph_2")}</p>
              <p>{t(locale, "ui.about_tcc_paragraph_3")}</p>
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 bg-slate-950 py-16 text-white dark:border-white/10">
          <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-emerald-300">
                {t(locale, "ui.about_gallery_badge")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                {t(locale, "ui.about_gallery_title")}
              </h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {gallery.map((item) => (
                <article
                  key={item.src}
                  className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={item.src}
                      alt={t(locale, item.altKey)}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">
                      {t(locale, item.titleKey)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {t(locale, item.descriptionKey)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
