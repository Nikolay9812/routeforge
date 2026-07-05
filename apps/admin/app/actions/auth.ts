"use server";

import { createAuthActions } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { canUseAdminPanelProfile, loadProfileForAuthUser } from "@/lib/auth";
import {
  createRouteForgeServerClientWithCookies,
  getInsForgePublicConfig,
  type AdminCookieStore,
} from "@/lib/insforge/server";

export type AdminLoginState = {
  email: string;
  error: string | null;
};

export async function signInAdminAction(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      email,
      error: "Bitte E-Mail und Passwort eingeben.",
    };
  }

  if (!getInsForgePublicConfig()) {
    return {
      email,
      error:
        "InsForge ist noch nicht konfiguriert. Bitte setze die Admin-Umgebungsvariablen.",
    };
  }

  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const { data, error } = await auth.signInWithPassword({ email, password });

  if (error || !data?.user) {
    return {
      email,
      error: "Anmeldung fehlgeschlagen. Bitte pruefe deine Zugangsdaten.",
    };
  }

  const profile = await loadProfileForAuthUser(
    createRouteForgeServerClientWithCookies(cookieStore as AdminCookieStore),
    data.user.id,
  );

  if (!profile || !canUseAdminPanelProfile(profile)) {
    await auth.signOut();

    return {
      email,
      error: "Dieser Zugang ist nicht fuer das Admin Panel freigegeben.",
    };
  }

  redirect("/admin/dashboard");
}

export async function signOutAdminAction() {
  const auth = createAuthActions({ cookies: await cookies() });
  await auth.signOut();
  redirect("/login");
}
