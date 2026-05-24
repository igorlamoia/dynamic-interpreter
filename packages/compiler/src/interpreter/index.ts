import {
  coerceValueForType,
  createDynamicArrayValue,
  createFixedArrayValue,
  isRuntimeArrayValue,
  makeOperation,
  makeRelation,
  parseScanInput,
  readArrayValue,
  writeArrayValue,
} from "./utils";
import {
  ARITHMETICS,
  DebugCallFrameSnapshot,
  DebugSnapshot,
  DebugStatus,
  DebugStopReason,
  DebugVariableSnapshot,
  Instruction,
  LOGICALS,
  RELATIONALS,
  RuntimeArrayValue,
  RuntimeSlot,
  SourceLocation,
  TArithmetics,
  TLogical,
  TRelational,
} from "./constants";
import { RuntimeError } from "./runtime-error";
import { translate } from "../i18n";
interface CallFrame {
  name: string;
  returnAddress: number;
  returnVariable: string | null;
  localScope: Map<string, RuntimeSlot>;
  parameters: string[];
}

export class Interpreter {
  private labels: Map<string, number>;
  private variables: Map<string, RuntimeSlot>;
  private callStack: CallFrame[];
  private debugBreakpoints = new Set<number>();
  private debugStatus: DebugStatus = "idle";
  private debugStopReason: DebugStopReason | null = null;
  private lastDebugError: string | null = null;
  private lastDebugStoppedInstructionPointer: number | null = null;
  private instructionPointer: number;
  private program: Instruction[];

  private stdout: (msg: string) => void;
  private stdin: () => Promise<string>;
  private locale: string | undefined;

  constructor(
    program: Instruction[],
    io: {
      stdout: (msg: string) => void;
      stdin: () => Promise<string>;
    },
    locale?: string,
  ) {
    this.stdout = io.stdout;
    this.stdin = io.stdin;
    this.program = program;
    this.labels = new Map<string, number>();
    this.variables = new Map<string, RuntimeSlot>();
    this.callStack = [];
    this.instructionPointer = 0;
    this.locale = locale;
  }

  private getFallbackInstruction(): Instruction {
    return {
      op: "CALL",
      result: "STOP",
      operand1: null,
      operand2: null,
    };
  }

  private getCurrentInstruction(): Instruction {
    return (
      this.program[this.instructionPointer] ?? this.getFallbackInstruction()
    );
  }

  private buildErrorCallStack(
    pointer: number = this.instructionPointer,
  ): Instruction[] {
    return this.program.slice(0, Math.max(0, pointer));
  }

  private toRuntimeError(
    error: unknown,
    instruction: Instruction,
    pointer: number = this.instructionPointer,
  ): RuntimeError {
    if (error instanceof RuntimeError) return error;
    const code = "interpreter.runtime_error";
    const message = error instanceof Error ? error.message : "Runtime error";
    return new RuntimeError(
      code,
      message,
      instruction,
      pointer,
      this.buildErrorCallStack(pointer),
    );
  }

  private throwRuntimeError(
    code: string,
    params?: Record<string, string | number | boolean | unknown>,
    instruction: Instruction = this.getCurrentInstruction(),
    pointer: number = this.instructionPointer,
  ): never {
    const message = translate(this.locale, code, params);
    throw new RuntimeError(
      code,
      message,
      instruction,
      pointer,
      this.buildErrorCallStack(pointer),
    );
  }

  private consumePendingParameterValue(parameterName: string): unknown {
    if (this.callStack.length === 0) {
      return null;
    }

    const frame = this.callStack[this.callStack.length - 1];
    const evaluatedArgs = (frame as any).evaluatedArgs as unknown[];

    if (!evaluatedArgs || frame.parameters.length >= evaluatedArgs.length) {
      return null;
    }

    const initialValue = evaluatedArgs[frame.parameters.length];
    frame.parameters.push(parameterName);
    return initialValue;
  }

  private resetRuntimeState(): void {
    this.labels.clear();
    this.variables.clear();
    this.callStack = [];
    this.instructionPointer = 0;
  }

  private indexLabels(): void {
    this.program.forEach((instruction, index) => {
      if (instruction.op !== "LABEL") return;
      const labelName = instruction.result;
      if (this.labels.has(labelName))
        this.throwRuntimeError(
          "interpreter.label_defined_multiple_times",
          { labelName },
          instruction,
          index,
        );
      this.labels.set(labelName, index);
    });
  }

