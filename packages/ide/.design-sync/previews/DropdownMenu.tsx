import "./_theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ts-compilator-for-java/ide";
import { Check, ChevronDown, LogOut, Settings, User } from "lucide-react";

const classes = [
  { id: 1, name: "Compiladores — Turma A" },
  { id: 2, name: "Compiladores — Turma B" },
  { id: 3, name: "Linguagens Formais e Autômatos" },
  { id: 4, name: "Algoritmos I — Noturno" },
];

export const ClassSelect = () => (
  <div className="flex justify-center p-10">
    <div className="w-72">
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            role="combobox"
            className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-input bg-background/80 px-3 text-left text-sm text-foreground shadow-sm transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-white/10 dark:bg-black/30 dark:text-slate-100"
          >
            <span className="truncate font-medium">{classes[0].name}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)]"
        >
          {classes.map((classOption) => (
            <DropdownMenuItem key={classOption.id} className="justify-between">
              <span className="truncate">{classOption.name}</span>
              {classOption.id === 1 && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

export const UserMenu = () => (
  <div className="flex justify-end p-10">
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-1.5 text-sm text-slate-500 transition-all hover:bg-black/5 dark:border-white/20 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <User className="h-4 w-4" />
          Profa. Helena Costa
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <User className="h-4 w-4" /> Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="h-4 w-4" /> Personalizar palavras-chave
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Painel do administrador</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500 dark:text-red-400">
          <LogOut className="h-4 w-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
