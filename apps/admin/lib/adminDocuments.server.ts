import "server-only";

import type {
  Depot,
  Document,
  DocumentType,
  MailboxCategory,
  Profile,
} from "@routeforge/shared";

import type { AdminAuthSession } from "@/lib/auth";
import {
  adminDocumentFilterGroups,
  adminDocumentTabs,
  adminDocumentUploadDraft,
  type AdminDocumentListItem,
  type AdminDocumentTone,
} from "@/lib/adminDocuments";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

export type AdminDocumentCourierOption = {
  depotName: string;
  name: string;
  profileId: string;
};

const documentSelect = `
  id,
  company_id,
  courier_profile_id,
  uploaded_by,
  document_type,
  title,
  storage_bucket,
  storage_path,
  mime_type,
  size_bytes,
  created_at
`;

const profileSelect = `
  id,
  primary_depot_id,
  full_name
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

export async function loadAdminDocumentPageData(session: AdminAuthSession) {
  const client = await createRouteForgeServerClient();
  const [{ data: documentRows }, { data: courierRows }] = await Promise.all([
    client.database
      .from("documents")
      .select(documentSelect)
      .eq("company_id", session.profile.company_id)
      .order("created_at", { ascending: false }),
    client.database
      .from("profiles")
      .select(profileSelect)
      .eq("company_id", session.profile.company_id)
      .eq("role", "courier")
      .in("status", ["pending_approval", "active"])
      .order("full_name", { ascending: true }),
  ]);

  const documents = (documentRows ?? []) as Document[];
  const couriers = (courierRows ?? []) as Profile[];
  const profileIds = Array.from(
    new Set(
      documents
        .flatMap((document) => [document.courier_profile_id, document.uploaded_by])
        .filter(Boolean),
    ),
  ) as string[];
  const depotIds = Array.from(
    new Set(couriers.map((courier) => courier.primary_depot_id).filter(Boolean)),
  ) as string[];

  const [{ data: profileRows }, { data: depotRows }] = await Promise.all([
    profileIds.length
      ? client.database.from("profiles").select(profileSelect).in("id", profileIds)
      : Promise.resolve({ data: [] }),
    depotIds.length
      ? client.database.from("depots").select(depotSelect).in("id", depotIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileById = new Map(
    ((profileRows ?? []) as Profile[]).map((profile) => [profile.id, profile]),
  );
  const courierById = new Map(couriers.map((courier) => [courier.id, courier]));
  const depotById = new Map(
    ((depotRows ?? []) as Depot[]).map((depot) => [depot.id, depot]),
  );
  const courierOptions = couriers.map((courier) =>
    formatCourierOption({
      courier,
      depot: courier.primary_depot_id
        ? depotById.get(courier.primary_depot_id) ?? null
        : null,
    }),
  );

  return {
    courierOptions,
    filters: adminDocumentFilterGroups,
    initialDocuments: documents.map((document) => {
      const courier = document.courier_profile_id
        ? courierById.get(document.courier_profile_id) ??
          profileById.get(document.courier_profile_id) ??
          null
        : null;
      const depot = courier?.primary_depot_id
        ? depotById.get(courier.primary_depot_id) ?? null
        : null;

      return formatAdminDocumentListItem({
        courier,
        depot,
        document,
        uploader: profileById.get(document.uploaded_by) ?? null,
      });
    }),
    tabs: adminDocumentTabs,
    uploadDraft: adminDocumentUploadDraft,
  };
}

export function formatAdminDocumentListItem({
  courier,
  depot,
  document,
  uploader,
}: {
  courier: Profile | null;
  depot: Depot | null;
  document: Document;
  uploader: Profile | null;
}): AdminDocumentListItem {
  return {
    ...document,
    courierName: courier?.full_name ?? null,
    depotName: depot?.name ?? "Kein Depot",
    documentTypeLabel: getDocumentTypeLabel(document.document_type),
    fileSizeLabel: formatFileSize(document.size_bytes),
    mailboxCategory: getMailboxCategory(document.document_type),
    retentionLabel: "Dauerhaft privat",
    status: "active",
    statusLabel: "Aktiv",
    statusTone: "success",
    uploadedAtLabel: formatDateTime(document.created_at),
    uploadedByName: uploader?.full_name ?? "RouteForge Admin",
    visibility: "courier_private",
    visibilityLabel: "Privat + Postfach",
    visibilityTone: "success",
  };
}

function formatCourierOption({
  courier,
  depot,
}: {
  courier: Profile;
  depot: Depot | null;
}): AdminDocumentCourierOption {
  return {
    depotName: depot?.name ?? "Kein Depot",
    name: courier.full_name,
    profileId: courier.id,
  };
}

function getDocumentTypeLabel(documentType: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    contract: "Vertrag",
    instruction: "Anweisung",
    notice: "Hinweis",
    other: "Nachweis",
    payslip: "Lohnabrechnung",
  };

  return labels[documentType];
}

function getMailboxCategory(documentType: DocumentType): MailboxCategory {
  if (documentType === "payslip") {
    return "payslip";
  }

  if (documentType === "contract") {
    return "contract";
  }

  if (documentType === "notice") {
    return "notice";
  }

  return "document";
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

function formatDateTime(dateTime: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateTime));
}

export function getDocumentTone(documentType: DocumentType): AdminDocumentTone {
  if (documentType === "payslip") {
    return "success";
  }

  if (documentType === "contract") {
    return "info";
  }

  if (documentType === "notice") {
    return "warning";
  }

  return "neutral";
}
