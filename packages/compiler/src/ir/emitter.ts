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
    this.instructions.push({ op, result, operand1, operand2, source });
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
