import type { IDEPartialCompilerConfigPayload } from "@/entities/compiler-config";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";

export type TTestCaseResult = {
  label: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
};

export type TValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  submissionId?: string;
  testCaseResults?: TTestCaseResult[];
  testCasesPassed?: number;
  testCasesTotal?: number;
};

export type SubmissionLanguageSnapshot =
  | (Omit<IDEPartialCompilerConfigPayload, "blockDelimiters"> & {
      blockDelimiters?: { open: string; close: string } | null;
    })
  | StoredKeywordCustomization;

export type SubmissionDetail = {
  id: number;
  exerciseId: number;
  exerciseListId: number;
  classId: number;
  studentId: number;
  codeSnapshot: string;
  languageSnapshot: SubmissionLanguageSnapshot;
  testCaseResults: TTestCaseResult[];
  status: string;
  score: number | null;
  teacherFeedback: string | null;
  submittedAt: string;
  student?: {
    id: number;
    name: string;
    email: string;
  } | null;
  exercise?: {
    id: number;
    title: string;
    description?: string | null;
    gradeWeight?: number | null;
  } | null;
};
