import { NextResponse } from "next/server";

import {
  DailyPdfError,
  generateDailyShiftPdf,
} from "@/lib/dailyPdf.server";
import {
  createRouteForgeServerClient,
  createRouteForgeServerClientWithAccessToken,
} from "@/lib/insforge/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shiftId = url.searchParams.get("shiftId");

  if (!shiftId) {
    return NextResponse.json(
      { error: "Schicht-ID fehlt." },
      { status: 400 },
    );
  }

  try {
    const client = await createClientForRequest(request);
    const result = await generateDailyShiftPdf({
      client,
      shiftId,
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
    if (error instanceof DailyPdfError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Tages-PDF konnte nicht erstellt werden." },
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
