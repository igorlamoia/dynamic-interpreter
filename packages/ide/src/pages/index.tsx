import localFont from "next/font/local";
import { Footer } from "@/components/footer";
import { SpaceBackground } from "@/components/space-background";
import { HomeHero } from "@/components/heros/home";
import { Navbar } from "@/components/navbar";
import { IDEView } from "@/views/ide";

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
  return (
    <div className="relative overflow-hidden">
      <SpaceBackground />
      <Navbar />
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
      <Footer />
    </div>
  );
}
