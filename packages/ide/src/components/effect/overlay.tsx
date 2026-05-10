export type XOverlaySide = "left" | "right" | "x";
export type YOverlaySide = "top" | "bottom" | "y";
type Size = number;

export type OverlayProps = {
  side?: XOverlaySide | YOverlaySide;
  size?: Size;
};

const baseClassName =
  "pointer-events-none absolute from-[#090f1bcc] via-[#090f1b66] to-transparent";

function EdgeOverlay({
  side,
  size,
}: {
  side: Exclude<XOverlaySide, "x">;
  size: Size;
}) {
  const sideClassName =
    side === "left" ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l";

  return (
    <div
      className={`${baseClassName} inset-y-0 ${sideClassName}`}
      style={{ width: `${size}px` }}
    />
  );
}

function EdgeYOverlay({ side, size }: { side: "bottom" | "top"; size: Size }) {
  const sideClassName =
    side === "bottom" ? "bottom-0 bg-gradient-to-t" : "top-0 bg-gradient-to-b";

  return (
    <div
      className={`${baseClassName} inset-x-0 ${sideClassName}`}
      style={{ height: `${size}px` }}
    />
  );
}

export function Overlay({ side = "x", size = 44 }: OverlayProps) {
  switch (side) {
    case "x":
      return (
        <>
          <EdgeOverlay side="left" size={size} />
          <EdgeOverlay side="right" size={size} />
        </>
      );
    case "left":
    case "right":
      return <EdgeOverlay side={side} size={size} />;
    case "y":
      return (
        <>
          <EdgeYOverlay side="top" size={size} />
          <EdgeYOverlay side="bottom" size={size} />
        </>
      );
    case "top":
    case "bottom":
      return <EdgeYOverlay side={side} size={size} />;
    default:
      return null;
  }
}
