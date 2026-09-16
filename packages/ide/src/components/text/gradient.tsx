import { cn } from "@/lib/utils";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function GradientText(props: GradientTextProps) {
  const { className = "", children, ...rest } = props;
  return (
    <span
      className={cn(
        "bg-linear-to-r from-primary to-[#10b981] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(13,204,242,0.3)]",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
