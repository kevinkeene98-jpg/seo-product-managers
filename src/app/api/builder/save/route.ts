import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getAuthUser } from "@/lib/auth";
import { updateApplicationField, linkApplicationToUser } from "@/lib/queries/applications";

const VALID_FIELDS = ["resumeContent", "coverLetterContent", "qaContent", "fitAssessment"] as const;

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const { applicationId, field, content } = await request.json();

  if (!applicationId || !field) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!VALID_FIELDS.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  // Link application to user if authenticated
  const authUser = await getAuthUser();
  if (authUser) {
    await linkApplicationToUser(applicationId, authUser.userId);
  }

  await updateApplicationField(applicationId, field, content);

  return NextResponse.json({ ok: true });
}
