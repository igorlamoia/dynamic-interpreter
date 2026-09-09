import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

interface HeroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "outline" | "ghost";
}

export function HeroButton(props: HeroButtonProps) {
  const {
    children,
    disabled,
    isLoading = false,
    variant = "primary",
    ...rest
  } = props;
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...rest}
      aria-busy={isLoading || undefined}
      disabled={isDisabled}
      className={cn(
        "group inline-flex items-center justify-center gap-2 px-5 py-2.5 text-slate-800 font-bold text-sm rounded-md  transition-all duration-300 transform active:scale-[0.97]  hover:scale-[1.02] cursor-pointer",
        variant === "primary" &&
          "bg-linear-to-r from-primary to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 shadow-[0_0_15px_rgba(13,204,242,0.25)] hover:shadow-[0_0_25px_rgba(13,204,242,0.45)]",
        variant === "outline" &&
          "border border-slate-700/20 dark:border-white/10 hover:border-primary/50 hover:bg-primary/5 dark:text-slate-300 hover:text-primary",
        variant === "ghost" &&
          "hover:bg-primary/5 dark:hover:bg-primary/5 text-slate-800 dark:text-slate-300 hover:text-primary",
        props.className,
        isLoading &&
          "pointer-events-none cursor-wait text-slate-950 shadow-[0_0_18px_rgba(13,204,242,0.38)] hover:scale-100 hover:from-primary hover:to-emerald-400 hover:shadow-[0_0_18px_rgba(13,204,242,0.38)]",
        disabled &&
          !isLoading &&
          "opacity-50 cursor-not-allowed hover:from-primary hover:to-emerald-300 hover:shadow-none hover:border-slate-700/20 hover:bg-transparent hover:text-slate-800 dark:hover:dark:border-white/10 dark:hover:bg-transparent dark:hover:text-slate-300",
      )}
    >
      {isLoading && (
        <LoaderCircle
          aria-hidden="true"
          className="size-4 animate-spin"
          data-slot="hero-button-spinner"
        />
      )}
      {children}
    </button>
  );
}
interface HeroLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  href: string;
}

export function HeroLink(props: HeroLinkProps) {
  const { children, variant = "primary", ...rest } = props;

  return (
    <Link
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-slate-800 font-bold text-sm rounded-md  transition-all duration-300 transform active:scale-[0.97] hover:scale-[1.02]  cursor-pointer",
        variant === "primary" &&
          "bg-linear-to-r from-primary to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 shadow-[0_0_15px_rgba(13,204,242,0.25)] hover:shadow-[0_0_25px_rgba(13,204,242,0.45)]",
        variant === "outline" &&
          "border border-slate-700/20 dark:border-white/10 hover:border-primary/50 hover:bg-primary/5 text-slate-800 dark:text-slate-300 hover:text-primary",
        props.className,
      )}
    >
      {children}
    </Link>
  );
}
