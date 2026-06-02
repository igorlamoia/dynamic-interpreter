export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
  organizations: {
    all: ["organizations"] as const,
  },
  classes: {
    all: ["classes"] as const,
    members: (classId: string | number | undefined) =>
      ["classes", classId, "members"] as const,
    exerciseLists: (classId: string | number | undefined) =>
      ["classes", classId, "exercise-lists"] as const,
  },
  exercises: {
    all: ["exercises"] as const,
    list: (params?: Record<string, unknown>) =>
      ["exercises", params ?? {}] as const,
    detail: (exerciseId: string | number | undefined) =>
      ["exercises", exerciseId] as const,
  },
  exerciseLists: {
    all: ["exercise-lists"] as const,
    detail: (
      listId: string | number | undefined,
      params?: Record<string, unknown>,
    ) => ["exercise-lists", listId, params ?? {}] as const,
  },
  submissions: {
    detail: (submissionId: string | number | undefined) =>
      ["submissions", submissionId] as const,
    byExercise: (exerciseId: string | number | undefined) =>
      ["submissions", "exercise", exerciseId] as const,
  },
  languages: {
    all: ["languages"] as const,
    detail: (id: number | undefined) => ["languages", id] as const,
    active: ["languages", "active"] as const,
  },
};
