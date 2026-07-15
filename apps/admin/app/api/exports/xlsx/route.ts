import { NextResponse } from "next/server";

import {
  AdminExportError,
  generateAdminXlsxExport,
} from "@/lib/adminExports.server";
import { getCurrentAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const xlsxContentType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(request: Request) {
  const session = await getCurrentAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Anmeldung erforderlich." }, { status: 401 });
  }

  const url = new URL(request.url);
  const month = url.searchParams.get("month");

  if (!month) {
    return NextResponse.json({ error: "Export-Monat fehlt." }, { status: 400 });
  }

  try {
    const result = await generateAdminXlsxExport({
      input: {
        depotCode: url.searchParams.get("depotCode") ?? "all",
        month,
        paymentMode: url.searchParams.get("paymentMode") ?? "all",
      },
      session,
    });

    return new Response(new Blob([result.xlsx as BlobPart]), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "Content-Type": xlsxContentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AdminExportError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "XLSX-Export konnte nicht erstellt werden." },
      { status: 500 },
    );
  }
}
