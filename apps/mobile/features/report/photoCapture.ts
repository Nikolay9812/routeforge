import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

import type { ShiftPhotoType } from "@routeforge/shared";
import type { Action } from "expo-image-manipulator";

export type PhotoCaptureSource = "camera" | "library";

export type ShiftPhotoUploadPayload = {
  compressed: true;
  expiresInDays: 14;
  fileName: string;
  localUri: string;
  mimeType: "image/jpeg";
  photoType: ShiftPhotoType;
  storageBucket: "shift-photos";
  storagePathTemplate: "companies/{company_id}/shifts/{shift_id}/photos/{file_name}";
};

export type LocalShiftPhoto = {
  compressed: true;
  compressionQuality: number;
  fileName: string;
  height: number;
  localUri: string;
  mimeType: "image/jpeg";
  originalUri: string;
  photoType: ShiftPhotoType;
  preparedAt: string;
  targetMaxWidth: number;
  uploadPayload: ShiftPhotoUploadPayload;
  width: number;
};

export type CaptureShiftPhotoResult =
  | {
      canceled?: false;
      photo: LocalShiftPhoto;
      success: true;
    }
  | {
      canceled?: boolean;
      error: string;
      success: false;
    };

const SHIFT_PHOTO_BUCKET = "shift-photos" as const;
const SHIFT_PHOTO_RETENTION_DAYS = 14;
const TARGET_MAX_WIDTH = 1600;
const COMPRESSION_QUALITY = 0.72;

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  allowsEditing: false,
  exif: false,
  mediaTypes: ["images"],
  quality: 1,
};

export async function captureShiftPhoto(
  photoType: ShiftPhotoType,
  source: PhotoCaptureSource,
): Promise<CaptureShiftPhotoResult> {
  try {
    const permission = await requestPhotoPermission(source);

    if (!permission.granted) {
      return {
        error:
          source === "camera"
            ? "Kamerazugriff wurde nicht erlaubt."
            : "Fotozugriff wurde nicht erlaubt.",
        success: false,
      };
    }

    const pickerResult =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(imagePickerOptions)
        : await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

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
        error: "Foto konnte nicht vorbereitet werden.",
        success: false,
      };
    }

    const photo = await compressShiftPhoto(photoType, asset);

    return {
      photo,
      success: true,
    };
  } catch {
    return {
      error: "Foto konnte nicht verarbeitet werden.",
      success: false,
    };
  }
}

export function getShiftPhotoCompressionLabel(photo: LocalShiftPhoto): string {
  return `Komprimiert: ${photo.width} x ${photo.height} px, JPEG`;
}

async function requestPhotoPermission(
  source: PhotoCaptureSource,
): Promise<{ granted: boolean }> {
  if (source === "camera") {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    return { granted: cameraPermission.granted };
  }

  const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  return { granted: libraryPermission.granted };
}

async function compressShiftPhoto(
  photoType: ShiftPhotoType,
  asset: ImagePicker.ImagePickerAsset,
): Promise<LocalShiftPhoto> {
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
  const fileName = createPhotoFileName(photoType, preparedAt);

  return {
    compressed: true,
    compressionQuality: COMPRESSION_QUALITY,
    fileName,
    height: compressedImage.height,
    localUri: compressedImage.uri,
    mimeType: "image/jpeg",
    originalUri: asset.uri,
    photoType,
    preparedAt,
    targetMaxWidth: TARGET_MAX_WIDTH,
    uploadPayload: {
      compressed: true,
      expiresInDays: SHIFT_PHOTO_RETENTION_DAYS,
      fileName,
      localUri: compressedImage.uri,
      mimeType: "image/jpeg",
      photoType,
      storageBucket: SHIFT_PHOTO_BUCKET,
      storagePathTemplate:
        "companies/{company_id}/shifts/{shift_id}/photos/{file_name}",
    },
    width: compressedImage.width,
  };
}

function createPhotoFileName(photoType: ShiftPhotoType, preparedAt: string): string {
  const safeTimestamp = preparedAt.replace(/[:.]/g, "-");

  return `${photoType}-${safeTimestamp}.jpg`;
}
