import { Instruction } from "../interpreter/constants";
import { functionCall } from "../grammar/syntax/function-call";
import { IssueError, IssueInfo, IssueWarning } from "../issue";
import { Emitter } from "../ir/emitter";
import { Token } from "./";
import { TOKENS } from "./constants";
import { translate } from "../i18n";
import type { OperatorWordMap } from "../lexer/config";

interface LoopContext {
  breakLabel: string;
  continueLabel: string;
}

interface SwitchContext {
  breakLabel: string;
}

export type ScalarType =
  | "int"
  | "float"
  | "string"
  | "bool"
  | "void"
  | "dynamic"
  | "unknown";

export type ValueType = ScalarType;

export type SymbolDescriptor =
  | { kind: "scalar"; type: ScalarType }
  | {
      kind: "array";
      baseType: ScalarType;
      dimensions: number;
      arrayMode: "fixed" | "dynamic";
      sizes: number[];
    };

export type FunctionParameterDescriptor =
  | { kind: "scalar"; type: ValueType }
  | {
      kind: "array";
      baseType: ScalarType;
      dimensions: number;
      arrayMode: "fixed" | "dynamic";
      sizes: number[];
    };

export type FunctionSignature = {
  returnType: ValueType;
  params: FunctionParameterDescriptor[];
};

type Scope = Map<string, SymbolDescriptor>;

export type ExprResult = {
  place: string;
  type: ValueType;
  token: Token;
};

export type GrammarConfig = {
  semicolonMode?: "optional-eol" | "required";
  blockMode?: "delimited" | "indentation";
  typingMode?: "typed" | "untyped";
  arrayMode?: "fixed" | "dynamic";
};

type TokenIteratorConfig = {
  locale?: string;
  grammar?: GrammarConfig;
  operatorWordMap?: OperatorWordMap;
  statementTerminatorLexeme?: string;
};

export class TokenIterator {
  private tokens: Token[];
  private index: number;
  public readonly emitter: Emitter;
  private loopStack: LoopContext[];
  private switchStack: SwitchContext[];
  private breakStack: string[];
  private locale: string | undefined;
  private grammar: GrammarConfig | undefined;
  private statementTerminatorLexeme: string | undefined;
  private warnings: IssueWarning[];
  private infos: IssueInfo[];
  private scopes: Scope[];
  private functions: Map<string, FunctionSignature>;
  private currentFunctionReturnType: ValueType | null;

  constructor(tokens: Token[], localeOrConfig?: string | TokenIteratorConfig) {
    const config: TokenIteratorConfig =
      typeof localeOrConfig === "string"
        ? { locale: localeOrConfig }
        : (localeOrConfig ?? {});

    this.tokens = tokens;
    this.index = 0;
    this.emitter = new Emitter();
    this.loopStack = [];
    this.switchStack = [];
    this.breakStack = [];
    this.locale = config.locale;
    this.grammar = config.grammar;
    this.statementTerminatorLexeme = config.statementTerminatorLexeme;
    this.warnings = [];
    this.infos = [];
    this.scopes = [new Map<string, SymbolDescriptor>()];
    this.functions = new Map<string, FunctionSignature>();
    this.currentFunctionReturnType = null;
  }

  peek(): Token {
    return this.tokens[this.index];
  }

  peekAt(offset: number): Token | undefined {
    return this.tokens[this.index + offset];
  }

  next(): Token {
    if (!this.hasNext()) {
      const last = this.tokens[this.tokens.length - 1];
      const code = "iterator.no_more_tokens";
      const message = translate(this.locale, code);
      throw new IssueError(code, message, last?.line ?? 1, last?.column ?? 1);
    }
    return this.tokens[this.index++];
  }

