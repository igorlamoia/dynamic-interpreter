import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        `flex sm:text-sm focus:outline-none p-4 h-11 w-full rounded-md border
        bg-white/5 dark:bg-gray-800/50 text-foreground outline-none
        transition-colors placeholder:text-muted-foreground
        focus:ring-0.5 focus:ring-0.5 focus:ring-primary border-black/10 dark:border-white/10 focus:border-primary
        dark:focus:bg-primary/10  focus:bg-primary/10 text-sm focus:dark:border-primary/80
        disabled:cursor-not-allowed disabled:opacity-50
        `,
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
