import type { Language } from "@/lib/languages-api"

export type ClassSummary = {
  id: number
  organizationId: number
  teacherId: number
  name: string
  description: string
  accessCode: string
  createdAt: string
  status: "ACTIVE" | "ARCHIVED"
  _count: {
    members: number
    exerciseLists: number
  }
  teacher: {
    id: number
    name: string
    email: string
    avatarUrl: string | null
    role: "ADMIN" | "TEACHER" | "STUDENT" | "COMMUNITY" | "SYSTEM"
  } | null
}

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TestCase = {
  id: number
  label: string
  input: string
  expectedOutput: string
  orderIndex: number
}

export type LanguagePolicy = "OPEN" | "LOCKED"

export type Exercise = {
  id: number
  teacherId: number
  title: string
  description: string
  createdAt: string
  testCases: TestCase[]
  languagePolicy: LanguagePolicy
  lockedLanguageId: number | null
  lockedLanguage: Language | null
  effectiveLanguage: Language | null
  effectiveLanguageSource: "exercise" | "list" | null
}

export type ExerciseListItem = {
  exerciseId: number
  gradeWeight: number
  orderIndex: number
  exercise: { id: number; title: string }
}

export type ClassPublication = {
  classId: number
  totalGrade: number
  minRequired: number
  deadline: string
  publishedAt?: string
}

export type ExerciseList = {
  id: number
  teacherId: number
  title: string
  description: string
  createdAt: string
  updatedAt: string
  items: ExerciseListItem[]
  classes: ClassPublication[]
  submittedExerciseIds?: number[]
  languagePolicy: LanguagePolicy
  lockedLanguageId: number | null
  lockedLanguage: Language | null
}
