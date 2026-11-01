import "./_theme";
import { Dock, DockIcon, buttonVariants } from "@ts-compilator-for-java/ide";
import { Info, Play, FolderTree, Search, TerminalSquare, Settings, Github, BookOpen } from "lucide-react";

const iconBtn = buttonVariants({ variant: "ghost", size: "icon" }) + " size-12 rounded-full cursor-pointer";

const tools = [
  { label: "Executar", icon: Play },
  { label: "Explorador", icon: FolderTree },
  { label: "Buscar", icon: Search },
  { label: "Terminal", icon: TerminalSquare },
  { label: "Configurações", icon: Settings },
];

export const FooterDock = () => (
  <div className="flex justify-center p-6 pb-10">
    <Dock
      direction="middle"
      className="border-neutral-200 bg-white/90 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/30"
    >
      <DockIcon>
        <a href="#sobre" aria-label="Sobre" className={iconBtn + " bg-white/10 text-white"}>
          <Info className="size-5" />
        </a>
      </DockIcon>
      <DockIcon>
        <a href="#docs" aria-label="Documentação" className={iconBtn}>
          <BookOpen className="size-4" />
        </a>
      </DockIcon>
      <DockIcon>
        <a href="#github" aria-label="GitHub" className={iconBtn}>
          <Github className="size-4" />
        </a>
      </DockIcon>
    </Dock>
  </div>
);

export const IdeTools = () => (
  <div className="flex justify-center p-6 pb-10">
    <Dock className="border-border bg-card/40">
      {tools.map(({ label, icon: Icon }) => (
        <DockIcon key={label}>
          <button type="button" aria-label={label} className={iconBtn}>
            <Icon className="size-5" />
          </button>
        </DockIcon>
      ))}
    </Dock>
  </div>
);

export const LargeNoMagnification = () => (
  <div className="flex justify-center p-6 pb-10">
    <Dock iconSize={48} disableMagnification direction="bottom" className="h-16 border-border bg-card/40">
      {tools.slice(0, 4).map(({ label, icon: Icon }) => (
        <DockIcon key={label} aria-label={label} className="text-foreground">
          <Icon className="size-6" />
        </DockIcon>
      ))}
    </Dock>
  </div>
);
