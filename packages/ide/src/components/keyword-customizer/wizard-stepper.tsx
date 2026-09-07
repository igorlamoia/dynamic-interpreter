import {
  Blocks,
  BookOpenText,
  ClipboardCheck,
  FingerprintPattern,
  Route,
  Sigma,
} from "lucide-react";
import type { WizardStepIcon, WizardStepId } from "./wizard-model";
import React, { useEffect, useState } from "react";
import { PreviewPanelProps } from "./preview-panel";
import Image from "next/image";
// import { TokenPreview } from "./keyword-customizer/token-preview";

type WizardStep = {
  id: WizardStepId;
  title: string;
  description: string;
  icon: WizardStepIcon;
};

type WizardStepperProps = {
  steps: readonly WizardStep[];
  activeStepId: WizardStepId;
  onStepClick: (stepId: WizardStepId) => void;
  preview: PreviewPanelProps["preview"];
};

export function WizardStepper({
  steps,
  activeStepId,
  onStepClick,
  preview,
}: WizardStepperProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const activeIndex = steps.findIndex((step) => step.id === activeStepId);
  const activeStep = steps[activeIndex] ?? steps[0];
  const progress = Math.round(((activeIndex + 1) / steps.length) * 100);

  const getStepIcon = (icon: WizardStepIcon) => {
    const className = "h-4 w-4";
    if (icon === "fingerprint")
      return <FingerprintPattern className={className} />;
    if (icon === "book-open-text")
      return <BookOpenText className={className} />;
    if (icon === "blocks") return <Blocks className={className} />;
    if (icon === "sigma") return <Sigma className={className} />;
    if (icon === "route") return <Route className={className} />;
    return <ClipboardCheck className={className} />;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <aside
      data-wizard-stepper
      className={`max-lg:sticky max-lg:top-0 max-lg:z-40 max-lg:-mx-5 max-lg:border-b max-lg:border-slate-800/80 max-lg:bg-[#070d18]/95 max-lg:px-5 max-lg:py-3 max-lg:shadow-[0_18px_50px_-34px_rgba(2,6,23,0.95)] max-lg:backdrop-blur-xl lg:backdrop-blur-[2px] flex flex-col gap-3 lg:fixed lg:w-[230px] xl:w-[340px] left-5 transition-[top,height] duration-300 ease-out ${
        isScrolled
          ? "lg:top-8 lg:h-screen"
          : "lg:top-22 lg:h-[calc(100vh-4rem)]"
      }`}
    >
      <div className="flex flex-col gap-2 border-b border-slate-200/70 dark:border-slate-800/80 max-lg:border-b-0 lg:border-b-0 ">
        <div className="pr-2">
          <div className="flex items-end justify-between gap-4 max-lg:items-start">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <div className="mt-1 flex flex-col">
                <p
                  data-wizard-active-title
                  className="text-xs font-semibold uppercase tracking-[0.18em] dark:text-slate-200"
                >
                  {activeStep?.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  de {steps.length} etapas
                </p>
              </div>
            </div>
            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-300">
              {progress}%
            </p>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-emerald-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div
          data-wizard-step-list
          className="flex flex-col gap-1 max-lg:flex-row max-lg:gap-2 max-lg:overflow-x-auto max-lg:pb-1"
        >
          {steps.map((step) => {
            const isActive = step.id === activeStepId;

            return (
              <button
                key={step.id}
                type="button"
                data-wizard-step-button
                onClick={() => onStepClick(step.id)}
                className={[
                  "flex items-center gap-2 border-l-4 px-3 py-2.5 transition-all max-lg:h-10 max-lg:w-10 max-lg:min-w-10 max-lg:flex-none max-lg:justify-center max-lg:rounded-full max-lg:border max-lg:px-0 max-lg:py-0",
                  isActive
                    ? "border-l-cyan-500 bg-primary/20 dark:bg-slate-900/40 text-cyan-400 max-lg:border-cyan-400 max-lg:bg-cyan-400/10 max-lg:shadow-[0_0_24px_-10px_rgba(34,211,238,0.95)] dark:text-cyan-300"
                    : "border-l-transparent text-slate-400 hover:text-slate-600 max-lg:border-slate-800 max-lg:bg-slate-950/60 dark:text-slate-500 dark:hover:text-slate-400",
                ].join(" ")}
                style={
                  {
                    WebkitMaskImage:
                      "linear-gradient(to right, transparent, black 0%, black 70%, transparent), linear-gradient(to bottom, transparent, black 0%, black 70%, transparent)",
                    WebkitMaskComposite: "source-in",
                    maskImage:
                      "linear-gradient(to right, transparent, black 0%, black 70%, transparent)",
                  } as React.CSSProperties
                }
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {getStepIcon(step.icon)}
                </span>
                <span
                  data-wizard-step-label
                  className="text-xs font-medium uppercase tracking-widest max-lg:sr-only"
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <LanguageBasedCard preview={preview} />
      {/* <TokenPreview tokens={preview.tokenPreview} /> */}
    </aside>
  );
}

function LanguageBasedCard({
  preview,
}: {
  preview: PreviewPanelProps["preview"];
}) {
  const imageUrl = preview.languageImageUrl || "/images/language-default.png";

  return (
    <section
      data-wizard-language-card
      className="mr-2 space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.55)] max-lg:hidden dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div className="space-y-1 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Baseado em
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {preview.basedOnLabel}
        </h3>
      </div>

      <div className="group relative overflow-hidden rounded-2xl bg-slate-950 shadow-lg ring-1 ring-white/10 dark:border-slate-800">
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/5 via-slate-950/10 to-slate-950/80" />
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/15 to-transparent dark:from-white/5" />
        <Image
          src={imageUrl}
          alt={preview.name}
          width={640}
          height={260}
          unoptimized
          className="h-32 w-full object-cover object-center opacity-95 transition duration-500 group-hover:scale-[1.02]"
        />

        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="rounded-xl border border-white/10 bg-slate-950/55 p-2 backdrop-blur-[3px]">
            <p className="text-[8px] font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
              Nome da linguagem
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[0.02em] text-white">
              {preview.name}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cyan-400/10" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          DNA da linguagem
        </p>
        <div className="flex flex-wrap gap-2">
          {preview.dna.map((item) => (
            <span
              key={item}
              className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-200"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
