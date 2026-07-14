import { insforge } from "@/lib/insforge-client";

export type DailyPdfDownloadResult = {
  fileName: string;
  sizeBytes: number;
};

const fallbackAdminApiUrl = "http://localhost:3000";

export async function downloadDailyShiftPdf(
  shiftId: string,
): Promise<{
  data: DailyPdfDownloadResult | null;
  error: string | null;
}> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    return {
      data: null,
      error: "Bitte erneut anmelden, bevor du das Tages-PDF laedst.",
    };
  }

  try {
    const response = await fetch(
      `${getAdminApiBaseUrl()}/api/pdf/daily?shiftId=${encodeURIComponent(shiftId)}`,
      {
        headers: {
          Accept: "application/pdf",
          Authorization: authorization,
        },
      },
    );

    if (!response.ok) {
      return {
        data: null,
        error: await getSafeErrorMessage(response),
      };
    }

    const blob = await response.blob();

    return {
      data: {
        fileName: getFileNameFromHeaders(response.headers) ?? createFallbackFileName(shiftId),
        sizeBytes: blob.size,
      },
      error: null,
    };
  } catch {
    return {
      data: null,
      error: "Tages-PDF konnte nicht geladen werden.",
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

async function getSafeErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };

    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    return "Tages-PDF konnte nicht geladen werden.";
  }

  return "Tages-PDF konnte nicht geladen werden.";
}

function getFileNameFromHeaders(headers: Headers): string | null {
  const disposition = headers.get("content-disposition");
  const match = disposition?.match(/filename="([^"]+)"/i);

  return match?.[1] ?? null;
}

function createFallbackFileName(shiftId: string): string {
  return `routeforge-tagesbericht-${shiftId.slice(0, 8)}.pdf`;
}
