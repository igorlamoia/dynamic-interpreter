import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function InterpreterLottie() {
  return (
    <div className="flex w-full justify-center">
      <DotLottieReact
        src="/dark.lottie"
        loop
        autoplay
        className="h-[260px] w-[260px] md:h-[360px] md:w-[360px]"
      />
    </div>
  );
}
