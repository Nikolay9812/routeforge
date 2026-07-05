import { createClient } from "@insforge/sdk";

export const insforge = createClient({
  anonKey: process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY,
  baseUrl: process.env.EXPO_PUBLIC_INSFORGE_URL,
});
