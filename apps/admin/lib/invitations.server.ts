import "server-only";

import type { Depot, Invitation, Profile } from "@routeforge/shared";

import type { AdminAuthSession } from "@/lib/auth";
import { createRouteForgeServerClient } from "@/lib/insforge/server";
import {
  adminInvitationDraft,
  adminInvitationFilterGroups,
  buildDepotOptions,
  formatAdminInvitationListItem,
} from "@/lib/invitations";

const invitationSelect = `
  id,
  company_id,
  email,
  role,
  invite_code,
  depot_id,
  status,
  expires_at,
  used_at,
  used_by,
  created_by,
  created_at
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

export async function loadAdminInvitationPageData(session: AdminAuthSession) {
  const client = await createRouteForgeServerClient();

  const [{ data: invitationRows }, { data: depotRows }] = await Promise.all([
    client.database
      .from("invitations")
      .select(invitationSelect)
      .eq("company_id", session.profile.company_id)
      .order("created_at", { ascending: false }),
    client.database
      .from("depots")
      .select(depotSelect)
      .eq("company_id", session.profile.company_id)
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  const invitations = (invitationRows ?? []) as Invitation[];
  const depots = (depotRows ?? []) as Depot[];
  const profileIds = Array.from(
    new Set(invitations.flatMap((row) => [row.created_by, row.used_by]).filter(Boolean)),
  ) as string[];

  const { data: profileRows } = profileIds.length
    ? await client.database.from("profiles").select(profileSelect).in("id", profileIds)
    : { data: [] };

  const depotById = new Map(depots.map((depot) => [depot.id, depot]));
  const profileById = new Map(
    ((profileRows ?? []) as Profile[]).map((profile) => [profile.id, profile]),
  );

  return {
    depotOptions: buildDepotOptions(depots),
    filters: adminInvitationFilterGroups,
    initialInvitations: invitations.map((invitation) =>
      formatAdminInvitationListItem({
        creator: profileById.get(invitation.created_by) ?? null,
        depot: invitation.depot_id ? depotById.get(invitation.depot_id) ?? null : null,
        invitation,
      }),
    ),
    invitationDraft: adminInvitationDraft,
  };
}
