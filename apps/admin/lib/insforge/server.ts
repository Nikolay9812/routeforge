import "server-only";

import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export type AdminCookieStore = Awaited<ReturnType<typeof cookies>>;

export type InsForgePublicConfig = {
  anonKey: string;
  baseUrl: string;
};

export function getInsForgePublicConfig(): InsForgePublicConfig | null {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    return null;
  }

  return { anonKey, baseUrl };
}

export function createRouteForgeServerClientWithCookies(cookieStore: AdminCookieStore) {
  const config = getInsForgePublicConfig();

  if (!config) {
    throw new Error("Missing public InsForge configuration.");
  }

  return createServerClient({
    ...config,
    cookies: cookieStore,
  });
}

export function createRouteForgeServerClientWithAccessToken(accessToken: string) {
  const config = getInsForgePublicConfig();

  if (!config) {
    throw new Error("Missing public InsForge configuration.");
  }

  return createServerClient({
    ...config,
    accessToken,
  });
}

export async function createRouteForgeServerClient() {
  return createRouteForgeServerClientWithCookies(await cookies());
}
