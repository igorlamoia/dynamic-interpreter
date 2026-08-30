import { useEffect, useState } from "react";
import {
  AnimatePresence,
  HTMLMotionProps,
  motion,
  useMotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";

type PointerVariant =
  | "auto"
  | "default"
  | "pointer"
  | "text"
  | "grab"
  | "grabbing"
  | "not-allowed"
  | "move"
  | "col-resize";

type PointerProps = HTMLMotionProps<"div"> & {
  variant?: PointerVariant;
};

const POINTER_VARIANTS = new Set<Exclude<PointerVariant, "auto">>([
  "default",
  "pointer",
  "text",
  "grab",
  "grabbing",
  "not-allowed",
  "move",
  "col-resize",
]);

function resolveCursorVariant(cursor: string): Exclude<PointerVariant, "auto"> {
  if (cursor.includes("col-resize")) return "col-resize";
  if (cursor.includes("grabbing")) return "grabbing";
  if (cursor.includes("grab")) return "grab";
  if (cursor.includes("text")) return "text";
  if (cursor.includes("not-allowed")) return "not-allowed";
  if (cursor.includes("move")) return "move";
  if (cursor.includes("pointer")) return "pointer";
  return "default";
}

function getClassNameValue(element: Element): string {
  if (element instanceof HTMLElement) {
    return element.className;
  }

  if (element instanceof SVGElement) {
    return element.className.baseVal || element.getAttribute("class") || "";
  }

  return element.getAttribute("class") ?? "";
}

function isElementDisabled(element: Element): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  return (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true"
  );
}

function hasCursorClass(element: Element, cursorClass: string): boolean {
  const tokens = getClassNameValue(element).split(/\s+/).filter(Boolean);
  const disabled = isElementDisabled(element);

  for (const token of tokens) {
    const segments = token.split(":");
    const baseClass = segments[segments.length - 1];

    if (baseClass !== cursorClass) {
      continue;
    }

    if (segments.length === 1) {
      return true;
    }

    const variants = segments.slice(0, -1);
    const onlyDisabledVariant = variants.every(
      (variant) => variant === "disabled",
    );

    if (onlyDisabledVariant && disabled) {
      return true;
    }
  }

  return false;
}

function resolveVariantFromElement(
  element: Element | null,
): Exclude<PointerVariant, "auto"> {
  let current: Element | null = element;

  while (current) {
    const classNames = getClassNameValue(current);

    if (
      classNames.includes("glyph-margin") ||
      classNames.includes("line-numbers") ||
      classNames.includes("margin-view-overlays")
    ) {
      return "pointer";
    }

    if (
      classNames.includes("monaco-mouse-cursor-text") ||
      classNames.includes("view-line") ||
      classNames.includes("view-lines") ||
      classNames.includes("lines-content")
    ) {
      return "text";
    }

    if (current instanceof HTMLElement) {
      const variantAttr = current.dataset.pointerVariant;
      if (
        variantAttr &&
        POINTER_VARIANTS.has(variantAttr as Exclude<PointerVariant, "auto">)
      ) {
        return variantAttr as Exclude<PointerVariant, "auto">;
      }

      const isDisabled =
        current.hasAttribute("disabled") ||
        current.getAttribute("aria-disabled") === "true";
      if (isDisabled) {
        return "not-allowed";
      }
    }

    if (hasCursorClass(current, "cursor-grabbing")) return "grabbing";
    if (hasCursorClass(current, "cursor-grab")) return "grab";
    if (hasCursorClass(current, "cursor-text")) return "text";
    if (hasCursorClass(current, "cursor-not-allowed")) return "not-allowed";
    if (hasCursorClass(current, "cursor-col-resize")) return "col-resize";
    if (hasCursorClass(current, "cursor-move")) return "move";
    if (hasCursorClass(current, "cursor-pointer")) return "pointer";

    if (current instanceof HTMLElement) {
      const inlineCursor = current.style.cursor;
      if (inlineCursor && inlineCursor !== "none") {
        return resolveCursorVariant(inlineCursor);
      }
    }

    const tag = current.tagName.toLowerCase();
    const role =
      current instanceof HTMLElement ? current.getAttribute("role") : null;

    if (
      current instanceof HTMLElement &&
      (current.isContentEditable || tag === "textarea")
    ) {
      return "text";
    }

    if (tag === "input") {
      const inputType = (current.getAttribute("type") ?? "text").toLowerCase();
      if (
        [
          "button",
          "submit",
          "reset",
          "checkbox",
          "radio",
          "range",
          "color",
        ].includes(inputType)
      ) {
        return "pointer";
      }

      return "text";
    }

    if (tag === "select") return "pointer";
    if (tag === "a" && current.hasAttribute("href")) return "pointer";
    if (tag === "button" || tag === "summary") return "pointer";
    if (tag === "label" && current.hasAttribute("for")) return "pointer";
    if (current instanceof HTMLElement && current.draggable) return "move";

    if (
      role &&
      [
        "button",
        "link",
        "menuitem",
        "option",
        "tab",
        "switch",
        "checkbox",
        "radio",
      ].includes(role)
    ) {
      return "pointer";
    }

    current = current.parentElement;
  }

  return "default";
}

