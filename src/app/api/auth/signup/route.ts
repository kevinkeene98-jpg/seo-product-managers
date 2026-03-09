import { NextResponse } from "next/server";
import { getSessionToken, linkSessionToUser } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/queries/users";
import { migrateSessionToUser } from "@/lib/queries/migrate-session";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Check if user already exists
  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const user = await createUser(email, password, name);

  // Link current session to the new user
  const token = await getSessionToken();
  if (token) {
    await linkSessionToUser(token, user.id);
    // Migrate anonymous work to the new account
    await migrateSessionToUser(token, user.id);
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
    },
  });
}