  consume(expectedType: number, expectedLexeme?: string): Token {
    const token = this.peek();
    const isDifferentType = token.type !== expectedType;
    const isDifferentLexeme = expectedLexeme && token.lexeme !== expectedLexeme;
    if (isDifferentType || isDifferentLexeme) {
      const code = "iterator.unexpected_token";
      const expectedKey = TOKENS.BY_ID[expectedType];
      const actualKey = TOKENS.BY_ID[token.type];
      const expectedTypeLabel = expectedKey
        ? translate(this.locale, `token.${expectedKey}`)
        : String(expectedType);
      const params = {
        line: token.line,
        column: token.column,
        expectedType: expectedLexeme
          ? `${expectedTypeLabel} (${expectedLexeme})`
          : expectedTypeLabel,
        actualType: actualKey
          ? translate(this.locale, `token.${actualKey}`)
          : String(token.type),
        lexeme: token.lexeme,
      };
      const message = translate(this.locale, code, params);
      throw new IssueError(code, message, token.line, token.column, params);
    }
    return this.next();
  }

  match(expectedType: number, expectedLexeme?: string): boolean {
    const token = this.peek();
    const isDifferentType = token.type !== expectedType;
    const isDifferentLexeme = expectedLexeme && token.lexeme !== expectedLexeme;
    return !isDifferentType && !isDifferentLexeme;
  }

  hasNext(): boolean {
    return this.index < this.tokens.length;
  }

  generateIntermediateCode(): Instruction[] {
    // Processar múltiplas funções
    while (this.hasNext()) {
      functionCall(this);
    }
    return this.emitter.getInstructions();
  }

  pushLoopContext(breakLabel: string, continueLabel: string): void {
    this.loopStack.push({ breakLabel, continueLabel });
    this.breakStack.push(breakLabel);
  }

  popLoopContext(): void {
    this.loopStack.pop();
    this.breakStack.pop();
  }

  pushSwitchContext(breakLabel: string): void {
    this.switchStack.push({ breakLabel });
    this.breakStack.push(breakLabel);
  }

  popSwitchContext(): void {
    this.switchStack.pop();
    this.breakStack.pop();
  }

  getCurrentBreakLabel(): string | null {
    return this.breakStack[this.breakStack.length - 1] ?? null;
  }

  getCurrentContinueLabel(): string | null {
    if (this.loopStack.length === 0) return null;
    return this.loopStack[this.loopStack.length - 1].continueLabel;
  }

  throwError(
    code: string,
    line: number,
    column: number,
    params?: Record<string, string | number | boolean>,
  ): never {
    const message = translate(this.locale, code, params);
    throw new IssueError(code, message, line, column, params);
  }

  addWarning(
    code: string,
    line: number,
    column: number,
    params?: Record<string, string | number | boolean>,
  ): void {
    const message = translate(this.locale, code, params);
    this.warnings.push(new IssueWarning(code, message, line, column, params));
  }

  addInfo(
    code: string,
    line: number,
    column: number,
    params?: Record<string, string | number | boolean>,
  ): void {
    const message = translate(this.locale, code, params);
    this.infos.push(new IssueInfo(code, message, line, column, params));
  }

  getWarnings(): IssueWarning[] {
    return [...this.warnings];
  }

  getInfos(): IssueInfo[] {
    return [...this.infos];
  }

  enterScope(): void {
    this.scopes.push(new Map<string, SymbolDescriptor>());
  }

  exitScope(): void {
    if (this.scopes.length > 1) {
      this.scopes.pop();
    }
  }

  declareSymbol(name: string, type: ValueType): void {
    this.declareSymbolDescriptor(name, { kind: "scalar", type });
  }

  declareSymbolDescriptor(name: string, descriptor: SymbolDescriptor): void {
    this.scopes[this.scopes.length - 1]?.set(name, descriptor);
  }

  resolveSymbol(name: string): ValueType {
    const descriptor = this.resolveSymbolDescriptor(name);
    if (descriptor.kind === "array") {
      return descriptor.baseType;
    }
    return descriptor.type;
  }

