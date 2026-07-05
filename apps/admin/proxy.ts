import { updateSession } from "@insforge/sdk/ssr/middleware";
import type { CookieStore } from "@insforge/sdk/ssr/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    return response;
  }

  await updateSession({
    anonKey,
    baseUrl,
    requestCookies: request.cookies as unknown as CookieStore,
    responseCookies: response.cookies as unknown as CookieStore,
  });

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
