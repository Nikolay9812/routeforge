import { insforge } from "@/lib/insforge-client";

export type DailyPdfDownloadResult = {
  fileName: string;
  sizeBytes: number;
};

export type MonthlyPdfDownloadInput = {
  courierId: string;
  month: string;
};

const fallbackAdminApiUrl = "http://localhost:3000";

export async function downloadDailyShiftPdf(
  shiftId: string,
): Promise<{
  data: DailyPdfDownloadResult | null;
  error: string | null;
}> {
  return downloadPrivatePdf({
    authErrorMessage: "Bitte erneut anmelden, bevor du das Tages-PDF laedst.",
    fallbackFileName: createDailyFallbackFileName(shiftId),
    networkErrorMessage: "Tages-PDF konnte nicht geladen werden.",
    path: `/api/pdf/daily?shiftId=${encodeURIComponent(shiftId)}`,
  });
}

export async function downloadMonthlyShiftPdf({
  courierId,
  month,
}: MonthlyPdfDownloadInput): Promise<{
  data: DailyPdfDownloadResult | null;
  error: string | null;
}> {
  return downloadPrivatePdf({
    authErrorMessage: "Bitte erneut anmelden, bevor du das Monats-PDF laedst.",
    fallbackFileName: createMonthlyFallbackFileName(courierId, month),
    networkErrorMessage: "Monats-PDF konnte nicht geladen werden.",
    path: `/api/pdf/monthly?courierId=${encodeURIComponent(courierId)}&month=${encodeURIComponent(month)}`,
  });
}

async function downloadPrivatePdf({
  authErrorMessage,
  fallbackFileName,
  networkErrorMessage,
  path,
}: {
  authErrorMessage: string;
  fallbackFileName: string;
  networkErrorMessage: string;
  path: string;
}): Promise<{
  data: DailyPdfDownloadResult | null;
  error: string | null;
}> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    return {
      data: null,
      error: authErrorMessage,
    };
  }

  try {
    const response = await fetch(`${getAdminApiBaseUrl()}${path}`, {
      headers: {
        Accept: "application/pdf",
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      return {
        data: null,
        error: await getSafeErrorMessage(response, networkErrorMessage),
      };
    }

    const blob = await response.blob();

    return {
      data: {
        fileName: getFileNameFromHeaders(response.headers) ?? fallbackFileName,
        sizeBytes: blob.size,
      },
      error: null,
    };
  } catch {
    return {
      data: null,
      error: networkErrorMessage,
    };
  }
}

function getAuthorizationHeader(): string | null {
  const headers = insforge.getHttpClient().getHeaders();
  const authorization = headers.Authorization ?? headers.authorization;

  return typeof authorization === "string" && authorization.startsWith("Bearer ")
    ? authorization
    : null;
}

function getAdminApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_ADMIN_API_URL?.trim();

  return (configuredUrl || fallbackAdminApiUrl).replace(/\/$/, "");
}

async function getSafeErrorMessage(
  response: Response,
  fallbackErrorMessage: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };

    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    return fallbackErrorMessage;
  }

  return fallbackErrorMessage;
}

function getFileNameFromHeaders(headers: Headers): string | null {
  const disposition = headers.get("content-disposition");
  const match = disposition?.match(/filename="([^"]+)"/i);

  return match?.[1] ?? null;
}

function createDailyFallbackFileName(shiftId: string): string {
  return `routeforge-tagesbericht-${shiftId.slice(0, 8)}.pdf`;
}

function createMonthlyFallbackFileName(courierId: string, month: string): string {
  return `routeforge-monatsbericht-${month}-${courierId.slice(0, 8)}.pdf`;
}
