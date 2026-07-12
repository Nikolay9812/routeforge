import { createClient } from "@insforge/sdk";

const baseUrl = process.env.EXPO_PUBLIC_INSFORGE_URL;
const anonKey = process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  throw new Error(
    "RouteForge mobile InsForge config is missing. Set EXPO_PUBLIC_INSFORGE_URL and EXPO_PUBLIC_INSFORGE_ANON_KEY.",
  );
}

export const insforge = createClient({
  anonKey,
  baseUrl,
});

export const insforgeBaseUrl = baseUrl;
