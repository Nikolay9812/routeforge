import "server-only";

import type { Depot, Profile, ProfileDepotAccess } from "@routeforge/shared";

import type { AdminAuthSession } from "@/lib/auth";
import {
  adminDispatcherFilterGroups,
  formatAdminDispatcherDepotOption,
  formatAdminDispatcherListItem,
  getAdminDispatcherSummary,
} from "@/lib/dispatchers";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

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
  updated_at
`;

const depotSelect = `
  id,
  company_id,
  name,
  code,
  address_line_1,
  postal_code,
  city,
  country_code,
  latitude,
  longitude,
  geofence_radius_meters,
  is_active,
  created_at,
  updated_at
`;

const accessSelect = `
  id,
  company_id,
  profile_id,
  depot_id,
  created_by,
  created_at
`;

export async function loadAdminDispatcherPageData(session: AdminAuthSession) {
  if (session.profile.role !== "admin") {
    return {
      canManage: false,
      depotOptions: [],
      dispatchers: [],
      error: "Nur aktive Admins koennen Dispatcher-Depot-Zugriff verwalten.",
      filters: adminDispatcherFilterGroups,
      summary: getAdminDispatcherSummary([]),
    };
  }

  const client = await createRouteForgeServerClient();
  const [{ data: profileRows, error: profileError }, { data: depotRows }] =
    await Promise.all([
      client.database
        .from("profiles")
        .select(profileSelect)
        .eq("company_id", session.profile.company_id)
        .eq("role", "dispatcher")
        .order("status", { ascending: false })
        .order("full_name", { ascending: true }),
      client.database
        .from("depots")
        .select(depotSelect)
        .eq("company_id", session.profile.company_id)
        .order("is_active", { ascending: false })
        .order("name", { ascending: true }),
    ]);

  if (profileError) {
    return {
      canManage: true,
      depotOptions: [],
      dispatchers: [],
      error: "Dispatcher konnten nicht geladen werden.",
      filters: adminDispatcherFilterGroups,
      summary: getAdminDispatcherSummary([]),
    };
  }

  const profiles = (profileRows ?? []) as Profile[];
  const depots = (depotRows ?? []) as Depot[];
  const profileIds = profiles.map((profile) => profile.id);
  const { data: accessRows } = profileIds.length
    ? await client.database
        .from("profile_depot_access")
        .select(accessSelect)
        .eq("company_id", session.profile.company_id)
        .in("profile_id", profileIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const depotsById = new Map(depots.map((depot) => [depot.id, depot]));
  const accessByProfileId = groupAccessByProfileId(
    (accessRows ?? []) as ProfileDepotAccess[],
  );
  const dispatchers = profiles.map((profile) =>
    formatAdminDispatcherListItem({
      accessRows: accessByProfileId.get(profile.id) ?? [],
      depotsById,
      profile,
    }),
  );

  return {
    canManage: true,
    depotOptions: depots.map(formatAdminDispatcherDepotOption),
    dispatchers,
    error: null,
    filters: adminDispatcherFilterGroups,
    summary: getAdminDispatcherSummary(dispatchers),
  };
}

function groupAccessByProfileId(accessRows: ProfileDepotAccess[]) {
  const grouped = new Map<string, ProfileDepotAccess[]>();

  for (const access of accessRows) {
    const rows = grouped.get(access.profile_id) ?? [];
    rows.push(access);
    grouped.set(access.profile_id, rows);
  }

  return grouped;
}
