import { useEffect, useState } from "react";

export const BACKGROUND_MASCOTS = [
  "/images/ed.png",
  "/images/ein.png",
  "/images/ed-ein.png",
] as const;
export const MIN_MASCOT_DELAY_MS = 5000;
export const MAX_MASCOT_DELAY_MS = 10000;
export const MASCOT_PASS_DURATION_MS = 20000;

type RandomSource = () => number;

// Funcoes puras (so usam os parametros e as constantes acima). Ficavam dentro
// do componente, recriadas a cada render e fora do alcance do spec.
export function getRandomMascotDelay(random: RandomSource = Math.random): number {
  const span = MAX_MASCOT_DELAY_MS - MIN_MASCOT_DELAY_MS + 1;
  const offset = Math.floor(random() * span);
  return Math.min(MAX_MASCOT_DELAY_MS, MIN_MASCOT_DELAY_MS + offset);
}

export function pickNextMascotIndex(
  currentIndex: number,
  total: number,
  random: RandomSource = Math.random,
): number {
  if (total <= 1) return 0;
  const nextIndex = Math.floor(random() * (total - 1));
  return nextIndex >= currentIndex ? nextIndex + 1 : nextIndex;
}

export function getMascotTraversalDirection(
  cycle: number,
): "left-to-right" | "right-to-left" {
  return cycle % 2 === 0 ? "left-to-right" : "right-to-left";
}

export function BackgroundMascotMarquee() {
  const [cycle, setCycle] = useState<number>(0);
  const [activeMascotIndex, setActiveMascotIndex] = useState<number>(0);
  const [isMoving, setIsMoving] = useState<boolean>(true);
  const [topPercent, setTopPercent] = useState<number>(58); // default initial value

  const activeMascot = BACKGROUND_MASCOTS[activeMascotIndex];
  const direction = getMascotTraversalDirection(cycle);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => {
        if (isMoving) {
          setIsMoving(false);
          return;
        }
        setCycle((currentCycle) => currentCycle + 1);
        setActiveMascotIndex((currentIndex) =>
          pickNextMascotIndex(currentIndex, BACKGROUND_MASCOTS.length),
        );
        setTopPercent(30 + Math.floor(Math.random() * 71));
        setIsMoving(true);
      },
      isMoving ? MASCOT_PASS_DURATION_MS : getRandomMascotDelay(),
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMoving]);

  if (!isMoving || !activeMascot) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        data-background-mascot-pass
        data-direction={direction}
        style={{ top: `${topPercent}%` }}
        className={[
          "background-mascot-pass absolute h-24 w-24 -translate-y-1/2 sm:h-36 sm:w-36 lg:h-48 lg:w-48",
          direction === "left-to-right"
            ? "animate-background-mascot-left-to-right"
            : "animate-background-mascot-right-to-left",
        ].join(" ")}
      >
        {/* Decorative background art is intentionally rendered as a plain img. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-background-mascot
          data-direction={direction}
          src={activeMascot}
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
          className="animate-background-mascot-spin h-full w-full select-none object-contain opacity-[0.15] dark:opacity-[0.15]"
        />
      </div>
    </div>
  );
}
