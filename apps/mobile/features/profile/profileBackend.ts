import type { Profile, SupportedLanguage } from "@routeforge/shared";
import * as ImageManipulator from "expo-image-manipulator";
import type { Action } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

import { insforge } from "@/lib/insforge-client";
import { uploadMobileStorageFile } from "@/lib/mobileStorageUpload";

export type ProfileDocumentKind =
  | "bank"
  | "driver_license"
  | "id_card"
  | "registration";

export type CourierProfileUpdateInput = {
  addressLine1: string | null;
  city: string | null;
  iban: string | null;
  phone: string | null;
  postalCode: string | null;
  preferredLanguage: SupportedLanguage;
};

export type ProfileDocumentUploadResult =
  | {
      profile: Profile;
      success: true;
    }
  | {
      canceled?: boolean;
      error: string;
      success: false;
    };

const COURIER_DOCUMENTS_BUCKET = "courier-documents" as const;
const TARGET_MAX_WIDTH = 1800;
const COMPRESSION_QUALITY = 0.76;

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  allowsEditing: false,
  exif: false,
  mediaTypes: ["images"],
  quality: 1,
};

export async function updateCourierOwnProfile(
  input: CourierProfileUpdateInput,
): Promise<Profile> {
  validateProfileUpdateInput(input);

  const { data, error } = await insforge.database.rpc("update_courier_own_profile", {
    p_address_line_1: normalizeNullableText(input.addressLine1),
    p_city: normalizeNullableText(input.city),
    p_iban: normalizeIban(input.iban),
    p_phone: normalizeNullableText(input.phone),
    p_postal_code: normalizeNullableText(input.postalCode),
    p_preferred_language: input.preferredLanguage,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Profildaten konnten nicht gespeichert werden.");
  }

  return normalizeProfile(data);
}

export async function pickAndUploadCourierProfileDocument({
  documentKind,
  profile,
}: {
  documentKind: ProfileDocumentKind;
  profile: Profile;
}): Promise<ProfileDocumentUploadResult> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return {
        error: "Fotozugriff wurde nicht erlaubt.",
        success: false,
      };
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

    if (pickerResult.canceled) {
      return {
        canceled: true,
        error: "Fotoauswahl abgebrochen.",
        success: false,
      };
    }

    const asset = pickerResult.assets[0];

    if (!asset?.uri) {
      return {
        error: "Dokumentfoto konnte nicht vorbereitet werden.",
        success: false,
      };
    }

    const preparedDocument = await compressProfileDocumentImage(documentKind, asset);
    const sizeBytes = await getLocalFileSize(preparedDocument.localUri);
    const storagePath = buildProfileDocumentStoragePath(profile, preparedDocument.fileName);
    const uploadedDocument = await uploadMobileStorageFile({
      bucket: COURIER_DOCUMENTS_BUCKET,
      key: storagePath,
      localUri: preparedDocument.localUri,
      mimeType: "image/jpeg",
      name: preparedDocument.fileName,
      sizeBytes,
    });

    const { data, error } = await insforge.database.rpc(
      "save_courier_profile_document",
      {
        p_document_kind: documentKind,
        p_document_url: uploadedDocument.url,
        p_mime_type: "image/jpeg",
        p_size_bytes: uploadedDocument.size,
        p_storage_path: uploadedDocument.key,
      },
    );

    if (error || !data) {
      return {
        error: error?.message ?? "Dokument konnte nicht gespeichert werden.",
        success: false,
      };
    }

    return {
      profile: normalizeProfile(data),
      success: true,
    };
  } catch (error) {
    console.error("[mobile/profile/uploadDocument]", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Dokument konnte nicht hochgeladen werden.",
      success: false,
    };
  }
}

function validateProfileUpdateInput(input: CourierProfileUpdateInput): void {
  const phone = normalizeNullableText(input.phone);
  const addressLine1 = normalizeNullableText(input.addressLine1);
  const postalCode = normalizeNullableText(input.postalCode);
  const city = normalizeNullableText(input.city);
  const iban = normalizeIban(input.iban);

  if (phone && phone.length > 40) {
    throw new Error("Telefon darf maximal 40 Zeichen haben.");
  }

  if (addressLine1 && addressLine1.length > 200) {
    throw new Error("Adresse darf maximal 200 Zeichen haben.");
  }

  if (postalCode && postalCode.length > 16) {
    throw new Error("PLZ darf maximal 16 Zeichen haben.");
  }

  if (city && city.length > 120) {
    throw new Error("Ort darf maximal 120 Zeichen haben.");
  }

  if (iban && iban.length > 64) {
    throw new Error("IBAN darf maximal 64 Zeichen haben.");
  }
}

async function compressProfileDocumentImage(
  documentKind: ProfileDocumentKind,
  asset: ImagePicker.ImagePickerAsset,
): Promise<{
  fileName: string;
  localUri: string;
}> {
  const resizeActions: Action[] =
    asset.width && asset.width <= TARGET_MAX_WIDTH
      ? []
      : [{ resize: { width: TARGET_MAX_WIDTH } }];
  const compressedImage = await ImageManipulator.manipulateAsync(
    asset.uri,
    resizeActions,
    {
      compress: COMPRESSION_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  const preparedAt = new Date().toISOString();

  return {
    fileName: createProfileDocumentFileName(documentKind, preparedAt),
    localUri: compressedImage.uri,
  };
}

async function getLocalFileSize(localUri: string): Promise<number> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  return blob.size > 0 ? blob.size : 1;
}

function buildProfileDocumentStoragePath(profile: Profile, fileName: string): string {
  return `companies/${profile.company_id}/couriers/${profile.id}/docs/${fileName}`;
}

function createProfileDocumentFileName(
  documentKind: ProfileDocumentKind,
  preparedAt: string,
): string {
  const safeTimestamp = preparedAt.replace(/[:.]/g, "-");

  return `${documentKind}-${safeTimestamp}.jpg`;
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function normalizeIban(value: string | null | undefined): string | null {
  const normalized = value?.replace(/\s+/g, "").toUpperCase();

  return normalized ? normalized : null;
}

function normalizeProfile(row: unknown): Profile {
  return row as Profile;
}
