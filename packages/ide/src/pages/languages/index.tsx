import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { LanguagesView } from "@/views/languages/languages-view";

export default function LanguagesPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0A0A0F] font-sans">
      <SpaceBackground />
      <Navbar />
      <div className="relative z-10 flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex w-full flex-1 flex-col overflow-y-auto">
          <main className="mx-auto w-full max-w-7xl px-6 py-12">
            <LanguagesView />
          </main>
        </div>
      </div>
    </div>
  );
}

LanguagesPage.requireAuth = true;
