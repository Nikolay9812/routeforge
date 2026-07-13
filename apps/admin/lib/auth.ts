import "server-only";

import type { UserSchema } from "@insforge/sdk";
import type { Profile } from "@routeforge/shared/src/types";
import { redirect } from "next/navigation";

import type {
  AdminShellCompany,
  AdminShellUser,
} from "@/lib/adminShell";
import {
  createRouteForgeServerClient,
  getInsForgePublicConfig,
} from "@/lib/insforge/server";

const profileSelect = `
  id,
  auth_user_id,
  company_id,
  primary_depot_id,
  role,
  status,
  payment_mode,
  daily_fixed_minutes,
  hourly_max_minutes,
  preferred_language,
  full_name,
  email,
  phone,
  birth_date,
  address_line_1,
  postal_code,
  city,
  steuer_id,
  iban,
  id_card_document_url,
  driver_license_document_url,
  registration_document_url,
  bank_document_url,
  approved_at,
  approved_by,
  created_at,
  updated_at,
  companies(name, slug)
`;

type ProfileRow = Profile & {
  companies?:
    | {
        name: string | null;
        slug: string | null;
      }
    | {
        name: string | null;
        slug: string | null;
      }[]
    | null;
};

export type AdminAuthSession = {
  company: AdminShellCompany;
  profile: Profile;
  shellUser: AdminShellUser;
  user: UserSchema;
};

export function canUseAdminPanelProfile(profile: Pick<Profile, "role" | "status">) {
  return (
    profile.status === "active" &&
    (profile.role === "admin" || profile.role === "dispatcher")
  );
}

export async function loadProfileForAuthUser(
  client: Awaited<ReturnType<typeof createRouteForgeServerClient>>,
  authUserId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client.database
    .from("profiles")
    .select(profileSelect)
    .eq("auth_user_id", authUserId)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as unknown as ProfileRow;
}

export async function getCurrentAdminSession(): Promise<AdminAuthSession | null> {
  if (!getInsForgePublicConfig()) {
    return null;
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.auth.getCurrentUser();
  const user = data.user;

  if (error || !user) {
    return null;
  }

  const profile = await loadProfileForAuthUser(client, user.id);

  if (!profile || !canUseAdminPanelProfile(profile)) {
    return null;
  }

  return {
    company: buildAdminShellCompany(profile),
    profile,
    shellUser: buildAdminShellUser(profile),
    user,
  };
}

export async function requireAdminSession(): Promise<AdminAuthSession> {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

function buildAdminShellCompany(profile: ProfileRow): AdminShellCompany {
  const company = Array.isArray(profile.companies)
    ? profile.companies[0]
    : profile.companies;
  const companyName = company?.name || "RouteForge Workspace";
  const workspaceCode = buildWorkspaceCode(company?.slug ?? companyName);

  return {
    location: profile.city || "Firma",
    name: companyName,
    workspaceCode,
  };
}

function buildAdminShellUser(profile: Profile): AdminShellUser {
  return {
    initials: buildInitials(profile.full_name),
    name: profile.full_name,
    roleLabel: profile.role === "admin" ? "Admin" : "Dispatcher",
  };
}

function buildInitials(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "RF";
}

function buildWorkspaceCode(value: string): string {
  const compact = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return compact.slice(0, 3) || "RF";
}
