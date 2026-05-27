import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { LucideIcon } from "lucide-react";

import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";
import { cn } from "@/lib/utils";

type SnapDirection = "next" | "previous";
type CardSnapAccent = {
  activeButton: string;
  activeShadow: string;
};

export type CardSnapStackItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  accent?: CardSnapAccent;
  children: ReactNode;
};

export function resolveCardSnapIndex(
  currentIndex: number,
  direction: SnapDirection,
  itemCount: number,
): number {
  if (itemCount <= 0) return 0;

  const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

  return Math.min(Math.max(nextIndex, 0), itemCount - 1);
}

export function resolveCardSnapAccent(key: string): CardSnapAccent {
  switch (key) {
    case "entrada":
      return {
        activeButton:
          "border-emerald-300/60 bg-emerald-300/15 text-emerald-200",
        activeShadow: "shadow-[0_24px_70px_-44px_rgba(52,211,153,0.85)]",
      };
    case "tipos":
      return {
        activeButton: "border-cyan-300/60 bg-cyan-300/15 text-cyan-200",
        activeShadow: "shadow-[0_24px_70px_-44px_rgba(34,211,238,0.85)]",
      };
    case "lacos":
      return {
        activeButton: "border-pink-300/60 bg-pink-300/15 text-pink-200",
        activeShadow: "shadow-[0_24px_70px_-44px_rgba(244,114,182,0.85)]",
      };
    case "fluxo":
      return {
        activeButton: "border-violet-300/60 bg-violet-300/15 text-violet-200",
        activeShadow: "shadow-[0_24px_70px_-44px_rgba(196,181,253,0.85)]",
      };
    case "booleanos":
      return {
        activeButton: "border-lime-300/60 bg-lime-300/15 text-lime-200",
        activeShadow: "shadow-[0_24px_70px_-44px_rgba(163,230,53,0.85)]",
      };
    case "operadores":
      return {
        activeButton: "border-sky-300/60 bg-sky-300/15 text-sky-200",
        activeShadow: "shadow-[0_24px_70px_-44px_rgba(125,211,252,0.85)]",
      };
    default:
      return {
        activeButton: "border-slate-300/60 bg-slate-300/15 text-slate-200",
        activeShadow: "shadow-[0_24px_70px_-44px_rgba(203,213,225,0.75)]",
      };
  }
}

function renderItemIcon(item: CardSnapStackItem) {
  const Icon = item.icon;
  return <Icon className="h-4 w-4" aria-hidden="true" />;
}

type CardSnapStackProps = {
  items: CardSnapStackItem[];
  className?: string;
  focusKey?: string;
  focusRequestId?: number;
};

export function CardSnapStack({
  items,
  className,
  focusKey,
  focusRequestId,
}: CardSnapStackProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
  const lastWheelAtRef = useRef(0);
  const itemKeySignature = items.map((item) => item.key).join("\0");

  const focusCard = useCallback(
    (index: number) => {
      if (items.length === 0) return;

      const boundedIndex = Math.min(Math.max(index, 0), items.length - 1);
      const scrollArea = scrollAreaRef.current;
      const card = cardsRef.current[boundedIndex];

      setActiveIndex(boundedIndex);

      if (!scrollArea || !card) return;

      scrollArea.scrollTo({
        top: card.offsetTop,
        behavior: "smooth",
      });
    },
    [items.length],
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (Math.abs(event.deltaY) < 6) return;

      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();

      const now = Date.now();
      if (now - lastWheelAtRef.current < 360) return;

      lastWheelAtRef.current = now;
      const direction = event.deltaY > 0 ? "next" : "previous";
      focusCard(resolveCardSnapIndex(activeIndex, direction, items.length));
    },
    [activeIndex, focusCard, items.length],
  );

  useEffect(() => {
    if (!focusKey || focusRequestId === undefined) return;

    const targetIndex = itemKeySignature.split("\0").indexOf(focusKey);
    if (targetIndex === -1) return;

    focusCard(targetIndex);
  }, [focusCard, focusKey, focusRequestId, itemKeySignature]);

  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    focusCard(index);
  };

  return (
    <div
      className={cn("relative flex min-h-0 flex-1 flex-col gap-3", className)}
    >
      <div
        className="grid grid-cols-6 gap-1.5 pr-6"
        aria-label="Categorias do preview"
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const accent = item.accent ?? resolveCardSnapAccent(item.key);

          return (
            <button
              key={item.key}
              type="button"
              aria-label={`Focar ${item.label}`}
              aria-pressed={isActive}
              data-card-snap-top-nav
              data-active={isActive}
              onClick={() => focusCard(index)}
              className={cn(
                "flex h-8 items-center justify-center rounded-sm border text-slate-400 outline-none transition-all",
                "focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                isActive
                  ? `${accent.activeButton} ${accent.activeShadow}`
                  : "border-slate-800 bg-slate-950/55 hover:border-slate-600 hover:text-slate-200",
              )}
            >
              {renderItemIcon(item)}
            </button>
          );
        })}
      </div>

      <div className="relative min-h-0 flex-1">
        <PerfectScrollbar
          ref={scrollAreaRef}
          axis="y"
          className="h-full snap-y snap-mandatory scroll-smooth pr-6"
          data-card-snap-scroll-area
          onWheel={handleWheel}
        >
          <div className="flex flex-col gap-5 pb-24">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              const accent = item.accent ?? resolveCardSnapAccent(item.key);

              return (
                <div
                  key={item.key}
                  ref={(element) => {
                    cardsRef.current[index] = element;
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Focar ${item.label}`}
                  data-card-snap-card
                  data-preview-category={item.label}
                  data-active={isActive}
                  onClick={() => focusCard(index)}
                  onKeyDown={(event) => handleCardKeyDown(event, index)}
                  className={cn(
                    "relative snap-start cursor-pointer rounded-sm outline-none transition-[transform,opacity,filter] duration-300",
                    "focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                    isActive
                      ? `z-20 scale-[1.01] opacity-100 ${accent.activeShadow}`
                      : "z-0 scale-[0.985] opacity-70 saturate-[0.75] hover:opacity-90",
                  )}
                  style={{
                    transformOrigin: "top center",
                  }}
                >
                  {item.children}
                </div>
              );
            })}
          </div>
        </PerfectScrollbar>
      </div>
    </div>
  );
}
