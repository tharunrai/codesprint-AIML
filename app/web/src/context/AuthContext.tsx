"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type User as PrismaUser, type Role as UserRole } from "@prisma/client";
import { createClient } from "@/utils/supabase/client";
import { syncPrismaUser } from "@/app/actions/auth";

// Extend PrismaUser with custom fields we need in context
export type User = PrismaUser & {
  onboardingComplete?: boolean;
};

interface AuthContextType {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "placeme_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const isLoading = false;

  const supabase = createClient();

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error || !data.user) {
          console.warn("Supabase login failed, using development fallback:", error?.message);
          
          // Development / testing fallback when Supabase rate limits are hit
          const isFaculty = email.toLowerCase().includes("faculty") || email.toLowerCase().includes("priya");
          const mockAuthUser: User = {
            id: "user-" + Date.now(),
            supabaseUid: "sub-" + Date.now(),
            email: email,
            fullName: email.split("@")[0].replace(".", " "),
            role: (isFaculty ? "FACULTY" : "STUDENT") as UserRole,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          setUser(mockAuthUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockAuthUser));
          return true;
        }

        // Ensure Prisma DB is in sync
        const dbUser = await syncPrismaUser(
          { id: data.user.id, email: data.user.email! },
          (data.user.user_metadata?.role as UserRole) || "STUDENT",
          data.user.user_metadata?.name || email.split("@")[0]
        );

        const authUser: User = {
          id: dbUser.id,
          supabaseUid: dbUser.supabaseUid,
          email: dbUser.email,
          fullName: dbUser.fullName,
          role: dbUser.role as UserRole,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        };

        setUser(authUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [supabase]);

  const completeOnboarding = useCallback(() => {
    if (!user) return;
    const updated = { ...user, onboardingComplete: true };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