  private initializeAtMain(): void {
    if (!this.labels.has("main")) {
      this.throwRuntimeError(
        "interpreter.no_main_function",
        undefined,
        this.getFallbackInstruction(),
        0,
      );
    }
    this.instructionPointer = this.getLabelIndex("main");
  }

  private async stepInstruction(
    commandRef = { current: "" },
  ): Promise<"running" | "stopped"> {
    const currentInstruction = this.getCurrentInstruction();
    const { op, result, operand1, operand2 } = currentInstruction;

    try {
      if (op === "CALL" && result === "STOP") return "stopped";
      if (op === "LABEL") {
        this.instructionPointer++;
      } else if (ARITHMETICS.includes(op as TArithmetics)) {
        if (operand2 !== null) {
          const val1 = this.parseOrGetVariableWithScope(operand1);
          const val2 = this.parseOrGetVariableWithScope(operand2);

          if (typeof val1 !== "number" || typeof val2 !== "number")
            this.throwRuntimeError(
              "interpreter.arithmetic_requires_numeric",
              { op, val1, val2 },
              currentInstruction,
            );

          this.setVariable(
            result,
            makeOperation(op as TArithmetics, val1, val2, (code, params) =>
              this.throwRuntimeError(code, params, currentInstruction),
            ),
          );
        } else {
          const val1 = this.parseOrGetVariableWithScope(operand1);
          if (typeof val1 !== "number")
            this.throwRuntimeError(
              "interpreter.unary_arithmetic_requires_numeric",
              { op, val1 },
              currentInstruction,
            );

          if (op === "+") this.setVariable(result, +val1);
          else if (op === "-") this.setVariable(result, -val1);
          else
            this.throwRuntimeError(
              "interpreter.invalid_unary_operator",
              { op },
              currentInstruction,
            );
        }
        this.instructionPointer++;
      } else if (op === "unary+" || op === "unary-") {
        const val1 = this.parseOrGetVariableWithScope(operand1);
        if (typeof val1 !== "number")
          this.throwRuntimeError(
            "interpreter.unary_operation_requires_numeric",
            { op, val1 },
            currentInstruction,
          );
        this.setVariable(result, op === "unary+" ? +val1 : -val1);
        this.instructionPointer++;
      } else if (LOGICALS.includes(op as TLogical)) {
        if (op === "!") {
          const val1 = this.parseOrGetVariableWithScope(operand1);
          this.setVariable(result, !Boolean(val1));
        } else {
          const val1 = Boolean(this.parseOrGetVariableWithScope(operand1));
          const val2 = Boolean(this.parseOrGetVariableWithScope(operand2));
          let out: boolean;
          if (op === "||") out = val1 || val2;
          else out = val1 && val2;
          this.setVariable(result, out);
        }
        this.instructionPointer++;
      } else if (RELATIONALS.includes(op as TRelational)) {
        const val1 = this.parseOrGetVariableWithScope(operand1);
        const val2 = this.parseOrGetVariableWithScope(operand2);
        this.setVariable(
          result,
          makeRelation(
            op as TRelational,
            val1 as number,
            val2 as number,
            (code, params) =>
              this.throwRuntimeError(code, params, currentInstruction),
          ),
        );
        this.instructionPointer++;
      } else if (op === "=") {
        const val1 = this.parseOrGetVariableWithScope(operand1);
        this.setVariable(result, val1);
        this.instructionPointer++;
      } else if (op === "IF") {
        const conditionVal = this.parseOrGetVariableWithScope(result);
        const labelTrue = operand1;
        const labelFalse = operand2;

        if (typeof labelTrue !== "string" || typeof labelFalse !== "string")
          this.throwRuntimeError(
            "interpreter.if_requires_labels",
            { labelTrue, labelFalse },
            currentInstruction,
          );

        if (Boolean(conditionVal))
          this.instructionPointer = this.getLabelIndex(labelTrue);
        else this.instructionPointer = this.getLabelIndex(labelFalse);
      } else if (op === "JUMP") {
        const labelName = result;
        this.instructionPointer = this.getLabelIndex(labelName);
      } else if (op === "CALL") {
        const callType = result.toUpperCase();
        if (callType === "PRINT") {
          let output = String(
            operand1 ?? this.parseOrGetVariableWithScope(operand2),
          );
          // Remove surrounding double quotes from string literals
          if (output.startsWith('"') && output.endsWith('"')) {
            output = output.slice(1, -1);
          }
          this.stdout(output.replace(/\\n/g, "\r\n"));
          this.instructionPointer++;
        } else if (callType === "SCAN") {
          if (typeof operand2 !== "string")
            this.throwRuntimeError(
              "interpreter.scan_requires_string_variable",
              { operand2 },
              currentInstruction,
            );

          const scanHint =
            operand1 === "int" || operand1 === "float" ? operand1 : null;
          const userInput = await this.stdin();
          commandRef.current = "";
          this.setVariable(operand2, parseScanInput(scanHint, userInput));
          this.instructionPointer++;
        } else if (callType === "STOP") {
          return "stopped";
        } else {
          // Chamada de função definida pelo usuário
          const functionName = result;
          const args = operand1 as string[];
          const returnVar = operand2 as string;

          // Avaliar argumentos no escopo atual
          const evaluatedArgs = args
            ? args.map((arg) => this.parseOrGetVariableWithScope(arg))
            : [];

          // Criar novo frame para a função
          const frame: CallFrame = {
            name: functionName,
            returnAddress: this.instructionPointer + 1,
            returnVariable: returnVar,
            localScope: new Map<string, RuntimeSlot>(),
            parameters: [],
          };

          this.callStack.push(frame);

          // Pular para a função
          this.instructionPointer = this.getLabelIndex(functionName);

          // Os parâmetros serão inicializados pelas instruções DECLARE da função
          // e depois precisam receber os valores dos argumentos
          // Vamos armazenar os argumentos avaliados temporariamente
          (frame as any).evaluatedArgs = evaluatedArgs;
        }
      } else if (op === "DECLARE") {
        if (typeof result !== "string")
          this.throwRuntimeError(
            "interpreter.declare_requires_string",
            { result },
            currentInstruction,
          );

        const declaredType =
          typeof operand1 === "string" ? operand1 : "dynamic";
        const initialValue = this.consumePendingParameterValue(result);

        this.declareVariable(result, declaredType, initialValue);

        this.instructionPointer++;
      } else if (op === "DECLARE_ARRAY") {
        if (typeof result !== "string")
          this.throwRuntimeError(
            "interpreter.declare_requires_string",
            { result },
            currentInstruction,
          );

        const declaredType =
          typeof operand1 === "string" ? operand1 : "dynamic";
        const arrayDeclaration = this.parseArrayDeclaration(
          operand2,
          currentInstruction,
        );
        const initialValue = this.consumePendingParameterValue(result);

        this.declareVariable(
          result,
          declaredType,
          isRuntimeArrayValue(initialValue)
            ? initialValue
            : arrayDeclaration.mode === "fixed"
              ? createFixedArrayValue(declaredType, arrayDeclaration.sizes)
              : createDynamicArrayValue(
                  declaredType,
                  arrayDeclaration.dimensions,
                ),
        );
        this.instructionPointer++;
      } else if (op === "ARRAY_GET") {
        if (typeof operand1 !== "string" || !Array.isArray(operand2)) {
          this.throwRuntimeError(
            "interpreter.runtime_error",
            { operand1, operand2 },
            currentInstruction,
          );
        }

        const arraySlot = this.getVariableSlot(operand1);
        if (!isRuntimeArrayValue(arraySlot.value)) {
          this.throwRuntimeError(
            "interpreter.runtime_error",
            { operand1 },
            currentInstruction,
          );
        }

        const indexes = operand2.map((index) =>
          Number(this.parseOrGetVariableWithScope(index)),
        );
        const value = readArrayValue(arraySlot.value, indexes, (code, params) =>
          this.throwRuntimeError(code, params, currentInstruction),
        );
        this.setVariable(result, value);
        this.instructionPointer++;
      } else if (op === "ARRAY_SET") {
        if (typeof result !== "string" || !Array.isArray(operand1)) {
          this.throwRuntimeError(
            "interpreter.runtime_error",
            { result, operand1, operand2 },
            currentInstruction,
          );
        }

        const arraySlot = this.getVariableSlot(result);
        if (!isRuntimeArrayValue(arraySlot.value)) {
          this.throwRuntimeError(
            "interpreter.runtime_error",
            { result },
            currentInstruction,
          );
        }

        const indexes = operand1.map((index) =>
          Number(this.parseOrGetVariableWithScope(index)),
        );
        const nextValue = this.parseOrGetVariableWithScope(operand2);
        writeArrayValue(
          arraySlot.value,
          indexes,
          nextValue,
          (code, params) =>
            this.throwRuntimeError(code, params, currentInstruction),
        );
        this.instructionPointer++;
      } else if (op === "RETURN") {
        const returnValue = this.parseOrGetVariableWithScope(result);
        const returnType =
          typeof operand1 === "string" ? operand1 : "dynamic";
        const coercedReturnValue = coerceValueForType(
          returnType,
          returnValue,
        );

        if (this.callStack.length === 0) {
          // Return do main - terminar execução
          return "stopped";
        }

        // Pop do call stack
        const frame = this.callStack.pop()!;

        // Armazenar valor de retorno no escopo do caller se houver variável
        if (frame.returnVariable) {
          this.setVariable(frame.returnVariable, coercedReturnValue);
        }

        // Voltar para endereço de retorno
        this.instructionPointer = frame.returnAddress;
      } else
        this.throwRuntimeError(
          "interpreter.unknown_operation",
          { op, instructionPointer: this.instructionPointer },
          currentInstruction,
        );
    } catch (error) {
      throw this.toRuntimeError(error, currentInstruction);
    }

    return "running";
  }

