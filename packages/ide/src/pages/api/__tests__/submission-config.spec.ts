import { describe, expect, it, vi } from "vitest";

const {
  LexerMock,
  scanTokensMock,
  TokenIteratorMock,
  generateIntermediateCodeMock,
  findUniqueMock,
  buildEffectiveKeywordMapMock,
} = vi.hoisted(() => {
  const scanTokensMock = vi.fn(() => [{ type: "IDENT" }]);
  const LexerMock = vi.fn(function LexerMock() {
    return {
      scanTokens: scanTokensMock,
      warnings: [],
      infos: [],
    };
  });

  const generateIntermediateCodeMock = vi.fn(() => []);
  const TokenIteratorMock = vi.fn(function TokenIteratorMock() {
    return {
      generateIntermediateCode: generateIntermediateCodeMock,
    };
  });

  const findUniqueMock = vi.fn(async () => ({ testCases: [] }));
  const buildEffectiveKeywordMapMock = vi.fn((keywordMap) => keywordMap ?? {});

  return {
    LexerMock,
    scanTokensMock,
    TokenIteratorMock,
    generateIntermediateCodeMock,
    findUniqueMock,
    buildEffectiveKeywordMapMock,
  };
});

vi.mock("@ts-compilator-for-java/compiler/src/lexer", () => ({
  Lexer: LexerMock,
}));
vi.mock("@ts-compilator-for-java/compiler/token/TokenIterator", () => ({
  TokenIterator: TokenIteratorMock,
}));
vi.mock("@ts-compilator-for-java/compiler/issue", () => ({
  IssueError: class extends Error {
    details: { line: number; message: string };
    constructor(message: string, details: { line: number; message: string }) {
      super(message);
      this.details = details;
    }
  },
}));
vi.mock("@ts-compilator-for-java/compiler/interpreter", () => ({
  Interpreter: class {
    execute = vi.fn().mockResolvedValue(undefined);
  },
}));
vi.mock("@ts-compilator-for-java/compiler/interpreter/constants", () => ({
  Instruction: class {},
}));
vi.mock("@/lib/keyword-map", () => ({
  buildEffectiveKeywordMap: buildEffectiveKeywordMapMock,
}));

const axiosGetMock = vi.fn();
const axiosPostMock = vi.fn();
vi.mock("axios", () => ({
  default: {
    get: (...args: any[]) => axiosGetMock(...args),
    post: (...args: any[]) => axiosPostMock(...args),
    isAxiosError: vi.fn(),
  },
}));

import handler from "../submissions/validate";

describe("/api/submissions/validate config propagation", () => {
  it("normalizes payload and passes config to lexer and iterator", async () => {
    axiosGetMock.mockResolvedValueOnce({ data: { testCases: [] } });

    const req = {
      method: "POST",
      headers: { "x-user-id": "student-1" },
      query: { dryRun: "true" },
      body: {
        exerciseId: "exercise-1",
        sourceCode: "main() { print(1) }",
        locale: "pt-BR",
        keywordMap: { exibir: 33 },
        operatorWordMap: { logical_and: "and" },
        booleanLiteralMap: { true: "yes", false: "no" },
        statementTerminatorLexeme: "@@",
        indentationBlock: false,
        blockDelimiters: { open: "begin", close: "end" },
        grammar: {
          semicolonMode: "required",
          blockMode: "indentation",
          typingMode: "untyped",
          arrayMode: "dynamic",
        },
      },
    } as any;

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as any;

    await handler(req, res);

    expect(LexerMock).toHaveBeenCalledWith("main() { print(1) }", {
      customKeywords: { exibir: 33 },
      operatorWordMap: { logical_and: "and" },
      booleanLiteralMap: { true: "yes", false: "no" },
      statementTerminatorLexeme: "@@",
      blockDelimiters: undefined,
      indentationBlock: true,
    });

    expect(TokenIteratorMock).toHaveBeenCalledWith([{ type: "IDENT" }], {
      locale: "pt-BR",
      grammar: {
        semicolonMode: "required",
        blockMode: "indentation",
        typingMode: "untyped",
        arrayMode: "dynamic",
      },
      statementTerminatorLexeme: "@@",
    });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        valid: true,
        errors: [],
      }),
    );
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it("handles dryRun test execution without saving submission", async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        testCases: [
          { label: "Caso 1", input: "1\n2", expectedOutput: "3", orderIndex: 0 },
        ],
      },
    });

    const req = {
      method: "POST",
      headers: { "x-user-id": "student-1" },
      query: { dryRun: "true" },
      body: {
        exerciseId: "exercise-1",
        sourceCode: "main() { }",
      },
    } as any;

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(axiosPostMock).not.toHaveBeenCalled();
    const responseData = json.mock.calls[0][0];
    expect(responseData.testCaseResults).toBeDefined();
    expect(responseData.testCasesTotal).toBe(1);
  });
});