function PointerShape({
  variant,
}: {
  variant: Exclude<PointerVariant, "auto">;
}) {
  const size = 30;

  const baseArrow = (
    <svg
      stroke="#0dccf2"
      fill="#020617"
      strokeWidth="1"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("rotate-[-70deg]", variant === "pointer" && "scale-110")}
    >
      <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
    </svg>
  );

  if (variant === "default") {
    return baseArrow;
  }

  if (variant === "pointer") {
    return (
      <svg
        viewBox="0 0 24 24"
        height={size}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        className="-rotate-45 origin-center drop-shadow-[0_0_8px_rgba(13,204,242,0.5)]"
      >
        <path
          d="M12 3c3 2.1 4.5 5.1 4.5 8.4V14l2 2-2.3 1.1-1.7-1.7H9.5L7.8 17 5.5 16l2-2v-2.6C7.5 8.1 9 5.1 12 3z"
          fill="#020617"
          stroke="#0dccf2"
          strokeWidth="1.3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M12 8.9a2 2 0 110 4 2 2 0 010-4z"
          fill="#082f49"
          stroke="#0dccf2"
          strokeWidth="1"
        />
        <path
          d="M12 15.3l1.1 3.1L12 21l-1.1-2.6L12 15.3z"
          fill="#22d3ee"
          stroke="#0dccf2"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        <path
          d="M12 16.4l.45 1.5L12 19.1l-.45-1.2L12 16.4z"
          fill="#ecfeff"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "text") {
    return (
      <svg
        viewBox="0 0 24 24"
        height={size - 6}
        width={size - 6}
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_8px_rgba(13,204,242,0.45)]"
      >
        <path
          d="M8 4h8M8 20h8M12 4v16"
          fill="none"
          stroke="#0dccf2"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "not-allowed") {
    return (
      <svg
        viewBox="0 0 24 24"
        height={size - 6}
        width={size - 6}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="#020617"
          stroke="#fb7185"
          strokeWidth="2"
        />
        <path
          d="M8 16L16 8"
          stroke="#fb7185"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "move") {
    return (
      <svg
        viewBox="0 0 24 24"
        height={size}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3l2.5 2.5H13v5h5V9.5L20.5 12 18 14.5V13h-5v5h1.5L12 20.5 9.5 18H11v-5H6v1.5L3.5 12 6 9.5V11h5V6H9.5L12 3z"
          fill="#020617"
          stroke="#0dccf2"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "col-resize") {
    return (
      <svg
        viewBox="0 0 24 24"
        height={size - 4}
        width={size - 4}
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_8px_rgba(13,204,242,0.45)]"
      >
        <path
          d="M9 7L4 12l5 5M15 7l5 5-5 5M4 12h16M12 5v14"
          fill="none"
          stroke="#0dccf2"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "grab" || variant === "grabbing") {
    return (
      <svg
        viewBox="0 0 24 24"
        height={size}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        className={cn(variant === "grabbing" && "scale-95")}
      >
        <path
          d="M8 11V7a1.5 1.5 0 013 0v3m0-2V6a1.5 1.5 0 013 0v4m0-3a1.5 1.5 0 013 0v6.5c0 3-2.2 5.5-5.2 5.5H11c-3.3 0-6-2.7-6-6v-2.3c0-1 .8-1.7 1.7-1.7.8 0 1.3.4 1.3 2z"
          fill={variant === "grabbing" ? "#083344" : "#020617"}
          stroke="#0dccf2"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return baseArrow;
}

/**
 * A custom pointer component that displays an animated cursor.
 * Add this as a child to any component to enable a custom pointer when hovering.
 * You can pass custom children to render as the pointer.
 *
 * @component
 * @param {HTMLMotionProps<"div">} props - The component props
 */
export function Pointer({
  className,
  style,
  children,
  variant = "auto",
  ...props
}: PointerProps): React.ReactNode {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [resolvedVariant, setResolvedVariant] = useState<
    Exclude<PointerVariant, "auto">
  >(variant === "auto" ? "default" : variant);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;

    const updateVariant = (clientX: number, clientY: number) => {
      if (variant !== "auto") {
        setResolvedVariant(variant);
        return;
      }

      const hoveredElement = document.elementFromPoint(clientX, clientY);
      setResolvedVariant(resolveVariantFromElement(hoveredElement));
    };

    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      updateVariant(e.clientX, e.clientY);
      setIsActive(true);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      updateVariant(e.clientX, e.clientY);
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        setIsActive(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsActive(false);
      }
    };

    root.classList.add("custom-pointer-active");
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleMouseLeave);

    return () => {
      root.classList.remove("custom-pointer-active");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleMouseLeave);
    };
  }, [variant, x, y]);

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={cn(
              "pointer-events-none fixed z-50000 transform-[translate(-50%,-50%)] text-cyan-300",
              className,
            )}
            style={{
              top: y,
              left: x,
              ...style,
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            {...props}
          >
            {children || <PointerShape variant={resolvedVariant} />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
