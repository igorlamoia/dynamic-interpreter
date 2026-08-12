import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/lib/auth-cookies";
import { useAuthProfileQuery } from "@/hooks/use-api-queries";
import { queryKeys } from "@/lib/query-keys";

type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "COMMUNITY";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizationId: number | null;
};

type AuthPayload = {
  token: string;
  user?: AuthUser;
};

type AuthContextValue = {
  userId: number | null;
  organizationId: number | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isCommunity: boolean;
  isHydrated: boolean;
  isProfileLoading: boolean;
  login: (payload: AuthPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const profileQuery = useAuthProfileQuery(isHydrated && hasToken);
  const user = profileQuery.data ?? null;
  const userId = user?.id ?? null;
  const organizationId = user?.organizationId ?? null;
  const isProfileLoading = hasToken && profileQuery.isPending;

  useEffect(() => {
    const token = getAuthToken();

    setHasToken(Boolean(token));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (profileQuery.isError) {
      clearAuthToken();
      setHasToken(false);
      queryClient.removeQueries({ queryKey: queryKeys.auth.profile });
    }
  }, [profileQuery.isError, queryClient]);

  const login = useCallback(
    ({ token, user }: AuthPayload) => {
      setAuthToken(token);
      setHasToken(true);

      if (user) {
        queryClient.setQueryData(queryKeys.auth.profile, user);
        return;
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setHasToken(false);
    queryClient.clear();
  }, [queryClient]);

  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";
  const isCommunity = user?.role === "COMMUNITY";

  const value = useMemo<AuthContextValue>(
    () => ({
      userId,
      organizationId,
      user,
      isAuthenticated: Boolean(userId),
      isTeacher,
      isCommunity,
      isHydrated,
      isProfileLoading,
      login,
      logout,
    }),
    [
      isHydrated,
      isCommunity,
      isProfileLoading,
      isTeacher,
      login,
      logout,
      organizationId,
      user,
      userId,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
