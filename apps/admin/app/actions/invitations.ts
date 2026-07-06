"use server";

import type { Invitation } from "@routeforge/shared";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { createRouteForgeServerClient } from "@/lib/insforge/server";
import {
  formatAdminInvitationListItem,
  type AdminInvitationListItem,
} from "@/lib/invitations";

export type InvitationMutationResult = {
  error: string | null;
  invitation: AdminInvitationListItem | null;
};

export async function createInvitationAction(input: {
  depotId: string | null;
  email: string;
  expiresAt: string;
  role: "courier" | "dispatcher";
}): Promise<InvitationMutationResult> {
  const session = await requireAdminSession();
  const email = input.email.trim().toLowerCase();

  if (!email.includes("@")) {
    return { error: "Bitte eine gueltige E-Mail eingeben.", invitation: null };
  }

  if (session.profile.role !== "admin") {
    return {
      error: "Aktuell koennen nur Admins echte Einladungen erstellen.",
      invitation: null,
    };
  }

  const expiresAt = new Date(input.expiresAt);

  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    return {
      error: "Bitte ein Ablaufdatum in der Zukunft waehlen.",
      invitation: null,
    };
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc("create_invitation", {
    p_depot_id: input.depotId,
    p_email: email,
    p_expires_at: expiresAt.toISOString(),
    p_role: input.role,
  });

  if (error || !data) {
    return {
      error: error?.message ?? "Einladung konnte nicht erstellt werden.",
      invitation: null,
    };
  }

  const invitation = (Array.isArray(data) ? data[0] : data) as Invitation;
  revalidatePath("/admin/invitations");

  return {
    error: null,
    invitation: formatAdminInvitationListItem({
      creator: session.profile,
      depot: null,
      invitation,
    }),
  };
}

export async function revokeInvitationAction(
  invitationId: string,
): Promise<InvitationMutationResult> {
  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return {
      error: "Aktuell koennen nur Admins echte Einladungen widerrufen.",
      invitation: null,
    };
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc("revoke_invitation", {
    p_invitation_id: invitationId,
    p_reason: "Widerruf ueber Admin Einladungsseite",
  });

  if (error || !data) {
    return {
      error: error?.message ?? "Einladung konnte nicht widerrufen werden.",
      invitation: null,
    };
  }

  const invitation = (Array.isArray(data) ? data[0] : data) as Invitation;
  revalidatePath("/admin/invitations");

  return {
    error: null,
    invitation: formatAdminInvitationListItem({
      creator: session.profile,
      depot: null,
      invitation,
    }),
  };
}
