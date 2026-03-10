import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionId } from "@/lib/session";
import { migrateSessionToUser } from "@/lib/queries/migrate-session";

/** Get the authenticated user from Clerk, bridging to our local DB */
export async function getAuthUser(): Promise<{
  userId: number;
  email: string;
  name: string | null;
  subscriptionStatus: string | null;
} | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  // Look up by clerkId
  let [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    // Check if email already exists (existing user linking to Clerk)
    [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (dbUser) {
      // Link existing user to Clerk
      await db
        .update(users)
        .set({ clerkId: clerkUser.id, updatedAt: new Date() })
        .where(eq(users.id, dbUser.id));
    } else {
      // Create new user
      [dbUser] = await db
        .insert(users)
        .values({
          clerkId: clerkUser.id,
          email: email.toLowerCase(),
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
            : null,
        })
        .returning();
    }

    // Migrate anonymous session data to this user
    const sessionId = await getSessionId();
    if (sessionId) {
      await migrateSessionToUser(sessionId, dbUser.id);
    }
  }

  return {
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    subscriptionStatus: dbUser.subscriptionStatus,
  };
}

/** Require an authenticated user, throws if not logged in */
export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
