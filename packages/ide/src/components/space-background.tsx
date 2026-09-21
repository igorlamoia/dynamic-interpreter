import { Meteors } from "./ui/meteors";
import { Particles } from "@/components/ui/particles";

export function SpaceBackground() {
  return (
    <div
      className="overflow-hidden flex inset-0 fixed
      bg-linear-to-t from-[#cfddf3] to-[#ffffff]
      dark:bg-linear-to-t dark:from-neutral-950 dark:to-slate-950
    "
    >
      {/* <BackgroundMascotMarquee /> */}
      <Meteors number={5} />
      <Particles />
    </div>
  );
}
