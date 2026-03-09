import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "spm_session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE)) {
    // Generate a simple random ID (nanoid isn't available in edge runtime)
    const id = crypto.randomUUID();
    response.cookies.set(SESSION_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/builder/:path*",
    "/api/builder/:path*",
    "/api/auth/:path*",
    "/api/dashboard/:path*",
    "/dashboard/:path*",
  ],
};
