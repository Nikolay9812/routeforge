import { insforge, insforgeBaseUrl } from "@/lib/insforge-client";

export type MobileStorageUploadResult = {
  bucket: string;
  key: string;
  mimeType?: string;
  size: number;
  uploadedAt?: string;
  url: string;
};

type ReactNativeFormDataFile = {
  name: string;
  type: string;
  uri: string;
};

export async function uploadMobileStorageFile({
  bucket,
  key,
  localUri,
  mimeType,
  name,
  sizeBytes,
}: {
  bucket: string;
  key: string;
  localUri: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
}): Promise<MobileStorageUploadResult> {
  const formData = createReactNativeUploadFormData({
    localUri,
    mimeType,
    name,
  });

  return uploadFormDataToInsForgeStorage({
    bucket,
    formData,
    key,
    mimeType,
    sizeBytes,
  });
}

function buildStorageObjectUrl(bucket: string, key: string): string {
  return `${insforgeBaseUrl.replace(/\/$/, "")}/api/storage/buckets/${bucket}/objects/${encodeURIComponent(key)}`;
}

function uploadFormDataToInsForgeStorage({
  bucket,
  formData,
  key,
  mimeType,
  sizeBytes,
}: {
  bucket: string;
  formData: FormData;
  key: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<MobileStorageUploadResult> {
  const uploadUrl = buildStorageObjectUrl(bucket, key);
  const headers = insforge.getHttpClient().getHeaders();

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", uploadUrl);
    request.timeout = 120000;
    Object.entries(headers).forEach(([headerName, headerValue]) => {
      if (headerName.toLowerCase() !== "content-type") {
        request.setRequestHeader(headerName, headerValue);
      }
    });
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`Datei konnte nicht gespeichert werden (${request.status}).`));
        return;
      }

      resolve(
        normalizeStorageUploadResponse(request.responseText, {
          bucket,
          key,
          mimeType,
          sizeBytes,
        }),
      );
    };
    request.onerror = () => {
      reject(new Error("Netzwerkfehler beim Speichern der Datei."));
    };
    request.ontimeout = () => {
      reject(new Error("Zeitueberschreitung beim Speichern der Datei."));
    };
    request.send(formData);
  });
}

function normalizeStorageUploadResponse(
  responseText: string,
  fallback: {
    bucket: string;
    key: string;
    mimeType: string;
    sizeBytes: number;
  },
): MobileStorageUploadResult {
  if (!responseText) {
    return {
      bucket: fallback.bucket,
      key: fallback.key,
      mimeType: fallback.mimeType,
      size: fallback.sizeBytes,
      uploadedAt: new Date().toISOString(),
      url: buildStorageObjectUrl(fallback.bucket, fallback.key),
    };
  }

  let parsed: Partial<MobileStorageUploadResult>;

  try {
    parsed = JSON.parse(responseText) as Partial<MobileStorageUploadResult>;
  } catch {
    parsed = {};
  }

  return {
    bucket: typeof parsed.bucket === "string" ? parsed.bucket : fallback.bucket,
    key: typeof parsed.key === "string" ? parsed.key : fallback.key,
    mimeType:
      typeof parsed.mimeType === "string" ? parsed.mimeType : fallback.mimeType,
    size: typeof parsed.size === "number" ? parsed.size : fallback.sizeBytes,
    uploadedAt:
      typeof parsed.uploadedAt === "string"
        ? parsed.uploadedAt
        : new Date().toISOString(),
    url:
      typeof parsed.url === "string" && parsed.url.trim()
        ? parsed.url
        : buildStorageObjectUrl(fallback.bucket, fallback.key),
  };
}

function createReactNativeUploadFormData({
  localUri,
  mimeType,
  name,
}: {
  localUri: string;
  mimeType: string;
  name: string;
}): FormData {
  const formData = new FormData();
  const file: ReactNativeFormDataFile = {
    name,
    type: mimeType,
    uri: localUri,
  };

  formData.append("file", file as unknown as Blob);

  return formData;
}
