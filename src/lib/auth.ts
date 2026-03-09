import { cookies } from "next/headers";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "spm_session";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Get the current session token from cookies */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

/** Get the authenticated user from the current session, or null */
export async function getAuthUser(): Promise<{
  userId: number;
  email: string;
  name: string | null;
  subscriptionStatus: string | null;
} | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const [session] = await db
    .select({
      userId: sessions.userId,
      email: users.email,
      name: users.name,
      subscriptionStatus: users.subscriptionStatus,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  // innerJoin guarantees userId is non-null, but Drizzle infers nullable from schema
  return session ? { ...session, userId: session.userId! } : null;
}

/** Require an authenticated user, throws if not logged in */
export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/** Link the current session to a user (used on signin/signup) */
export async function linkSessionToUser(token: string, userId: number): Promise<void> {
  // Check if this token already exists in sessions table
  const [existing] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (existing) {
    // Update existing session to link to user
    await db
      .update(sessions)
      .set({ userId, expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS) })
      .where(eq(sessions.token, token));
  } else {
    // Create a new session row
    await db.insert(sessions).values({
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
    });
  }
}

/** Clear the session (used on signout) — remove user link, middleware will issue a new anonymous token */
export async function clearSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}
