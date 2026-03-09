import { cookies } from "next/headers";

const SESSION_COOKIE = "spm_session";

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function requireSessionId(): Promise<string> {
  const id = await getSessionId();
  if (!id) throw new Error("No session");
  return id;
}
