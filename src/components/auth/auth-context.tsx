"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useUser, useClerk } from "@clerk/nextjs";

interface User {
  userId: number;
  email: string;
  name: string | null;
  subscriptionStatus: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  openAuthDialog: (trigger?: string) => void;
  closeAuthDialog: () => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch app-specific user data when Clerk auth state changes
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      refreshUser();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, refreshUser]);

  const openAuthDialog = useCallback(
    (_trigger?: string) => {
      clerk.openSignIn({
        fallbackRedirectUrl: window.location.href,
      });
    },
    [clerk]
  );

  const closeAuthDialog = useCallback(() => {
    clerk.closeSignIn();
  }, [clerk]);

  const signOut = useCallback(async () => {
    await clerk.signOut();
    setUser(null);
  }, [clerk]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, openAuthDialog, closeAuthDialog, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
