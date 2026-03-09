import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { updateSuggestionStatus } from "@/lib/queries/chat";

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const { messageId, status } = await request.json();

  if (!messageId || !["accepted", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await updateSuggestionStatus(messageId, status);

  return NextResponse.json({ ok: true });
}
