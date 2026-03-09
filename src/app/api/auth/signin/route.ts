import { NextResponse } from "next/server";
import { getSessionToken, verifyPassword, linkSessionToUser } from "@/lib/auth";
import { getUserByEmail } from "@/lib/queries/users";
import { migrateSessionToUser } from "@/lib/queries/migrate-session";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Link current session to the user
  const token = await getSessionToken();
  if (token) {
    await linkSessionToUser(token, user.id);
    // Migrate any anonymous work from this session
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
