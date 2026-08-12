import Link from "next/link";
import { Logo } from "../logo";
import { HeroLink } from "../buttons/hero";
import { ChevronDown, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { t } from "@/i18n";
import { ToggleTheme } from "../toggle-theme";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useMemo, useState } from "react";
import { LanguageSelector } from "./language-selector";

interface NavbarProps {
  links?: { label: string; href: string }[];
  hasAuth?: boolean;
}

const defaultLinks: { label: string; href: string }[] = [];

export function Navbar({ links, hasAuth = true }: NavbarProps) {
  const { locale, pathname, push } = useRouter();
  const { isAuthenticated, isProfileLoading, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    logout();
    setIsMenuOpen(false);
    await push("/");
  };

  const profileName = useMemo(
    () => user?.name?.trim() || user?.email || "Usuário",
    [user?.email, user?.name],
  );
  const profileRole = useMemo(() => mapRoleLabel(user?.role), [user?.role]);
  const profileInitials = useMemo(
    () => getInitials(user?.name, user?.email),
    [user?.email, user?.name],
  );

  links =
    links && links.length > 0 ? links : isAuthenticated ? defaultLinks : [];

  return (
    <>
      <header className="w-full border-b dark:border-white/10 border-black/10 backdrop-blur-[3px] z-50">
        <div className="max-w-screen-3xl mx-auto gap-6 px-6 h-16 flex items-center justify-between">
          <Logo />
          <ul className="ml-auto">
            {links && links.length > 0 && (
              <nav className="flex items-center gap-6 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium ${
                      pathname === link.href
                        ? "text-slate-900 dark:text-slate-100 font-semibold animate-pulse"
                        : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </ul>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            {hasAuth &&
              (isAuthenticated ? (
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="group inline-flex items-center gap-3 rounded-full border border-black/10 dark:border-white/20 bg-white/80 dark:bg-white/5 px-2 py-1.5 pr-3 shadow-sm hover:shadow-md hover:border-black/20 dark:hover:border-white/30 transition-all"
                    >
                      <Avatar className="h-8 w-8 bg-linear-to-br from-[#0dccf2] to-[#34d399] text-white dark:text-white border-transparent">
                        <AvatarFallback>{profileInitials}</AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="max-w-42 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {isProfileLoading ? "Carregando..." : profileName}
                        </span>
                        <Badge
                          variant="secondary"
                          className="mt-0.5 text-[9px] px-2 py-0"
                        >
                          {profileRole}
                        </Badge>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 dark:text-slate-300 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => {
                        setIsMenuOpen(false);
                        push("/dashboard");
                      }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <HeroLink href="/login">
                  <LogIn className="w-4 h-4" />
                  {t(locale, "ui.login")}
                </HeroLink>
              ))}
          </div>
        </div>
      </header>
      <div className="fixed left-4 bottom-4 z-1000">
        <ToggleTheme />
      </div>
    </>
  );
}

function mapRoleLabel(role?: string) {
  if (role === "TEACHER" || role === "ADMIN") return "Professor";
  if (role === "COMMUNITY") return "Membro da comunidade";
  return "Aluno";
}

function getInitials(name?: string, email?: string) {
  const normalizedName = name?.trim();
  if (normalizedName) {
    const words = normalizedName.split(/\s+/).filter(Boolean);
    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("");
  }

  if (email?.trim()) {
    return email.trim().charAt(0).toUpperCase();
  }

  return "U";
}
