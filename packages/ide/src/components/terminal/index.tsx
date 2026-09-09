"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type {
  DebugSnapshot,
  Instruction,
} from "@ts-compilator-for-java/compiler/interpreter/constants";
import { Body } from "./body";
import { Header } from "./header";

export interface TerminalLine {
  id: number;
  content: string;
  type: "output" | "input" | "error" | "success" | "info" | "prompt";
}

export interface DebugTerminalSession {
  output: string[];
  snapshot: DebugSnapshot | null;
  provideInput: (value: string) => void;
  continueExecution: () => Promise<DebugSnapshot | null>;
}

interface ITerminalViewProps {
  isTerminalOpen: boolean;
  toggleTerminal: () => void;
  intermediateCode: Instruction[];
  debugSession?: DebugTerminalSession;
}

let lineIdCounter = 0;

export function createLine(
  content: string,
  type: TerminalLine["type"] = "output",
): TerminalLine {
  return { id: lineIdCounter++, content, type };
}

export default function TerminalView({
  isTerminalOpen,
  toggleTerminal,
  intermediateCode,
  debugSession,
}: ITerminalViewProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    createLine("Van Hohenheim! O Henheim da luz", "info"),
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debugOutputLengthRef = useRef(0);
  const debugOutputLineOpenRef = useRef(false);

  // Focar no input quando o terminal abrir
  useEffect(() => {
    if (isTerminalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    const debugOutput = debugSession?.output;
    if (!debugOutput) {
      debugOutputLengthRef.current = 0;
      debugOutputLineOpenRef.current = false;
      return;
    }

    if (debugOutput.length < debugOutputLengthRef.current) {
      debugOutputLengthRef.current = 0;
      debugOutputLineOpenRef.current = false;
    }

    const nextOutput = debugOutput.slice(debugOutputLengthRef.current);
    if (nextOutput.length === 0) return;

    setLines((previousLines) => {
      let nextLines = previousLines;
      let lineOpen = debugOutputLineOpenRef.current;

      for (const content of nextOutput) {
        const next = appendOutputLines(nextLines, content, "output", lineOpen);
        nextLines = next.lines;
        lineOpen = next.lineOpen;
      }

      debugOutputLineOpenRef.current = lineOpen;
      return nextLines;
    });
    debugOutputLengthRef.current = debugOutput.length;
  }, [debugSession?.output]);

  return (
    <>
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "50%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "50%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "absolute left-0 right-0 bottom-0 z-50 backdrop-blur-sm",
              "shadow-[0_-20px_60px_-40px_rgba(255,255,255,0.9)] dark:shadow-[0_-20px_60px_-40px_rgba(0,0,0,0.9)]",
            )}
            onClick={() => inputRef.current?.focus()}
          >
            <Header
              toggleTerminal={toggleTerminal}
              setLines={setLines}
              isExecuting={isExecuting}
            />

            <Body
              lines={lines}
              intermediateCode={intermediateCode}
              currentInput={currentInput}
              inputRef={inputRef}
              setIsExecuting={setIsExecuting}
              setCurrentInput={setCurrentInput}
              setLines={setLines}
              toggleTerminal={toggleTerminal}
              debugSession={debugSession}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function createOutputLines(
  content: string,
  type: TerminalLine["type"],
): TerminalLine[] {
  return appendOutputLines([], content, type, false).lines;
}

export function appendOutputLines(
  previousLines: TerminalLine[],
  content: string,
  type: TerminalLine["type"],
  lineOpen: boolean,
): { lines: TerminalLine[]; lineOpen: boolean } {
  const normalizedContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let lines = previousLines;
  let hasOpenLine = lineOpen;

  const ensureOutputLine = () => {
    const lastLine = lines[lines.length - 1];
    if (hasOpenLine && lastLine?.type === type) {
      return;
    }

    lines = [...lines, createLine("", type)];
    hasOpenLine = true;
  };

  const appendToLastOutputLine = (char: string) => {
    const lastIndex = lines.length - 1;
    const lastLine = lines[lastIndex];

    lines = [
      ...lines.slice(0, lastIndex),
      {
        ...lastLine,
        content: `${lastLine.content}${char}`,
      },
    ];
  };

  for (const char of normalizedContent) {
    if (char === "\n") {
      if (!hasOpenLine) {
        lines = [...lines, createLine("", type)];
      }
      hasOpenLine = false;
      continue;
    }

    ensureOutputLine();
    appendToLastOutputLine(char);
  }

  return { lines, lineOpen: hasOpenLine };
}
