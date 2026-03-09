import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      userId: user.userId,
      email: user.email,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
    },
  });
}
