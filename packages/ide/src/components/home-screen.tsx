import { FileCode2, FolderOpen, Book, Rocket } from "lucide-react";
import { PerfectScrollbar } from "./ui/perfect-scrollbar";

export function HomeScreen() {
  return (
    <PerfectScrollbar className="flex h-full w-full items-center justify-center overflow-y-auto py-8">
      <div className="flex flex-col items-center gap-8 px-8 text-center max-h-full">
        {/* Logo/Icon */}
        {/* Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/20 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30">
            <FileCode2 className="h-12 w-12 text-cyan-400" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            TypeScript Compiler for Java--
          </h1>
          <p className="text-sm text-muted-foreground">
            Compilador e IDE para a linguagem Java--
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 w-full max-w-3xl mt-4">
          <button
            type="button"
            className="group flex flex-col items-center gap-3 rounded-lg border dark:border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-cyan-500/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                Explorar Arquivos
              </h3>
              <p className="text-xs text-muted-foreground">
                Navegue pelos arquivos do projeto
              </p>
            </div>
          </button>

          <button
            type="button"
            className="group flex flex-col items-center gap-3 rounded-lg border dark:border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-emerald-500/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
              <FileCode2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                Novo Arquivo
              </h3>
              <p className="text-xs text-muted-foreground">
                Crie um novo arquivo Java--
              </p>
            </div>
          </button>

          <button
            type="button"
            className="group flex flex-col items-center gap-3 rounded-lg border dark:border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-purple-500/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500/20">
              <Book className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                Documentação
              </h3>
              <p className="text-xs text-muted-foreground">
                Aprenda sobre a sintaxe
              </p>
            </div>
          </button>
        </div>

        {/* Getting Started */}
        <div className="mt-8 rounded-lg border dark:border-white/10 bg-white/5 p-6 max-w-3xl">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Rocket className="h-5 w-5 text-blue-400" />
            </div>
            <div className="space-y-2 text-left">
              <h3 className="text-sm font-semibold text-foreground">Começar</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Abra um arquivo do explorador ao lado ou crie um novo arquivo
                para começar a programar em Java--. Todo programa deve ter uma
                função{" "}
                <code className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-400">
                  main()
                </code>{" "}
                como ponto de entrada.
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="rounded border dark:border-white/10 bg-white/5 px-2 py-1 font-mono">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="rounded border dark:border-white/10 bg-white/5 px-2 py-1 font-mono">
              S
            </kbd>
            <span>Salvar</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="rounded border dark:border-white/10 bg-white/5 px-2 py-1 font-mono">
              F5
            </kbd>
            <span>Executar</span>
          </div>
        </div>
      </div>
    </PerfectScrollbar>
  );
}
