import type { Language } from "@/lib/languages-api"

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
}
