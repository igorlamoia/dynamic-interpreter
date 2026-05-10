import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export interface InputWithActionsProps extends React.InputHTMLAttributes<HTMLInputElement> {
  actions?: React.ReactNode;
}

const InputWithActions = React.forwardRef<
  HTMLInputElement,
  InputWithActionsProps
>(({ className, actions, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <input
        className={cn(
          "flex h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-white/30 focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
          actions && "pr-20",
          className,
        )}
        ref={ref}
        {...props}
      />
      {actions && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {actions}
        </div>
      )}
    </div>
  );
});
InputWithActions.displayName = "InputWithActions";

export interface InputActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  active?: boolean;
  tooltip?: string;
}

const InputActionButton = React.forwardRef<
  HTMLButtonElement,
  InputActionButtonProps
>(({ icon: Icon, active, tooltip, className, ...props }, ref) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={ref}
            type="button"
            className={cn(
              "rounded p-1 w-full text-xs transition-colors cursor-pointer",
              active
                ? "bg-white/20 text-foreground"
                : "text-muted-foreground hover:bg-white/10",
              props.disabled && "opacity-30 cursor-not-allowed",
              className,
            )}
            {...props}
          >
            <Icon className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
});
InputActionButton.displayName = "InputActionButton";

export { InputWithActions, InputActionButton };