  resolveSymbolDescriptor(name: string): SymbolDescriptor {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const resolved = this.scopes[i]?.get(name);
      if (resolved) return resolved;
    }
    return { kind: "scalar", type: "unknown" };
  }

  declareFunction(
    name: string,
    returnType: ValueType,
    params: Array<ValueType | FunctionParameterDescriptor>,
  ): void {
    const normalizedParams: FunctionParameterDescriptor[] = params.map(
      (param): FunctionParameterDescriptor =>
        typeof param === "string" ? { kind: "scalar", type: param } : param,
    );

    this.functions.set(name, {
      returnType,
      params: normalizedParams,
    });
  }

  resolveFunction(name: string): FunctionSignature | null {
    return this.functions.get(name) ?? null;
  }

  setCurrentFunctionReturnType(type: ValueType | null): void {
    this.currentFunctionReturnType = type;
  }

  getCurrentFunctionReturnType(): ValueType | null {
    return this.currentFunctionReturnType;
  }

  warnIfLossyIntConversion(
    targetType: ValueType,
    sourceType: ValueType,
    token: Token,
  ): void {
    if (targetType === "int" && sourceType === "float") {
      this.addWarning("grammar.lossy_int_conversion", token.line, token.column, {
        sourceType,
        targetType,
      });
      return;
    }

    if (
      targetType === "dynamic" ||
      sourceType === "dynamic" ||
      sourceType === "unknown" ||
      targetType === sourceType ||
      (targetType === "float" && sourceType === "int")
    ) {
      return;
    }

    this.addWarning("grammar.incompatible_type_conversion", token.line, token.column, {
      sourceType,
      targetType,
    });
  }

  warnIfLossyWriteToSymbol(
    symbolName: string,
    sourceType: ValueType,
    token: Token,
  ): void {
    this.warnIfLossyIntConversion(
      this.resolveSymbol(symbolName),
      sourceType,
      token,
    );
  }

  mapTokenTypeToSemanticType(tokenType: number): ScalarType {
    const { int, float, bool, string, void: voidType } = TOKENS.RESERVEDS;

    if (tokenType === int) return "int";
    if (tokenType === float) return "float";
    if (tokenType === bool) return "bool";
    if (tokenType === string) return "string";
    if (tokenType === voidType) return "void";

    return "unknown";
  }

  inferLiteralType(token: Token): ValueType {
    if (
      token.type === TOKENS.LITERALS.integer_literal ||
      token.type === TOKENS.LITERALS.hex_literal ||
      token.type === TOKENS.LITERALS.octal_literal
    ) {
      return "int";
    }
    if (token.type === TOKENS.LITERALS.float_literal) {
      return "float";
    }
    if (token.type === TOKENS.LITERALS.string_literal) {
      return "string";
    }
    if (
      token.type === TOKENS.RESERVEDS.true ||
      token.type === TOKENS.RESERVEDS.false
    ) {
      return "bool";
    }
    return "unknown";
  }

  createExprResult(place: string, type: ValueType, token: Token): ExprResult {
    return { place, type, token };
  }

  registerTemp(name: string, type: ValueType): void {
    this.declareSymbol(name, type);
  }

  mergeArithmeticTypes(left: ValueType, right: ValueType): ValueType {
    if (left === "float" || right === "float") return "float";
    if (left === "int" && right === "int") return "int";
    return "unknown";
  }

  getSemicolonMode(): "optional-eol" | "required" {
    return this.grammar?.semicolonMode ?? "optional-eol";
  }

  getStatementTerminatorLexeme(): string | undefined {
    return this.statementTerminatorLexeme;
  }

  getBlockMode(): "delimited" | "indentation" {
    return this.grammar?.blockMode ?? "delimited";
  }

  getTypingMode(): "typed" | "untyped" {
    return this.grammar?.typingMode ?? "typed";
  }

  getArrayMode(): "fixed" | "dynamic" | null {
    return this.grammar?.arrayMode ?? null;
  }

  isIndexType(type: ValueType): boolean {
    return type === "int" || type === "dynamic" || type === "unknown";
  }
}
