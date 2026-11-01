import "./_theme";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ts-compilator-for-java/ide";
import { FileCode2, Play, Save } from "lucide-react";

export const RunShortcut = () => (
  <TooltipProvider>
    <div className="flex items-center justify-center gap-3 p-24">
      <Button variant="ghost" size="icon" aria-label="Salvar arquivo">
        <Save />
      </Button>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button size="icon" aria-label="Compilar e executar">
            <Play />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Compilar e executar (Ctrl+Enter)</p>
        </TooltipContent>
      </Tooltip>
      <Button variant="ghost" size="icon" aria-label="Ver código intermediário">
        <FileCode2 />
      </Button>
    </div>
  </TooltipProvider>
);

export const SideRight = () => (
  <TooltipProvider>
    <div className="flex items-center p-24">
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled
            className="flex h-8 w-8 items-center justify-center rounded-full border bg-black/25 text-white/90 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10"
            aria-label="Selecionar linguagem"
          >
            <FileCode2 className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Linguagem bloqueada pelo exercício
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);
