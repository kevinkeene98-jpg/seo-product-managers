"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { AuthDialog } from "./auth-dialog";

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTrigger, setDialogTrigger] = useState<string | undefined>();

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

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuthDialog = useCallback((trigger?: string) => {
    setDialogTrigger(trigger);
    setDialogOpen(true);
  }, []);

  const closeAuthDialog = useCallback(() => {
    setDialogOpen(false);
    setDialogTrigger(undefined);
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
  }, []);

  const handleAuthSuccess = useCallback(
    (newUser: User) => {
      setUser(newUser);
      closeAuthDialog();
    },
    [closeAuthDialog]
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, openAuthDialog, closeAuthDialog, signOut, refreshUser }}
    >
      {children}
      <AuthDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trigger={dialogTrigger}
        onSuccess={handleAuthSuccess}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
