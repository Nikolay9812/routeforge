import { NextResponse } from "next/server";

import {
  AdminCsvExportError,
  generateAdminCsvExport,
} from "@/lib/adminExports.server";
import { getCurrentAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    const result = await generateAdminCsvExport({
      input: {
        depotCode: url.searchParams.get("depotCode") ?? "all",
        month,
        paymentMode: url.searchParams.get("paymentMode") ?? "all",
      },
      session,
    });

    return new Response(result.csv, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "Content-Type": "text/csv; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AdminCsvExportError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "CSV-Export konnte nicht erstellt werden." },
      { status: 500 },
    );
  }
}
