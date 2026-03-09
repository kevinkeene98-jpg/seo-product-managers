import { NextResponse } from "next/server";
import { getSessionToken, clearSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await clearSession(token);
  }

  // Clear the cookie — middleware will issue a new anonymous one on next request
  const cookieStore = await cookies();
  cookieStore.delete("spm_session");

  return NextResponse.json({ ok: true });
}
