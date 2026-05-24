import {
  Instruction,
  OpName,
  SourceLocation,
} from "../interpreter/constants";

export class Emitter {
  private instructions: Instruction[] = [];
  private tempCounter = 0;
  private labelCounter = 0;

  emit(
    op: OpName,
    result: string,
    operand1: any,
    operand2: any,
    source?: SourceLocation,
  ) {
    const instruction: Instruction = { op, result, operand1, operand2 };

    if (source !== undefined) {
      instruction.source = source;
    }

    this.instructions.push(instruction);
  }

  emitFromToken(
    op: OpName,
    result: string,
    operand1: any,
    operand2: any,
    token?: { line: number; column: number },
  ) {
    this.emit(
      op,
      result,
      operand1,
      operand2,
      token ? { line: token.line, column: token.column } : undefined,
    );
  }

  newTemp(): string {
    return `__temp${this.tempCounter++}`;
  }

  newLabel(): string {
    return `__label${this.labelCounter++}`;
  }

  getInstructions(): Instruction[] {
    return this.instructions;
  }
}
