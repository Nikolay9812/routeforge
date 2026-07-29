"use server";

import { randomUUID } from "crypto";

import type { Company, SupportedLanguage } from "@routeforge/shared";
import { supportedLanguageSchema } from "@routeforge/shared";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { createRouteForgeServerClient } from "@/lib/insforge/server";

export type CompanyStampUploadResult = {
  error: string | null;
  stampPath: string | null;
};

export type CompanySettingsActionState = {
  companyName: string | null;
  defaultLanguage: SupportedLanguage | null;
  error: string | null;
  message: string | null;
};

const companyAssetsBucket = "company-assets";
const maxStampSizeBytes = 2 * 1024 * 1024;

export async function updateCompanySettingsAction(
  _previousState: CompanySettingsActionState,
  formData: FormData,
): Promise<CompanySettingsActionState> {
  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return {
      companyName: null,
      defaultLanguage: null,
      error: "Nur aktive Admins koennen Firmeneinstellungen aendern.",
      message: null,
    };
  }

  const companyName = String(formData.get("name") ?? "").trim();
  const languageValue = String(formData.get("default_language") ?? "");
  const language = supportedLanguageSchema.safeParse(languageValue);

  if (!companyName) {
    return {
      companyName: null,
      defaultLanguage: null,
      error: "Firmenname ist erforderlich.",
      message: null,
    };
  }

  if (companyName.length > 120) {
    return {
      companyName: null,
      defaultLanguage: null,
      error: "Firmenname darf maximal 120 Zeichen haben.",
      message: null,
    };
  }

  if (!language.success) {
    return {
      companyName: null,
      defaultLanguage: null,
      error: "Standardsprache ist ungueltig.",
      message: null,
    };
  }

  const client = await createRouteForgeServerClient();
  const { data, error } = await client.database.rpc("update_company_settings", {
    p_default_language: language.data,
    p_name: companyName,
  });

  if (error || !data) {
    return {
      companyName: null,
      defaultLanguage: null,
      error:
        error?.message ?? "Firmeneinstellungen konnten nicht gespeichert werden.",
      message: null,
    };
  }

  const company = data as Company;

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/settings");

  return {
    companyName: company.name,
    defaultLanguage: company.default_language,
    error: null,
    message: "Firmeneinstellungen gespeichert.",
  };
}

export async function uploadCompanyStampAction(
  formData: FormData,
): Promise<CompanyStampUploadResult> {
  const session = await requireAdminSession();

  if (session.profile.role !== "admin") {
    return {
      error: "Nur aktive Admins koennen den Firmenstempel hochladen.",
      stampPath: null,
    };
  }

  const fileValue = formData.get("stamp");

  if (!(fileValue instanceof File)) {
    return { error: "Bitte eine PNG-Datei auswaehlen.", stampPath: null };
  }

  const fileError = validateStampFile(fileValue);

  if (fileError) {
    return { error: fileError, stampPath: null };
  }

  const client = await createRouteForgeServerClient();
  const { data: company, error: companyError } = await client.database
    .from("companies")
    .select("id, stamp_url")
    .eq("id", session.profile.company_id)
    .limit(1)
    .maybeSingle();

  if (companyError || !company) {
    return {
      error: "Firmenprofil konnte nicht geladen werden.",
      stampPath: null,
    };
  }

  const currentStampPath =
    typeof company.stamp_url === "string" ? company.stamp_url : null;
  const storagePath = buildStampStoragePath({
    companyId: session.profile.company_id,
    fileName: fileValue.name,
  });
  const upload = await client.storage.from(companyAssetsBucket).upload(storagePath, fileValue);

  if (upload.error || !upload.data) {
    return {
      error: upload.error?.message ?? "Stempel konnte nicht gespeichert werden.",
      stampPath: null,
    };
  }

  const uploadedPath = upload.data.key;
  const { data: updatedCompany, error: updateError } = await client.database
    .from("companies")
    .update({
      stamp_url: uploadedPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.profile.company_id)
    .select("stamp_url")
    .maybeSingle();

  if (updateError || !updatedCompany) {
    await client.storage.from(companyAssetsBucket).remove(uploadedPath);

    return {
      error: updateError?.message ?? "Stempel konnte nicht am Firmenprofil gespeichert werden.",
      stampPath: null,
    };
  }

  if (
    currentStampPath &&
    currentStampPath !== uploadedPath &&
    currentStampPath.startsWith(`companies/${session.profile.company_id}/assets/`)
  ) {
    await client.storage.from(companyAssetsBucket).remove(currentStampPath);
  }

  revalidatePath("/admin/settings");

  return {
    error: null,
    stampPath:
      typeof updatedCompany.stamp_url === "string"
        ? updatedCompany.stamp_url
        : uploadedPath,
  };
}

function validateStampFile(file: File): string | null {
  const fileName = file.name.toLowerCase();

  if (file.size <= 0 || file.size > maxStampSizeBytes) {
    return "PNG-Datei muss groesser als 0 Byte und maximal 2 MB sein.";
  }

  if (file.type !== "image/png" && !fileName.endsWith(".png")) {
    return "Der Firmenstempel muss eine PNG-Datei sein.";
  }

  return null;
}

function buildStampStoragePath({
  companyId,
  fileName,
}: {
  companyId: string;
  fileName: string;
}): string {
  const safeFileName = sanitizeFileName(fileName);

  return `companies/${companyId}/assets/stamp-${randomUUID()}-${safeFileName}`;
}

function sanitizeFileName(fileName: string): string {
  const fallback = "firmenstempel.png";
  const sanitized = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  if (!sanitized) {
    return fallback;
  }

  return sanitized.endsWith(".png") ? sanitized : `${sanitized}.png`;
}
