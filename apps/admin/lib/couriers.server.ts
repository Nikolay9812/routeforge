import "server-only";

import type { AuditLog, Depot, Profile, Shift } from "@routeforge/shared";

import type { AdminAuthSession } from "@/lib/auth";
import {
  adminCourierFilterGroups,
  formatAdminCourierListItem,
  formatAdminCourierProfile,
  getAdminCourierSummary,
} from "@/lib/couriers";
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

const shiftSummarySelect = `
  id,
  company_id,
  depot_id,
  courier_profile_id,
  shift_date,
  net_minutes,
  billable_minutes,
  status
`;

const auditLogSelect = `
  id,
  company_id,
  actor_profile_id,
  target_table,
  target_id,
  action,
  before,
  after,
  reason,
  created_at
`;

export async function loadAdminCourierPageData(session: AdminAuthSession) {
  const client = await createRouteForgeServerClient();
  const { data: profileRows } = await client.database
    .from("profiles")
    .select(profileSelect)
    .eq("company_id", session.profile.company_id)
    .eq("role", "courier")
    .order("status", { ascending: false })
    .order("full_name", { ascending: true });

  const profiles = (profileRows ?? []) as Profile[];
  const depotIds = Array.from(
    new Set(profiles.map((profile) => profile.primary_depot_id).filter(Boolean)),
  ) as string[];
  const profileIds = profiles.map((profile) => profile.id);

  const [{ data: depotRows }, { data: shiftRows }] = await Promise.all([
    depotIds.length
      ? client.database.from("depots").select(depotSelect).in("id", depotIds)
      : Promise.resolve({ data: [] }),
    profileIds.length
      ? client.database
          .from("shifts")
          .select(shiftSummarySelect)
          .in("courier_profile_id", profileIds)
          .order("shift_date", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const depotById = new Map(
    ((depotRows ?? []) as Depot[]).map((depot) => [depot.id, depot]),
  );
  const latestShiftByCourierId = getLatestShiftByCourierId(
    (shiftRows ?? []) as Shift[],
  );
  const couriers = profiles.map((profile) =>
    formatAdminCourierListItem({
      depot: profile.primary_depot_id
        ? depotById.get(profile.primary_depot_id) ?? null
        : null,
      lastShift: latestShiftByCourierId.get(profile.id) ?? null,
      profile,
    }),
  );

  return {
    couriers,
    filters: adminCourierFilterGroups,
    summary: getAdminCourierSummary(couriers),
  };
}

export async function loadAdminCourierProfileData({
  courierId,
  session,
}: {
  courierId: string;
  session: AdminAuthSession;
}) {
  const client = await createRouteForgeServerClient();
  const { data: profileRow } = await client.database
    .from("profiles")
    .select(profileSelect)
    .eq("company_id", session.profile.company_id)
    .eq("id", courierId)
    .eq("role", "courier")
    .limit(1)
    .maybeSingle();

  if (!profileRow) {
    return null;
  }

  const profile = profileRow as Profile;
  const [{ data: depotRows }, { data: shiftRows }, { data: auditRows }] =
    await Promise.all([
      profile.primary_depot_id
        ? client.database
            .from("depots")
            .select(depotSelect)
            .eq("id", profile.primary_depot_id)
            .limit(1)
        : Promise.resolve({ data: [] }),
      client.database
        .from("shifts")
        .select(shiftSummarySelect)
        .eq("courier_profile_id", profile.id)
        .order("shift_date", { ascending: false })
        .limit(5),
      client.database
        .from("audit_logs")
        .select(auditLogSelect)
        .eq("company_id", session.profile.company_id)
        .eq("target_table", "profiles")
        .eq("target_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const approvalActor =
    profile.approved_by && profile.approved_by !== session.profile.id
      ? await loadProfileById(profile.approved_by)
      : profile.approved_by
        ? session.profile
        : null;

  return formatAdminCourierProfile({
    approvalActor,
    auditLogs: (auditRows ?? []) as AuditLog[],
    depot: ((depotRows ?? []) as Depot[])[0] ?? null,
    profile,
    recentShifts: (shiftRows ?? []) as Shift[],
  });
}

async function loadProfileById(profileId: string): Promise<Profile | null> {
  const client = await createRouteForgeServerClient();
  const { data } = await client.database
    .from("profiles")
    .select(profileSelect)
    .eq("id", profileId)
    .limit(1)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

function getLatestShiftByCourierId(shifts: Shift[]) {
  const latestShiftByCourierId = new Map<string, Shift>();

  for (const shift of shifts) {
    if (!latestShiftByCourierId.has(shift.courier_profile_id)) {
      latestShiftByCourierId.set(shift.courier_profile_id, shift);
    }
  }

  return latestShiftByCourierId;
}
