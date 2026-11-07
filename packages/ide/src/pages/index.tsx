import localFont from "next/font/local";
import { SpaceBackground } from "@/components/space-background";
import { HomeHero } from "@/components/heros/home";
import { Navbar } from "@/components/navbar";
import { IDEView } from "@/views/ide";
import { useRouter } from "next/router";
import { t } from "@/i18n";
import { LogIn } from "lucide-react";

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

export default function Home() {
  const { locale } = useRouter();
  return (
    <div className="relative overflow-hidden">
      <SpaceBackground />
      <Navbar
        links={[
          {
            label: t(locale, "ui.login"),
            href: "/login",
            icon: LogIn,
            removeAuthenticated: true,
          },
        ]}
        hasAuth={true}
      />
      <main
        className={`${geistSans.variable} ${geistMono.variable}
            min-h-screen p-6 gap-2 sm:p-8 font-(family-name:--font-geist-sans)
            z-100 relative
            `}
      >
        <section className="flex flex-col gap-6 pb-20 max-w-screen-3xl m-auto z-10">
          <HomeHero />
          <IDEView />
        </section>
      </main>
    </div>
  );
}
