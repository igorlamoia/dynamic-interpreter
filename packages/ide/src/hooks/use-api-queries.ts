import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { localApi } from "@/lib/local-api";
import { queryKeys } from "@/lib/query-keys";
import type { AuthUser } from "@/contexts/AuthContext";
import type { Exercise, ExerciseList } from "@/types/api";
import type { ClassOption } from "@/views/exercise-lists/components/types";

type CreateClassInput = {
  name: string;
  description: string;
  accessCode: string;
};

type CreateExerciseInput = {
  classId?: string | null;
  title: string;
  description: string;
  gradeWeight?: string;
  languagePolicy?: "OPEN" | "LOCKED";
  lockedLanguageId?: number | null;
  testCases: Array<{
    label: string;
    input: string;
    expectedOutput: string;
  }>;
};

type CreateExerciseListInput = {
  title: string;
  description?: string;
};

type PublishExerciseListInput = {
  listId: string;
  classId: number;
  totalGrade: number;
  minRequired: number;
  deadline: string;
};

type GradeSubmissionInput = {
  submissionId: string | number;
  score: number;
  teacherFeedback: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: string;
  organizationId: string;
};

export function useAuthProfileQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: async () => {
      const { data } = await api.get<AuthUser>("/auth/me");
      return data;
    },
    enabled,
    retry: false,
  });
}

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: queryKeys.organizations.all,
    queryFn: async () => {
      const { data } = await api.get<Array<{ id: number; name: string }>>(
        "/organizations",
      );
      return data;
    },
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<{
        accessToken: string;
        user?: AuthUser;
      }>("/auth/login", input);

      if (data.user) return data;

      const { data: user } = await api.get<AuthUser>("/auth/me", {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });

      return { ...data, user };
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await api.post<{ accessToken: string }>(
        "/auth/register",
        input,
      );
      const { data: user } = await api.get<AuthUser>("/auth/me", {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });

      return { ...data, user };
    },
  });
}

export function useClassesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: async () => {
      const { data } = await api.get<any[]>("/classes");
      return data;
    },
    enabled,
  });
}

export function useClassMembersQuery(
  classId: string | number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.classes.members(classId),
    queryFn: async () => {
      const { data } = await api.get(`/classes/${classId}/members`);
      return data;
    },
    enabled: enabled && Boolean(classId),
  });
}

export function useClassExerciseListsQuery(
  classId: string | number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.classes.exerciseLists(classId),
    queryFn: async () => {
      const { data } = await api.get<any[]>(`/classes/${classId}/exercise-lists`);
      return data;
    },
    enabled: enabled && Boolean(classId),
  });
}

export function useExercisesQuery(
  params?: Record<string, unknown>,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.exercises.list(params),
    queryFn: async () => {
      const { data } = await api.get<Exercise[]>("/exercises", { params });
      return data;
    },
    enabled,
  });
}

export function useExerciseQuery(
  exerciseId: string | number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(exerciseId),
    queryFn: async () => {
      const { data } = await api.get(`/exercises/${exerciseId}`);
      return data;
    },
    enabled: enabled && Boolean(exerciseId),
  });
}

export function useExerciseListsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.exerciseLists.all,
    queryFn: async () => {
      const { data } = await api.get<ExerciseList[]>("/exercise-lists");
      return data;
    },
    enabled,
  });
}

export function useExerciseListQuery(
  listId: string | number | undefined,
  params?: Record<string, unknown>,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.exerciseLists.detail(listId, params),
    queryFn: async () => {
      const { data } = await api.get<ExerciseList>(`/exercise-lists/${listId}`, {
        params,
      });
      return data;
    },
    enabled: enabled && Boolean(listId),
  });
}

export function useClassOptionsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: async () => {
      const { data } = await api.get<ClassOption[]>("/classes");
      return data;
    },
    enabled,
  });
}

export function useSubmissionQuery(
  submissionId: string | number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.submissions.detail(submissionId),
    queryFn: async () => {
      const { data } = await api.get(`/submissions/${submissionId}`);
      return data;
    },
    enabled: enabled && Boolean(submissionId),
    retry: false,
  });
}

export function useExerciseSubmissionsQuery(
  exerciseId: string | number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.submissions.byExercise(exerciseId),
    queryFn: async () => {
      const { data } = await api.get(`/submissions?exerciseId=${exerciseId}`);
      return data;
    },
    enabled: enabled && Boolean(exerciseId),
  });
}

export function useExerciseListSubmissionsQuery(
  exerciseIds: Array<string | number>,
  enabled = true,
) {
  return useQuery({
    queryKey: ["submissions", "exercise-list", exerciseIds] as const,
    queryFn: async () => {
      const results = await Promise.all(
        exerciseIds.map(async (exerciseId) => {
          const response = await api.get<unknown[]>(
            `/submissions?exerciseId=${exerciseId}`,
          );
          return response.data;
        }),
      );
      return results.flat();
    },
    enabled: enabled && exerciseIds.length > 0,
  });
}

export function useCreateClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClassInput) => {
      const { data } = await api.post("/classes", input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
    },
  });
}

export function useJoinClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accessCode: string) => {
      const { data } = await api.post("/classes/join", { accessCode });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
    },
  });
}

export function useCreateExerciseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateExerciseInput) => {
      const { data } = await api.post("/exercises", input);
      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
      if (variables.classId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.classes.exerciseLists(variables.classId),
        });
      }
    },
  });
}

export function useDeleteExerciseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exerciseId: string | number) => {
      await api.delete(`/exercises/${exerciseId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.exerciseLists.all,
      });
    },
  });
}

export function useCreateExerciseListMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateExerciseListInput) => {
      const { data } = await api.post("/exercise-lists", input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.exerciseLists.all,
      });
    },
  });
}

export function useAddExerciseToListMutation(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exerciseId: string) => {
      const { data } = await api.post(`/exercise-lists/${listId}/exercises`, {
        exerciseId,
        gradeWeight: 1,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.exerciseLists.all,
      });
    },
  });
}

export function useRemoveExerciseFromListMutation(listId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exerciseId: string) => {
      await api.delete(
        `/exercise-lists/${listId}/exercises?exerciseId=${exerciseId}`,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.exerciseLists.all,
      });
    },
  });
}

export function usePublishExerciseListMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PublishExerciseListInput) => {
      const { listId, ...body } = input;
      const { data } = await api.post(`/exercise-lists/${listId}/publish`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.exerciseLists.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.classes.exerciseLists(variables.classId),
      });
    },
  });
}

export function useGradeSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GradeSubmissionInput) => {
      const { submissionId, ...body } = input;
      const { data } = await api.patch(`/submissions/${submissionId}`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.submissions.detail(variables.submissionId),
      });
    },
  });
}

export function useValidateSubmissionMutation() {
  return useMutation({
    mutationFn: async ({
      payload,
      params,
      headers,
    }: {
      payload: Record<string, unknown>;
      params?: Record<string, unknown>;
      headers?: Record<string, string>;
    }) => {
      const { data } = await localApi.post("/submissions/validate", payload, {
        params,
        headers,
      });
      return data;
    },
  });
}