  public async execute(commandRef = { current: "" }): Promise<void> {
    this.resetRuntimeState();
    this.indexLabels();
    this.initializeAtMain();

    while (this.reading()) {
      const status = await this.stepInstruction(commandRef);
      if (status === "stopped") break;
    }
  }

  public startDebug(options: { breakpoints?: number[] } = {}): DebugSnapshot {
    this.resetRuntimeState();
    this.indexLabels();
    this.initializeAtMain();
    this.debugBreakpoints = new Set(options.breakpoints ?? []);
    this.debugStatus = "paused";
    this.debugStopReason = "entry";
    this.lastDebugError = null;
    this.lastDebugStoppedInstructionPointer = null;
    return this.getDebugSnapshot();
  }

  public async continueDebug(
    commandRef = { current: "" },
  ): Promise<DebugSnapshot> {
    this.debugStatus = "running";
    while (this.reading()) {
      const instruction = this.getCurrentInstruction();
      const isSameStoppedInstruction =
        this.lastDebugStoppedInstructionPointer === this.instructionPointer;

      if (
        instruction.source &&
        this.debugBreakpoints.has(instruction.source.line) &&
        !isSameStoppedInstruction
      ) {
        this.debugStatus = "paused";
        this.debugStopReason = "breakpoint";
        this.lastDebugStoppedInstructionPointer = this.instructionPointer;
        return this.getDebugSnapshot();
      }

      if (isSameStoppedInstruction) {
        this.lastDebugStoppedInstructionPointer = null;
      }

      const result = await this.stepInstruction(commandRef);
      if (result === "stopped") {
        this.debugStatus = "completed";
        this.debugStopReason = "completed";
        return this.getDebugSnapshot();
      }
    }
    this.debugStatus = "completed";
    this.debugStopReason = "completed";
    return this.getDebugSnapshot();
  }

