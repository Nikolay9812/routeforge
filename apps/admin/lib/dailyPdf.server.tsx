import "server-only";

/* eslint-disable jsx-a11y/alt-text */

import type {
  Company,
  Depot,
  Profile,
  Shift,
  ShiftLocation,
  ShiftSignatureArtifact,
} from "@routeforge/shared";
import { shiftSignatureArtifactSchema, uuidSchema } from "@routeforge/shared";
import {
  Document,
  Image,
  Page,
  Polyline,
  StyleSheet,
  Svg,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import type { createRouteForgeServerClient } from "@/lib/insforge/server";

type DailyPdfClient = Awaited<ReturnType<typeof createRouteForgeServerClient>>;
type PdfProfile = Pick<
  Profile,
  | "auth_user_id"
  | "company_id"
  | "email"
  | "full_name"
  | "id"
  | "primary_depot_id"
  | "role"
  | "status"
>;

type LoadedDailyPdfData = {
  company: Company;
  courier: PdfProfile;
  depot: Depot;
  locations: ShiftLocation[];
  shift: Shift;
  signature: ShiftSignatureArtifact | null;
  signatureDrawing: ParsedSignatureSvg | null;
  stampDataUri: string | null;
};

export type DailyShiftPdfResult = {
  buffer: Buffer;
  fileName: string;
};

export class DailyPdfError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const companySelect = `
  id,
  name,
  slug,
  country_code,
  default_language,
  logo_url,
  stamp_url,
  created_at,
  updated_at
`;

const depotSelect = `
  id,
  company_id,
  name,
  code,
  address_line_1,
  postal_code,
  city,
  country_code,
  latitude,
  longitude,
  geofence_radius_meters,
  is_active,
  created_at,
  updated_at
`;

const profileSelect = `
  id,
  auth_user_id,
  company_id,
  primary_depot_id,
  role,
  status,
  full_name,
  email
`;

const shiftSelect = `
  id,
  company_id,
  depot_id,
  courier_profile_id,
  shift_date,
  start_time,
  end_time,
  gross_minutes,
  break_minutes,
  net_minutes,
  billable_minutes,
  billable_source,
  billable_override_reason,
  billable_override_by,
  billable_override_at,
  auto_stopped_at_max_hours,
  payment_mode_snapshot,
  tour_number,
  van_plate,
  start_km,
  end_km,
  packages_delivered,
  packages_returned,
  packages_picked_up,
  total_stops,
  courier_note,
  missing_proof_explanation,
  signature_url,
  signature_storage_key,
  signed_at,
  status,
  submitted_at,
  approved_at,
  approved_by,
  rejection_reason,
  created_at,
  updated_at
`;

const locationSelect = `
  id,
  company_id,
  shift_id,
  location_type,
  capture_status,
  missing_reason,
  latitude,
  longitude,
  accuracy_meters,
  depot_latitude_snapshot,
  depot_longitude_snapshot,
  distance_from_depot_meters,
  is_inside_depot_geofence,
  created_at
`;

const pdfColors = {
  border: "rgb(226, 232, 240)",
  ink: "rgb(17, 24, 39)",
  muted: "rgb(100, 116, 139)",
  primary: "rgb(37, 99, 235)",
  soft: "rgb(248, 250, 252)",
  warning: "rgb(146, 64, 14)",
  white: "white",
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: pdfColors.soft,
    borderColor: pdfColors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: pdfColors.ink,
    fontSize: 9,
    fontWeight: 700,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  card: {
    borderColor: pdfColors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  cardTitle: {
    color: pdfColors.ink,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  divider: {
    backgroundColor: pdfColors.border,
    height: 1,
    marginVertical: 12,
  },
  footer: {
    color: pdfColors.muted,
    fontSize: 8,
    marginTop: 18,
  },
  header: {
    alignItems: "flex-start",
    borderBottomColor: pdfColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  label: {
    color: pdfColors.muted,
    fontSize: 8,
    marginBottom: 3,
  },
  page: {
    backgroundColor: pdfColors.white,
    color: pdfColors.ink,
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 32,
  },
  section: {
    gap: 10,
    marginTop: 14,
  },
  signatureBox: {
    borderColor: pdfColors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 76,
    justifyContent: "center",
    padding: 8,
  },
  stamp: {
    height: 70,
    objectFit: "contain",
    width: 130,
  },
  stampBox: {
    alignItems: "center",
    borderColor: pdfColors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 86,
    justifyContent: "center",
    padding: 8,
  },
  subtitle: {
    color: pdfColors.muted,
    fontSize: 10,
    marginTop: 5,
  },
  table: {
    borderColor: pdfColors.border,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableCell: {
    flex: 1,
    padding: 8,
  },
  tableCellBorder: {
    borderRightColor: pdfColors.border,
    borderRightWidth: 1,
  },
  tableRow: {
    borderBottomColor: pdfColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  title: {
    color: pdfColors.ink,
    fontSize: 20,
    fontWeight: 700,
  },
  value: {
    color: pdfColors.ink,
    fontSize: 11,
    fontWeight: 700,
  },
  warningText: {
    color: pdfColors.warning,
    fontSize: 9,
    lineHeight: 1.35,
  },
});

export async function generateDailyShiftPdf({
  client,
  shiftId,
}: {
  client: DailyPdfClient;
  shiftId: string;
}): Promise<DailyShiftPdfResult> {
  const parsedShiftId = uuidSchema.safeParse(shiftId);

  if (!parsedShiftId.success) {
    throw new DailyPdfError(400, "Ungueltige Schicht-ID.");
  }

  const data = await loadDailyPdfData({
    client,
    shiftId: parsedShiftId.data,
  });
  const buffer = await renderToBuffer(<DailyShiftPdfDocument data={data} />);

  return {
    buffer,
    fileName: `routeforge-tagesbericht-${data.shift.shift_date}-${data.shift.id.slice(0, 8)}.pdf`,
  };
}

async function loadDailyPdfData({
  client,
  shiftId,
}: {
  client: DailyPdfClient;
  shiftId: string;
}): Promise<LoadedDailyPdfData> {
  const actor = await loadCurrentProfile(client);

  if (!actor || actor.status !== "active") {
    throw new DailyPdfError(401, "Anmeldung erforderlich.");
  }

  const { data: shiftData, error: shiftError } = await client.database
    .from("shifts")
    .select(shiftSelect)
    .eq("id", shiftId)
    .eq("company_id", actor.company_id)
    .maybeSingle();

  if (shiftError) {
    throw new DailyPdfError(500, "Tages-PDF konnte nicht geladen werden.");
  }

  if (!shiftData) {
    throw new DailyPdfError(404, "Schicht wurde nicht gefunden.");
  }

  const shift = shiftData as Shift;
  await assertDailyPdfAccess({
    actor,
    client,
    shift,
  });

  const [
    { data: companyData },
    { data: courierData },
    { data: depotData },
    { data: locationRows },
  ] = await Promise.all([
    client.database
      .from("companies")
      .select(companySelect)
      .eq("id", shift.company_id)
      .maybeSingle(),
    client.database
      .from("profiles")
      .select(profileSelect)
      .eq("id", shift.courier_profile_id)
      .eq("company_id", shift.company_id)
      .maybeSingle(),
    client.database
      .from("depots")
      .select(depotSelect)
      .eq("id", shift.depot_id)
      .eq("company_id", shift.company_id)
      .maybeSingle(),
    client.database
      .from("shift_locations")
      .select(locationSelect)
      .eq("shift_id", shift.id)
      .eq("company_id", shift.company_id)
      .order("created_at", { ascending: true }),
  ]);

  if (!companyData || !courierData || !depotData) {
    throw new DailyPdfError(404, "PDF-Daten sind nicht vollstaendig.");
  }

  const signature = await loadSignatureArtifact(client, shift.id);
  const signatureSvg = signature
    ? await downloadTextFile(client, signature.storage_bucket, signature.signature_storage_key)
    : null;
  const stampDataUri = await loadCompanyStampDataUri(client, companyData as Company);

  return {
    company: companyData as Company,
    courier: courierData as PdfProfile,
    depot: depotData as Depot,
    locations: (locationRows ?? []) as ShiftLocation[],
    shift,
    signature,
    signatureDrawing: signatureSvg ? parseSignatureSvg(signatureSvg) : null,
    stampDataUri,
  };
}

async function loadCurrentProfile(client: DailyPdfClient): Promise<PdfProfile | null> {
  const { data: user, error: userError } = await client.auth.getCurrentUser();
  const authUser = user.user;

  if (userError || !authUser?.id) {
    return null;
  }

  const { data: profileData, error: profileError } = await client.database
    .from("profiles")
    .select(profileSelect)
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (profileError || !profileData) {
    return null;
  }

  return profileData as PdfProfile;
}

async function assertDailyPdfAccess({
  actor,
  client,
  shift,
}: {
  actor: PdfProfile;
  client: DailyPdfClient;
  shift: Shift;
}): Promise<void> {
  if (actor.company_id !== shift.company_id) {
    throw new DailyPdfError(403, "Kein Zugriff auf diese Schicht.");
  }

  if (actor.role === "courier") {
    if (actor.id !== shift.courier_profile_id) {
      throw new DailyPdfError(403, "Kuriere koennen nur eigene PDFs laden.");
    }

    return;
  }

  if (actor.role === "admin") {
    return;
  }

  const { data: depotAccess, error } = await client.database
    .from("profile_depot_access")
    .select("id")
    .eq("company_id", actor.company_id)
    .eq("profile_id", actor.id)
    .eq("depot_id", shift.depot_id)
    .maybeSingle();

  if (error || !depotAccess) {
    throw new DailyPdfError(403, "Dispatcher hat keinen Zugriff auf dieses Depot.");
  }
}

async function loadSignatureArtifact(
  client: DailyPdfClient,
  shiftId: string,
): Promise<ShiftSignatureArtifact | null> {
  const { data, error } = await client.database.rpc("get_shift_signature_artifact", {
    p_shift_id: shiftId,
  });

  if (error) {
    return null;
  }

  const artifactRow = Array.isArray(data) ? data[0] : data;
  const parsed = shiftSignatureArtifactSchema.safeParse(artifactRow);

  return parsed.success ? parsed.data : null;
}

async function loadCompanyStampDataUri(
  client: DailyPdfClient,
  company: Company,
): Promise<string | null> {
  if (
    !company.stamp_url ||
    !company.stamp_url.startsWith(`companies/${company.id}/assets/`)
  ) {
    return null;
  }

  const file = await downloadBlobFile(client, "company-assets", company.stamp_url);

  if (!file) {
    return null;
  }

  return blobToDataUri(file, file.type || "image/png");
}

async function downloadTextFile(
  client: DailyPdfClient,
  bucket: string,
  key: string,
): Promise<string | null> {
  const file = await downloadBlobFile(client, bucket, key);

  if (!file) {
    return null;
  }

  return file.text();
}

async function downloadBlobFile(
  client: DailyPdfClient,
  bucket: string,
  key: string,
): Promise<Blob | null> {
  const { data, error } = await client.storage.from(bucket).download(key);

  if (error || !data || !(data instanceof Blob)) {
    return null;
  }

  return data;
}

async function blobToDataUri(file: Blob, mimeType: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function DailyShiftPdfDocument({ data }: { data: LoadedDailyPdfData }) {
  const { company, courier, depot, shift } = data;
  const geofenceRows = getGeofenceRows(data);

  return (
    <Document
      author="RouteForge"
      language="de-DE"
      subject="RouteForge Tagesbericht"
      title={`Tagesbericht ${shift.shift_date}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tagesbericht</Text>
            <Text style={styles.subtitle}>
              {company.name} - {formatDateLabel(shift.shift_date)}
            </Text>
          </View>
          <Text style={styles.badge}>{getShiftStatusLabel(shift.status)}</Text>
        </View>

        <View style={styles.section}>
          <InfoTable
            rows={[
              [
                { label: "Kurier", value: courier.full_name },
                { label: "E-Mail", value: courier.email },
              ],
              [
                { label: "Depot", value: `${depot.name} (${depot.code})` },
                { label: "Fahrzeug", value: shift.van_plate || "-" },
              ],
              [
                { label: "Tour", value: shift.tour_number ?? "-" },
                {
                  label: "Zahlungsart",
                  value:
                    shift.payment_mode_snapshot === "daily_fixed"
                      ? "Tagespauschale"
                      : "Stundenbasis",
                },
              ],
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Zeit und Abrechnung</Text>
          <InfoTable
            rows={[
              [
                { label: "Start", value: formatTimeLabel(shift.start_time) },
                { label: "Ende", value: formatTimeLabel(shift.end_time) },
              ],
              [
                { label: "Brutto", value: formatMinutes(shift.gross_minutes) },
                { label: "Pause", value: formatMinutes(shift.break_minutes) },
              ],
              [
                { label: "Netto", value: formatMinutes(shift.net_minutes) },
                { label: "Abrechenbar", value: formatMinutes(shift.billable_minutes) },
              ],
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Leistung</Text>
          <InfoTable
            rows={[
              [
                { label: "Start KM", value: formatKm(shift.start_km) },
                { label: "End KM", value: formatKm(shift.end_km) },
              ],
              [
                { label: "Gefahren", value: formatKm(Math.max(shift.end_km - shift.start_km, 0)) },
                { label: "Stopps", value: String(shift.total_stops ?? "-") },
              ],
              [
                { label: "Geliefert", value: String(shift.packages_delivered) },
                { label: "Retouren", value: String(shift.packages_returned) },
              ],
              [
                { label: "Abholungen", value: String(shift.packages_picked_up) },
                { label: "Max-Stopp", value: shift.auto_stopped_at_max_hours ? "Ja" : "Nein" },
              ],
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Standortnachweis</Text>
          <View style={styles.card}>
            {geofenceRows.map((row) => (
              <Text key={row} style={styles.warningText}>
                {row}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Notizen und Korrekturen</Text>
          <View style={styles.card}>
            <Text>{shift.courier_note ?? "Keine Kuriernotiz gespeichert."}</Text>
            {shift.missing_proof_explanation ? (
              <>
                <View style={styles.divider} />
                <Text>Nachweis-Erklaerung: {shift.missing_proof_explanation}</Text>
              </>
            ) : null}
            {shift.billable_override_reason ? (
              <>
                <View style={styles.divider} />
                <Text>Korrekturgrund: {shift.billable_override_reason}</Text>
              </>
            ) : null}
            {shift.rejection_reason ? (
              <>
                <View style={styles.divider} />
                <Text>Rueckfrage: {shift.rejection_reason}</Text>
              </>
            ) : null}
          </View>
        </View>

        <View style={[styles.section, { flexDirection: "row", gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Unterschrift</Text>
            <View style={styles.signatureBox}>
              {data.signatureDrawing ? (
                <RenderedSignature drawing={data.signatureDrawing} />
              ) : (
                <Text style={styles.subtitle}>
                  {data.signature ? "Signatur gespeichert." : "Keine Signatur gespeichert."}
                </Text>
              )}
            </View>
            <Text style={styles.footer}>
              {data.signature
                ? `Signiert von ${data.signature.signed_by_name} am ${formatDateTimeLabel(data.signature.signed_at)}`
                : "Signaturdatei nicht verfuegbar."}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Firmenstempel</Text>
            <View style={styles.stampBox}>
              {data.stampDataUri ? (
                <Image src={data.stampDataUri} style={styles.stamp} />
              ) : (
                <Text style={styles.subtitle}>Kein Stempel hinterlegt.</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Dieses PDF wurde serverseitig mit company-scoped Zugriff erzeugt. Datei:
          {" "}
          {shift.id}
        </Text>
      </Page>
    </Document>
  );
}

function InfoTable({
  rows,
}: {
  rows: Array<Array<{ label: string; value: string }>>;
}) {
  return (
    <View style={styles.table}>
      {rows.map((row, rowIndex) => (
        <View
          key={row.map((cell) => cell.label).join("-")}
          style={rowIndex === rows.length - 1 ? styles.tableRowLast : styles.tableRow}
        >
          {row.map((cell, cellIndex) => (
            <View
              key={cell.label}
              style={
                cellIndex === row.length - 1
                  ? styles.tableCell
                  : [styles.tableCell, styles.tableCellBorder]
              }
            >
              <Text style={styles.label}>{cell.label}</Text>
              <Text style={styles.value}>{cell.value}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

type ParsedSignatureSvg = {
  height: number;
  polylines: string[];
  width: number;
};

function RenderedSignature({ drawing }: { drawing: ParsedSignatureSvg }) {
  return (
    <Svg height="52" viewBox={`0 0 ${drawing.width} ${drawing.height}`} width="100%">
      {drawing.polylines.map((points) => (
        <Polyline
          key={points}
          fill="none"
          points={points}
          stroke={pdfColors.ink}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4}
        />
      ))}
    </Svg>
  );
}

function parseSignatureSvg(svgMarkup: string): ParsedSignatureSvg | null {
  const widthMatch = svgMarkup.match(/\bwidth="(\d+)"/);
  const heightMatch = svgMarkup.match(/\bheight="(\d+)"/);
  const polylineMatches = [...svgMarkup.matchAll(/<polyline[^>]*\bpoints="([^"]+)"[^>]*>/g)];
  const width = Number(widthMatch?.[1]);
  const height = Number(heightMatch?.[1]);
  const polylines = polylineMatches
    .map((match) => match[1]?.trim())
    .filter((points): points is string => Boolean(points));

  if (!Number.isFinite(width) || !Number.isFinite(height) || polylines.length === 0) {
    return null;
  }

  return {
    height,
    polylines,
    width,
  };
}

function getGeofenceRows(data: LoadedDailyPdfData): string[] {
  const rows: string[] = [];
  const startLocation = data.locations.find((location) => location.location_type === "start");
  const stopLocation = data.locations.find((location) => location.location_type === "stop");

  rows.push(formatLocationRow("Start", startLocation));
  rows.push(formatLocationRow("Stopp", stopLocation));

  return rows;
}

function formatLocationRow(label: string, location: ShiftLocation | undefined): string {
  if (!location) {
    return `${label}: Standortnachweis fehlt.`;
  }

  if (location.capture_status !== "captured") {
    return `${label}: Standort nicht verfuegbar (${location.missing_reason ?? "unbekannt"}).`;
  }

  const state = location.is_inside_depot_geofence ? "innerhalb" : "ausserhalb";
  const distance =
    location.distance_from_depot_meters == null
      ? "Distanz unbekannt"
      : `${Math.round(location.distance_from_depot_meters)} m vom Depot`;

  return `${label}: ${state} der Depot-Geofence, ${distance}.`;
}

function getShiftStatusLabel(status: Shift["status"]): string {
  const labels: Record<Shift["status"], string> = {
    approved: "Genehmigt",
    corrected: "Korrigiert",
    draft: "Entwurf",
    rejected: "Rueckfrage",
    submitted: "Eingereicht",
    under_review: "In Pruefung",
  };

  return labels[status];
}

function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function formatDateTimeLabel(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).format(new Date(value));
}

function formatTimeLabel(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}

function formatMinutes(minutes: number): string {
  const safeMinutes = Math.max(Math.trunc(minutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")} h`;
}

function formatKm(value: number): string {
  return `${Math.max(Math.trunc(value), 0)} km`;
}
