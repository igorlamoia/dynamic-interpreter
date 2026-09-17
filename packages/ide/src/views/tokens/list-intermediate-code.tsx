import { TIntermediateCodeData } from "@/types/compiler";
import { useRuntimeError } from "@/contexts/RuntimeErrorContext";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { t } from "@/i18n";
// import Instructions3D from "./matrix";

export function ListIntermediateCode({
  instructions,
}: {
  instructions: TIntermediateCodeData["instructions"];
}) {
  const { locale } = useRouter();
  if (!instructions) return null;

  return (
    <div className="mt-4">
      <h2 className="text-center  text-2xl font-bold mb-6 font-mono drop-shadow-lg text-foreground">
        {t(locale, "ui.intermediate_code_title")}
      </h2>
      <p className="text-center text-muted-foreground mb-10  mx-auto">
        {t(locale, "ui.intermediate_code_description")}
      </p>

      <Mixed instructions={instructions} />
      {/* <Instructions3D instructions={instructions} /> */}
    </div>
  );
}

const Mixed = ({
  instructions,
}: {
  instructions: TIntermediateCodeData["instructions"];
}) => {
  const { runtimeErrorInstructionPointer } = useRuntimeError();

  useEffect(() => {
    if (runtimeErrorInstructionPointer === null) return;
    const target = document.getElementById(
      `instruction-${runtimeErrorInstructionPointer + 1}`,
    );
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.focus();
  }, [runtimeErrorInstructionPointer]);

  const getContainerClassName = (index: number) => {
    if (runtimeErrorInstructionPointer === null)
      return "bg-cyan-50/65 text-slate-800 dark:bg-cyan-950/30 dark:text-slate-100 border border-cyan-200/70 dark:border-cyan-800/60 shadow-cyan-200/40 dark:shadow-cyan-950/35";
    if (index < runtimeErrorInstructionPointer)
      return "bg-amber-50/65 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100 border border-amber-200/70 dark:border-amber-800/60 shadow-amber-200/40 dark:shadow-amber-950/35";
    if (index === runtimeErrorInstructionPointer)
      return "bg-rose-50/70 text-rose-900 dark:bg-rose-950/35 dark:text-rose-100 border border-rose-300/75 dark:border-rose-800/70 shadow-rose-200/45 dark:shadow-rose-950/40";
    return "bg-cyan-50/65 text-slate-800 dark:bg-cyan-950/30 dark:text-slate-100 border border-cyan-200/70 dark:border-cyan-800/60 shadow-cyan-200/40 dark:shadow-cyan-950/35";
  };

  const getDotClassName = (index: number) => {
    if (runtimeErrorInstructionPointer === null)
      return "bg-(--color-primary)/90 shadow-cyan-300/70";
    if (index < runtimeErrorInstructionPointer)
      return "bg-amber-400/90 shadow-amber-300/70";
    if (index === runtimeErrorInstructionPointer)
      return "bg-rose-500/90 shadow-rose-400/70";
    return "bg-(--color-primary)/90 shadow-cyan-300/70";
  };

  return (
    <div className="mt-4">
      {instructions && instructions.length > 0 ? (
        <div
          data-testid="intermediate-code-list"
          className="relative ml-6 space-y-10 border-l-2 border-cyan-300/70 dark:border-cyan-700/60"
        >
          {instructions.map((instruction, index) => (
            <motion.div
              key={`instruction-${index + 1}`}
              id={`instruction-${index + 1}`}
              tabIndex={-1}
              className="relative pl-6 z-0 hover:z-40"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.28,
                ease: "easeOut",
              }}
            >
              <span
                className={`absolute -left-2.5 top-6 h-4 w-4 rounded-full shadow-md ${getDotClassName(index)}`}
              ></span>

              <div
                className={`${getContainerClassName(index)}
                       rounded-xl p-5 shadow-lg backdrop-blur-sm
                       hover:translate-x-1.5 hover:-translate-y-0.5
                       transition-all duration-300 font-mono`}
              >
                <IntermediateCard instruction={instruction} index={index} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No intermediate code instructions available.
        </p>
      )}
    </div>
  );
};

function IntermediateCard({
  instruction,
  index,
}: {
  instruction: TIntermediateCodeData["instructions"][number];
  index: number;
}) {
  const formatOperand = (value: unknown): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-[auto_repeat(3,minmax(0,1fr))] sm:items-center">
      <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-300 sm:pr-2">
        {index + 1}. ⚡ {instruction.op}
      </h3>
      <p>
        <span className="text-pink-600 dark:text-pink-400">Result:</span>{" "}
        {instruction.result ?? "N/A"}
      </p>
      <p>
        <span className="text-green-600 dark:text-green-400">Op1:</span>{" "}
        {formatOperand(instruction.operand1)}
      </p>
      <p>
        <span className="text-yellow-600 dark:text-yellow-400">Op2:</span>{" "}
        {formatOperand(instruction.operand2)}
      </p>
      {/* 🔍 Mostrar detalhes ao passar o mouse */}
      {/* <div className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer group">
                    🔍 Show Line
                    <div
                      className="absolute hidden group-hover:block bg-white dark:bg-slate-900
                        text-slate-900 dark:text-white border border-cyan-300 rounded-lg
                        shadow-lg p-2 mt-1 z-50 w-72 right-8"
                    >
                      <ul className="space-y-1 text-xs">
                        {Object.entries(instruction).map(([key, value]) => (
                          <li key={key} className="flex gap-2">
                            <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                              {key}:
                            </span>
                            <span className="break-all">
                              {value === null || value === undefined
                                ? "N/A"
                                : String(value)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div> */}
    </div>
  );
}