  public getDebugSnapshot(): DebugSnapshot {
    return {
      status: this.debugStatus,
      stopReason: this.debugStopReason,
      instructionPointer: this.instructionPointer,
      currentSource: this.getCurrentSource(),
      variables: this.getVariableSnapshots(),
      callStack: this.getCallStackSnapshots(),
      error: this.lastDebugError,
    };
  }

  private getCurrentSource(): SourceLocation | null {
    return this.getCurrentInstruction().source ?? null;
  }

  private getVariableSnapshots(): DebugVariableSnapshot[] {
    const globalSnapshots = [...this.variables.entries()].map(
      ([name, slot]) => ({
        name,
        type: slot.type,
        value: this.serializeDebugSnapshotValue(slot.value),
        scope: "global" as const,
      }),
    );

    if (this.callStack.length === 0) {
      return globalSnapshots;
    }

    const currentFrame = this.callStack[this.callStack.length - 1];
    const localSnapshots = [...currentFrame.localScope.entries()].map(
      ([name, slot]) => ({
        name,
        type: slot.type,
        value: this.serializeDebugSnapshotValue(slot.value),
        scope: "local" as const,
      }),
    );

    return [...globalSnapshots, ...localSnapshots];
  }

  private serializeDebugSnapshotValue(
    value: unknown,
    seen = new WeakMap<object, unknown>(),
  ): unknown {
    if (value === null || typeof value !== "object") {
      return value;
    }

    if (seen.has(value)) {
      return seen.get(value);
    }

    if (isRuntimeArrayValue(value)) {
      const snapshot: RuntimeArrayValue = {
        kind: "array",
        arrayMode: value.arrayMode,
        baseType: value.baseType,
        dimensions: value.dimensions,
        sizes: value.sizes.map((size) => size),
        elements: [],
      };
      seen.set(value, snapshot);
      snapshot.elements = this.serializeDebugSnapshotValue(
        value.elements,
        seen,
      ) as unknown[];
      return snapshot;
    }

    if (Array.isArray(value)) {
      const snapshot: unknown[] = [];
      seen.set(value, snapshot);
      snapshot.push(
        ...value.map((item) => this.serializeDebugSnapshotValue(item, seen)),
      );
      return snapshot;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      return String(value);
    }

    const snapshot: Record<string, unknown> = {};
    seen.set(value, snapshot);
    for (const [key, nestedValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      snapshot[key] = this.serializeDebugSnapshotValue(nestedValue, seen);
    }
    return snapshot;
  }

  private getCallStackSnapshots(): DebugCallFrameSnapshot[] {
    return this.callStack.map((frame) => ({
      name: frame.name,
      returnAddress: frame.returnAddress,
    }));
  }

  private getLabelIndex(label: string): number {
    if (!this.labels.has(label))
      this.throwRuntimeError("interpreter.label_not_found", {
        label,
        availableLabels: [...this.labels.keys()].join(", "),
      });
    return this.labels.get(label)!;
  }

  private reading(): boolean {
    return (
      this.instructionPointer >= 0 &&
      this.instructionPointer < this.program.length
    );
  }

  private getCurrentScope(): Map<string, RuntimeSlot> {
    if (this.callStack.length > 0) {
      return this.callStack[this.callStack.length - 1].localScope;
    }
    return this.variables; // escopo global
  }

  private getVariable(name: string): unknown {
    return this.getVariableSlot(name).value;
  }

  private getVariableSlot(name: string): RuntimeSlot {
    // Procurar no escopo local primeiro
    if (this.callStack.length > 0) {
      const currentScope = this.callStack[this.callStack.length - 1].localScope;
      if (currentScope.has(name)) {
        return currentScope.get(name)!;
      }
    }

    // Se não encontrar, procurar no escopo global
    if (this.variables.has(name)) {
      return this.variables.get(name)!;
    }

    this.throwRuntimeError("interpreter.variable_not_found", {
      name,
      availableVariables: [...this.variables.keys()].join(", "),
    });
  }

  private declareVariable(name: string, type: string, value: unknown): void {
    const currentScope = this.getCurrentScope();
    if (isRuntimeArrayValue(value)) {
      currentScope.set(name, {
        type,
        value,
      });
      return;
    }
    currentScope.set(name, {
      type,
      value: coerceValueForType(type, value),
    });
  }

  private setVariable(name: string, value: unknown): void {
    const currentScope = this.getCurrentScope();
    const currentSlot = currentScope.get(name);

    if (currentSlot) {
      currentScope.set(name, {
        ...currentSlot,
        value: coerceValueForType(currentSlot.type, value),
      });
      return;
    }

    if (this.variables.has(name) && currentScope !== this.variables) {
      const globalSlot = this.variables.get(name)!;
      this.variables.set(name, {
        ...globalSlot,
        value: coerceValueForType(globalSlot.type, value),
      });
      return;
    }

    currentScope.set(name, { type: "dynamic", value });
  }

  private parseOrGetVariableWithScope(value: unknown): unknown {
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
      // Tentar parsear como número
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        return Number(value);
      }
      // Tentar obter variável
      try {
        return this.getVariable(value);
      } catch {
        // Se não for variável, retornar como string
        return value;
      }
    }
    return value;
  }

  private parseArrayDeclaration(
    value: unknown,
    instruction: Instruction,
  ): { mode: "fixed" | "dynamic"; dimensions: number; sizes: number[] } {
    if (typeof value !== "string") {
      this.throwRuntimeError(
        "interpreter.runtime_error",
        { value },
        instruction,
      );
    }

    const parsed = JSON.parse(value) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("mode" in parsed) ||
      !("dimensions" in parsed) ||
      !("sizes" in parsed)
    ) {
      this.throwRuntimeError(
        "interpreter.runtime_error",
        { value },
        instruction,
      );
    }

    const declaration = parsed as {
      mode: "fixed" | "dynamic";
      dimensions: number;
      sizes: number[];
    };
    if (
      (declaration.mode !== "fixed" && declaration.mode !== "dynamic") ||
      typeof declaration.dimensions !== "number" ||
      !Array.isArray(declaration.sizes)
    ) {
      this.throwRuntimeError(
        "interpreter.runtime_error",
        { value },
        instruction,
      );
    }

    return declaration;
  }
}

export { RuntimeError } from "./runtime-error";
