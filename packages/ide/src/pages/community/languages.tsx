import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SpaceBackground } from "@/components/space-background";
import { CommunityLanguagesView } from "@/views/community/community-languages-view";

export default function CommunityLanguagesPage() {
  return (
    <div className="flex min-h-full flex-col bg-background font-sans text-foreground">
      <SpaceBackground />
      <Navbar />
      <div className="relative z-10 flex flex-1">
        <Sidebar />
        <div className="flex w-full flex-1 flex-col">
          <main className="mx-auto w-full max-w-7xl px-6 py-12">
            <CommunityLanguagesView />
          </main>
        </div>
      </div>
    </div>
  );
}

CommunityLanguagesPage.requireAuth = true;
