import localFont from "next/font/local";
import type { Language } from "@/lib/languages-api";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SpaceBackground } from "@/components/space-background";
import { KeywordCustomizer } from "@/components/keyword-customizer";
import { KeywordProvider } from "@/contexts/keyword/KeywordContext";
export { getServerSideProps } from "@/features/language-creator/server-props";


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

export default function LanguageCreatorPage({
  editingLanguageId,
  initialLanguage,
}: {
  editingLanguageId: number | null;
  initialLanguage: Language | null;
}) {
  return (
    <div className="relative overflow-x-hidden">
      <SpaceBackground />
      <Navbar />
      <main
        className={`${geistSans.variable} ${geistMono.variable} relative z-10 min-h-screen p-6 font-(family-name:--font-geist-sans) sm:p-8`}
      >
        <section>
          <KeywordProvider key={editingLanguageId ?? "new"}>
            <KeywordCustomizer
              editingLanguageId={editingLanguageId}
              initialLanguage={initialLanguage}
            />
          </KeywordProvider>
        </section>
      </main>
      <Footer />
    </div>
  );
}
