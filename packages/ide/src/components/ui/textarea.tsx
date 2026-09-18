import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        `flex w-full rounded-md border px-3 py-2 text-foreground outline-none transition-colors placeholder:text-muted-foreground
        disabled:cursor-not-allowed disabled:opacity-50 border-black/10 dark:border-white/10
        dark:focus:bg-primary/10 focus:ring-0.5 focus:ring-primary focus:border-primary focus:bg-primary/10 text-sm focus:dark:border-primary/80 dark:bg-gray-800/30
        min-h-20 resize-y  dark:text-cyan-100
        `,
        ``,
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
