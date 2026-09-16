import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function InterpreterLottie({
  h = 80,
  w = 80,
}: {
  h?: number;
  w?: number;
}) {
  return (
    <div className="flex w-full justify-center">
      <DotLottieReact
        src="/dark.lottie"
        loop
        autoplay
        className={`h-[${h}px] w-[${w}px] md:h-[${h * 1.3}px] md:w-[${w * 1.3}px]`}
      />
    </div>
  );
}
