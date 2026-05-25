import { useRuntimeError } from "@/contexts/RuntimeErrorContext";
import { KeyboardEvent, useCallback, useEffect, useRef } from "react";
import { createLine, type DebugTerminalSession, type TerminalLine } from ".";
import {
  Interpreter,
  RuntimeError,
} from "@ts-compilator-for-java/compiler/interpreter";
import { motion } from "motion/react";
import { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import { getLineColor } from "@/utils/compiler/styles";
import { cn } from "@/lib/utils";
import { PerfectScrollbar } from "../ui/perfect-scrollbar";

interface BodyProps {
  lines: TerminalLine[];
  currentInput: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
  intermediateCode: Instruction[];
  setIsExecuting: React.Dispatch<React.SetStateAction<boolean>>;
  setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  toggleTerminal: () => void;
  debugSession?: DebugTerminalSession;
}

const scheduledExecutionKeys = new Set<string>();

function getExecutionKey(intermediateCode: Instruction[]): string {
  if (intermediateCode.length === 0) return "";

  try {
    return JSON.stringify(intermediateCode);
  } catch {
    return `${intermediateCode.length}`;
  }
}

function normalizeSubmittedInput(value: string): string {
  return value.replace(/[\r\n]/g, "");
}

export function Body(props: BodyProps) {
  const {
    lines,
    currentInput,
    inputRef,
    setCurrentInput,
    intermediateCode,
    setIsExecuting,
    setLines,
    toggleTerminal,
    debugSession,
  } = props;
  const { setRuntimeErrorInstructionPointer } = useRuntimeError();

  const commandHistory = useRef<string[]>([]);
  const historyPointer = useRef<number>(0);

  const addLine = useCallback(
    (content: string, type: TerminalLine["type"] = "output") => {
      setLines((prev) => [...prev, createLine(content, type)]);
    },
    [],
  );

  // Processar comandos internos
  const processCommand = useCallback(
    (command: string) => {
      const trimmed = command.trim().toLowerCase();

      if (debugSession?.snapshot?.status === "waiting-for-input") {
        addLine(`$ ${command}`, "input");
        debugSession.provideInput(command);
        void debugSession.continueExecution();
        return;
      }

      // Se o interpretador está esperando input, resolve a promise
      if (resolveInput.current) {
        addLine(`$ ${command}`, "input");
        resolveInput.current(command);
        resolveInput.current = null;
        return;
      }

      addLine(`$ ${command}`, "input");

      switch (trimmed) {
        case "clear":
        case "cls":
          setLines([]);
          break;
        case "help":
          addLine(
            "Available commands: ping, clear, cls, help, exit, 'ctrl+j' to toggle terminal",
            "info",
          );
          break;
        case "ping":
          addLine("Pong! 🏓", "output");
          break;
        case "choma":
          addLine("mei!", "output");
          break;
        case "exit":
          addLine("❌  Exiting terminal...", "output");
          setTimeout(() => {
            setLines([createLine("Welcome to the Lamoia's Terminal!", "info")]);
            toggleTerminal();
          }, 1000);
          break;
        default:
          if (trimmed !== "")
            addLine(`Comando não reconhecido: ${command}`, "error");
          break;
      }
    },
    [addLine, debugSession, toggleTerminal],
  );

  // Executar interpretador quando receber código intermediário
  const runInterpreter = useCallback(async () => {
    if (intermediateCode.length === 0) return;

    setRuntimeErrorInstructionPointer(null);
    setIsExecuting(true);
    let outputBuffer = "";

    const inputPromise = (): Promise<string> =>
      new Promise((resolve) => {
        if (outputBuffer.length > 0) {
          addLine(outputBuffer, "output");
          outputBuffer = "";
        }
        resolveInput.current = resolve;
      });

    const io = {
      stdout: (msg: string) => {
        const normalizedMsg = msg.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        for (const char of normalizedMsg) {
          if (char === "\n") {
            addLine(outputBuffer, "output");
            outputBuffer = "";
          } else {
            outputBuffer += char;
          }
        }
      },
      stdin: inputPromise,
    };

    addLine("", "output");
    addLine("🟢  Iniciando execução do código...", "success");
    addLine("", "output");

    const interpreter = new Interpreter(intermediateCode, io);

    try {
      await interpreter.execute({ current: "" });
      if (outputBuffer.length > 0) {
        addLine(outputBuffer, "output");
        outputBuffer = "";
      }
      setRuntimeErrorInstructionPointer(null);
      addLine("", "output");
      addLine("🟢  Finalizando execução do código...", "success");
      addLine("", "output");
    } catch (e: unknown) {
      if (outputBuffer.length > 0) {
        addLine(outputBuffer, "output");
        outputBuffer = "";
      }
      if (e instanceof RuntimeError) {
        setRuntimeErrorInstructionPointer(e.instructionPointer);
        addLine(`❌ Error: ${e.message}`, "error");
      } else if (e instanceof Error) {
        setRuntimeErrorInstructionPointer(null);
        addLine(`❌ Error: ${e.message}`, "error");
      } else {
        setRuntimeErrorInstructionPointer(null);
        addLine("❌ Erro: An unknown error occurred.", "error");
      }
    }

    setIsExecuting(false);
    resolveInput.current = null;
  }, [intermediateCode, addLine, setRuntimeErrorInstructionPointer]);

  useEffect(() => {
    const executionKey = getExecutionKey(intermediateCode);
    if (!executionKey || scheduledExecutionKeys.has(executionKey)) return;

    scheduledExecutionKeys.add(executionKey);
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      void runInterpreter().finally(() => {
        scheduledExecutionKeys.delete(executionKey);
      });
    });

    return () => {
      cancelled = true;
      scheduledExecutionKeys.delete(executionKey);
    };
  }, [intermediateCode, runInterpreter]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const command = normalizeSubmittedInput(currentInput);
      if (command.trim() !== "") {
        commandHistory.current.push(command);
        historyPointer.current = commandHistory.current.length;
      }
      processCommand(command);
      setCurrentInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyPointer.current > 0) {
        historyPointer.current -= 1;
        setCurrentInput(commandHistory.current[historyPointer.current] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer.current < commandHistory.current.length - 1) {
        historyPointer.current += 1;
        setCurrentInput(commandHistory.current[historyPointer.current] || "");
      } else {
        historyPointer.current = commandHistory.current.length;
        setCurrentInput("");
      }
    } else if (e.ctrlKey && e.key === "c") {
      addLine("Process interrupted.", "error");
      setCurrentInput("");
      resolveInput.current = null;
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  // Auto-scroll ao adicionar novas linhas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const resolveInput = useRef<((value: string) => void) | null>(null);

  return (
    <PerfectScrollbar
      ref={scrollRef}
      className="overflow-x-hidden p-4 font-mono text-sm h-65 terminal-scroll"
    >
      {lines.map((line, index) => (
        <motion.div
          key={line.id}
          initial={
            index >= lines.length - 3
              ? { opacity: 0, y: -5 }
              : { opacity: 1, y: 0 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "whitespace-pre-wrap break-all leading-relaxed",
            getLineColor(line.type),
          )}
        >
          {line.content || "\u00A0"}
        </motion.div>
      ))}

      {/* Linha de input */}
      <div className="flex items-center gap-1 mt-1">
        <span className="text-(--color-primary) select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-gray-500 dark:text-gray-200 outline-none caret-(--color-primary) font-mono text-sm"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </PerfectScrollbar>
  );
}
