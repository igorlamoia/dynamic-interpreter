import "./_theme";
import { Avatar, AvatarFallback, Badge } from "@ts-compilator-for-java/ide";
import { ChevronDown } from "lucide-react";

export const Default = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Avatar>
      <AvatarFallback>MS</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>JP</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Avatar className="h-6 w-6">
      <AvatarFallback className="text-[9px]">RC</AvatarFallback>
    </Avatar>
    <Avatar className="h-8 w-8">
      <AvatarFallback>RC</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>RC</AvatarFallback>
    </Avatar>
    <Avatar className="h-12 w-12">
      <AvatarFallback className="text-sm">RC</AvatarFallback>
    </Avatar>
  </div>
);

export const ProfileButton = () => (
  <div className="flex items-center p-6">
    <button
      type="button"
      className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-2 py-1.5 pr-3 shadow-sm transition-all"
    >
      <Avatar className="h-8 w-8 border-transparent bg-linear-to-br from-primary to-[#34d399] text-white dark:text-white">
        <AvatarFallback>MS</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <span className="max-w-42 truncate text-xs font-semibold text-slate-100">
          Maria Souza
        </span>
        <Badge variant="secondary" className="mt-0.5 px-2 py-0 text-[9px]">
          Professora
        </Badge>
      </div>
      <ChevronDown className="h-4 w-4 text-slate-300" />
    </button>
  </div>
);

export const Group = () => (
  <div className="flex items-center gap-3 p-6">
    <div className="flex">
      {["AB", "CD", "EF", "GH"].map((initials, i) => (
        <Avatar
          key={initials}
          className={i > 0 ? "-ml-1 h-8 w-8 ring-2 ring-background" : "h-8 w-8 ring-2 ring-background"}
        >
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
    <span className="text-xs text-muted-foreground">+28 alunos na turma</span>
  </div>
);
