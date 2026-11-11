"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiLogin, apiLogout, apiRequest, type ApiUser } from "@/lib/api/api-client";
import {
  clearStoredTokens,
  hasStoredSession,
  setStoredTokens,
  subscribeToAdminSession,
} from "@/lib/api/auth-storage";

type AdminAuthContextValue = {
  user: ApiUser | null;
  ready: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  /** Re-reads the signed-in admin (e.g. after changing a temporary password). */
  reload(): Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
const adminSessionKey = ["admin", "session"] as const;
const subscribeNothing = () => () => {};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const hasSession = useSyncExternalStore(subscribeToAdminSession, hasStoredSession, () => false);
  // During hydration the server snapshot (no session) is used; never report "ready, signed out" until the stored
  // session has actually been read, or a reload or deep link to any Admin page bounces to the login screen.
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const sessionQuery = useQuery({
    queryKey: adminSessionKey,
    enabled: hasSession,
    retry: false,
    queryFn: async () => {
      const result = await apiRequest<{ user: ApiUser }>("/auth/me");
      if (result.user.role !== "admin") {
        clearStoredTokens();
        throw new Error("Administrator access is required");
      }
      return result.user;
    },
  });
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await apiLogin(email, password);
      if (result.user.role !== "admin") {
        clearStoredTokens();
        throw new Error("This account does not have administrator access");
      }
      setStoredTokens(result);
      queryClient.setQueryData(adminSessionKey, result.user);
    },
  });
  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSettled: () => queryClient.removeQueries({ queryKey: ["admin"] }),
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );
  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);
  const reload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: adminSessionKey });
  }, [queryClient]);
  const user = sessionQuery.data ?? null;
  const ready = hydrated && (!hasSession || sessionQuery.isSuccess || sessionQuery.isError);
  const value = useMemo(() => ({ user, ready, login, logout, reload }), [login, logout, reload, ready, user]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return value;
}
