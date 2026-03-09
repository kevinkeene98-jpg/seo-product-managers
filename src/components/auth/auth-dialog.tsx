"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface User {
  userId: number;
  email: string;
  name: string | null;
  subscriptionStatus: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: string;
  onSuccess: (user: User) => void;
}

export function AuthDialog({ open, onOpenChange, trigger, onSuccess }: Props) {
  const [tab, setTab] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      const endpoint = tab === "signup" ? "/api/auth/signup" : "/api/auth/signin";
      const body =
        tab === "signup"
          ? { email, password, name: name || undefined }
          : { email, password };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }

        reset();
        onSuccess(data.user);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [tab, email, password, name, onSuccess, reset]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {trigger || "Sign in to your account"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as "signin" | "signup"); setError(null); }}>
          <TabsList className="w-full">
            <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <TabsContent value="signup" className="mt-0 space-y-3">
              <Input
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </TabsContent>

            <Input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password (min 8 characters)"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Loading..."
                : tab === "signup"
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
