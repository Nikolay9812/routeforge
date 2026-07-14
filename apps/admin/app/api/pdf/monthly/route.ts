import { NextResponse } from "next/server";

import {
  MonthlyPdfError,
  generateMonthlyShiftPdf,
} from "@/lib/monthlyPdf.server";
import {
  createRouteForgeServerClient,
  createRouteForgeServerClientWithAccessToken,
} from "@/lib/insforge/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courierId = url.searchParams.get("courierId");
  const month = url.searchParams.get("month");

  if (!courierId || !month) {
    return NextResponse.json(
      { error: "Kurier-ID oder Monat fehlt." },
      { status: 400 },
    );
  }

  try {
    const client = await createClientForRequest(request);
    const result = await generateMonthlyShiftPdf({
      client,
      courierId,
      month,
    });

    return new Response(new Uint8Array(result.buffer), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof MonthlyPdfError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Monats-PDF konnte nicht erstellt werden." },
      { status: 500 },
    );
  }
}

async function createClientForRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  if (accessToken) {
    return createRouteForgeServerClientWithAccessToken(accessToken);
  }

  return createRouteForgeServerClient();
}
