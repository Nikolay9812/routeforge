import "server-only";

/* eslint-disable jsx-a11y/alt-text */

import type { Company, Depot, Profile, Shift } from "@routeforge/shared";
import { uuidSchema } from "@routeforge/shared";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import type { createRouteForgeServerClient } from "@/lib/insforge/server";

type MonthlyPdfClient = Awaited<ReturnType<typeof createRouteForgeServerClient>>;
type PdfProfile = Pick<
  Profile,
  | "auth_user_id"
  | "company_id"
  | "email"
  | "full_name"
  | "id"
  | "payment_mode"
  | "primary_depot_id"
  | "role"
  | "status"
>;

type MonthRange = {
  label: string;
  month: string;
  monthEnd: string;
  monthStart: string;
};

type MonthlyPdfShift = Shift & {
  depot: Depot | null;
};

type MonthlyPdfSummary = {
  approvedCount: number;
  billableMinutes: number;
  dailyFixedCount: number;
  grossMinutes: number;
  hourlyCount: number;
  submittedCount: number;
  totalShifts: number;
  visibleBillableMinutes: number;
  visibleGrossMinutes: number;
};

type LoadedMonthlyPdfData = {
  actor: PdfProfile;
  company: Company;
  courier: PdfProfile;
  monthRange: MonthRange;
  shifts: MonthlyPdfShift[];
  stampDataUri: string | null;
  summary: MonthlyPdfSummary;
};

export type MonthlyShiftPdfResult = {
  buffer: Buffer;
  fileName: string;
};

export class MonthlyPdfError extends Error {
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
  payment_mode,
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

const pdfColors = {
  border: "rgb(226, 232, 240)",
  ink: "rgb(17, 24, 39)",
  muted: "rgb(100, 116, 139)",
  primary: "rgb(37, 99, 235)",
  soft: "rgb(248, 250, 252)",
  success: "rgb(4, 120, 87)",
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
    fontSize: 9,
    padding: 30,
  },
  section: {
    gap: 10,
    marginTop: 14,
  },
  stamp: {
    height: 58,
    objectFit: "contain",
    width: 115,
  },
  stampBox: {
    alignItems: "center",
    borderColor: pdfColors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 72,
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
    padding: 7,
  },
  tableCellBorder: {
    borderRightColor: pdfColors.border,
    borderRightWidth: 1,
  },
  tableHeader: {
    backgroundColor: pdfColors.soft,
    borderBottomColor: pdfColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  tableHeaderText: {
    color: pdfColors.muted,
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
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
});

export async function generateMonthlyShiftPdf({
  client,
  courierId,
  month,
}: {
  client: MonthlyPdfClient;
  courierId: string;
  month: string;
}): Promise<MonthlyShiftPdfResult> {
  const parsedCourierId = uuidSchema.safeParse(courierId);

  if (!parsedCourierId.success) {
    throw new MonthlyPdfError(400, "Ungueltige Kurier-ID.");
  }

  const data = await loadMonthlyPdfData({
    client,
    courierId: parsedCourierId.data,
    monthRange: parseMonthRange(month),
  });
  const buffer = await renderToBuffer(<MonthlyShiftPdfDocument data={data} />);

  return {
    buffer,
    fileName: `routeforge-monatsbericht-${data.monthRange.month}-${data.courier.id.slice(0, 8)}.pdf`,
  };
}

async function loadMonthlyPdfData({
  client,
  courierId,
  monthRange,
}: {
  client: MonthlyPdfClient;
  courierId: string;
  monthRange: MonthRange;
}): Promise<LoadedMonthlyPdfData> {
  const actor = await loadCurrentProfile(client);

  if (!actor || actor.status !== "active") {
    throw new MonthlyPdfError(401, "Anmeldung erforderlich.");
  }

  if (actor.role === "courier" && actor.id !== courierId) {
    throw new MonthlyPdfError(403, "Kuriere koennen nur eigene Monats-PDFs laden.");
  }

  const { data: courierData, error: courierError } = await client.database
    .from("profiles")
    .select(profileSelect)
    .eq("id", courierId)
    .eq("company_id", actor.company_id)
    .maybeSingle();

  if (courierError) {
    throw new MonthlyPdfError(500, "Monats-PDF konnte nicht geladen werden.");
  }

  if (!courierData) {
    throw new MonthlyPdfError(404, "Kurier wurde nicht gefunden.");
  }

  const courier = courierData as PdfProfile;
  const scopedDepotIds = await getScopedDepotIdsForActor(client, actor, courier);
  let shiftQuery = client.database
    .from("shifts")
    .select(shiftSelect)
    .eq("company_id", actor.company_id)
    .eq("courier_profile_id", courier.id)
    .gte("shift_date", monthRange.monthStart)
    .lt("shift_date", monthRange.monthEnd);

  if (scopedDepotIds) {
    shiftQuery = shiftQuery.in("depot_id", scopedDepotIds);
  }

  const { data: shiftRows, error: shiftError } = await shiftQuery
    .order("shift_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (shiftError) {
    throw new MonthlyPdfError(500, "Monats-Schichten konnten nicht geladen werden.");
  }

  const shifts = (shiftRows ?? []) as Shift[];
  const depotIds = Array.from(new Set(shifts.map((shift) => shift.depot_id)));
  const [{ data: companyData }, { data: depotRows }] = await Promise.all([
    client.database
      .from("companies")
      .select(companySelect)
      .eq("id", actor.company_id)
      .maybeSingle(),
    depotIds.length
      ? client.database
          .from("depots")
          .select(depotSelect)
          .eq("company_id", actor.company_id)
          .in("id", depotIds)
      : Promise.resolve({ data: [] }),
  ]);

  if (!companyData) {
    throw new MonthlyPdfError(404, "PDF-Daten sind nicht vollstaendig.");
  }

  const company = companyData as Company;
  const depotsById = new Map(
    ((depotRows ?? []) as Depot[]).map((depot) => [depot.id, depot]),
  );
  const visibleShifts = shifts.map((shift) => ({
    ...shift,
    depot: depotsById.get(shift.depot_id) ?? null,
  }));
  const stampDataUri = await loadCompanyStampDataUri(client, company);

  return {
    actor,
    company,
    courier,
    monthRange,
    shifts: visibleShifts,
    stampDataUri,
    summary: createMonthlySummary(visibleShifts),
  };
}

async function loadCurrentProfile(client: MonthlyPdfClient): Promise<PdfProfile | null> {
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

async function getScopedDepotIdsForActor(
  client: MonthlyPdfClient,
  actor: PdfProfile,
  courier: PdfProfile,
): Promise<string[] | null> {
  if (actor.role === "admin" || actor.role === "courier") {
    return null;
  }

  const { data: accessRows, error } = await client.database
    .from("profile_depot_access")
    .select("depot_id")
    .eq("company_id", actor.company_id)
    .eq("profile_id", actor.id);

  if (error) {
    throw new MonthlyPdfError(403, "Dispatcher-Depotzugriff konnte nicht geprueft werden.");
  }

  const depotIds = (accessRows ?? [])
    .map((row) => (row as { depot_id?: unknown }).depot_id)
    .filter((depotId): depotId is string => typeof depotId === "string");

  if (depotIds.length === 0) {
    throw new MonthlyPdfError(403, "Dispatcher hat keinen Depotzugriff.");
  }

  if (courier.primary_depot_id && !depotIds.includes(courier.primary_depot_id)) {
    throw new MonthlyPdfError(403, "Dispatcher hat keinen Zugriff auf diesen Kurier.");
  }

  return depotIds;
}

async function loadCompanyStampDataUri(
  client: MonthlyPdfClient,
  company: Company,
): Promise<string | null> {
  if (
    !company.stamp_url ||
    !company.stamp_url.startsWith(`companies/${company.id}/assets/`)
  ) {
    return null;
  }

  const { data, error } = await client.storage.from("company-assets").download(company.stamp_url);

  if (error || !data || !(data instanceof Blob)) {
    return null;
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  return `data:${data.type || "image/png"};base64,${buffer.toString("base64")}`;
}

function MonthlyShiftPdfDocument({ data }: { data: LoadedMonthlyPdfData }) {
  return (
    <Document
      author="RouteForge"
      language="de-DE"
      subject="RouteForge Monatsbericht"
      title={`Monatsbericht ${data.monthRange.month}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Monatsbericht</Text>
            <Text style={styles.subtitle}>
              {data.company.name} - {data.monthRange.label}
            </Text>
          </View>
          <Text style={styles.badge}>{getActorScopeLabel(data.actor.role)}</Text>
        </View>

        <View style={styles.section}>
          <InfoTable
            rows={[
              [
                { label: "Kurier", value: data.courier.full_name },
                { label: "E-Mail", value: data.courier.email },
              ],
              [
                { label: "Monat", value: data.monthRange.label },
                { label: "Zahlungsart Profil", value: getPaymentModeLabel(data.courier.payment_mode) },
              ],
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Monatssumme</Text>
          <InfoTable
            rows={[
              [
                { label: "Sichtbare Schichten", value: String(data.summary.totalShifts) },
                { label: "Genehmigt/korrigiert", value: String(data.summary.approvedCount) },
                { label: "Eingereicht/Pruefung", value: String(data.summary.submittedCount) },
              ],
              [
                { label: "Reale Zeit", value: formatMinutes(data.summary.visibleGrossMinutes) },
                { label: "Abrechenbar", value: formatMinutes(data.summary.visibleBillableMinutes) },
                { label: "Freigegeben abrechenbar", value: formatMinutes(data.summary.billableMinutes) },
              ],
              [
                { label: "Stundenbasis", value: String(data.summary.hourlyCount) },
                { label: "Tagespauschale", value: String(data.summary.dailyFixedCount) },
                { label: "Freigegeben real", value: formatMinutes(data.summary.grossMinutes) },
              ],
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Schichten</Text>
          {data.shifts.length > 0 ? (
            <ShiftTable shifts={data.shifts} />
          ) : (
            <View style={styles.card}>
              <Text style={styles.subtitle}>
                Fuer diesen Monat wurden keine sichtbaren Backend-Schichten gefunden.
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.section, { flexDirection: "row", gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Hinweis</Text>
            <View style={styles.card}>
              <Text>
                Diese Monatsuebersicht zeigt nur Schichten, die fuer den angemeldeten Nutzer
                permission-scoped sichtbar sind. Accountant CSV/XLSX Exporte folgen separat.
              </Text>
            </View>
          </View>
          <View style={{ width: 150 }}>
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
          Dieses PDF wurde serverseitig mit company-scoped Zugriff erzeugt. Kurier:
          {" "}
          {data.courier.id}
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

function ShiftTable({ shifts }: { shifts: MonthlyPdfShift[] }) {
  const headerCells = ["Datum", "Depot", "Status", "Zeit", "Abrech.", "Pakete"];

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {headerCells.map((cell, index) => (
          <View
            key={cell}
            style={
              index === headerCells.length - 1
                ? styles.tableCell
                : [styles.tableCell, styles.tableCellBorder]
            }
          >
            <Text style={styles.tableHeaderText}>{cell}</Text>
          </View>
        ))}
      </View>
      {shifts.map((shift, index) => (
        <View
          key={shift.id}
          style={index === shifts.length - 1 ? styles.tableRowLast : styles.tableRow}
        >
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text style={styles.value}>{formatShortDateLabel(shift.shift_date)}</Text>
            <Text style={styles.label}>{shift.tour_number ?? "Tour offen"}</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text style={styles.value}>{shift.depot?.code ?? "-"}</Text>
            <Text style={styles.label}>{shift.depot?.name ?? "Depot nicht geladen"}</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text style={styles.value}>{getShiftStatusLabel(shift.status)}</Text>
            <Text style={styles.label}>{getPaymentModeLabel(shift.payment_mode_snapshot)}</Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text style={styles.value}>{formatMinutes(shift.gross_minutes)}</Text>
            <Text style={styles.label}>
              {formatTimeLabel(shift.start_time)} - {formatTimeLabel(shift.end_time)}
            </Text>
          </View>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text style={styles.value}>{formatMinutes(shift.billable_minutes)}</Text>
            <Text style={styles.label}>Netto {formatMinutes(shift.net_minutes)}</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.value}>{shift.packages_delivered}</Text>
            <Text style={styles.label}>
              R {shift.packages_returned} / A {shift.packages_picked_up}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function createMonthlySummary(shifts: MonthlyPdfShift[]): MonthlyPdfSummary {
  const approvedShifts = shifts.filter(
    (shift) => shift.status === "approved" || shift.status === "corrected",
  );
  const submittedShifts = shifts.filter(
    (shift) => shift.status === "submitted" || shift.status === "under_review",
  );

  return {
    approvedCount: approvedShifts.length,
    billableMinutes: sumMinutes(approvedShifts, "billable_minutes"),
    dailyFixedCount: shifts.filter((shift) => shift.payment_mode_snapshot === "daily_fixed").length,
    grossMinutes: sumMinutes(approvedShifts, "gross_minutes"),
    hourlyCount: shifts.filter((shift) => shift.payment_mode_snapshot === "hourly").length,
    submittedCount: submittedShifts.length,
    totalShifts: shifts.length,
    visibleBillableMinutes: sumMinutes(shifts, "billable_minutes"),
    visibleGrossMinutes: sumMinutes(shifts, "gross_minutes"),
  };
}

function sumMinutes(shifts: MonthlyPdfShift[], key: "billable_minutes" | "gross_minutes"): number {
  return shifts.reduce((total, shift) => total + Math.max(shift[key], 0), 0);
}

function parseMonthRange(value: string): MonthRange {
  const match = value.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    throw new MonthlyPdfError(400, "Ungueltiger Monat.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new MonthlyPdfError(400, "Ungueltiger Monat.");
  }

  const nextMonthDate = new Date(Date.UTC(year, month, 1, 12));

  return {
    label: formatMonthLabel(`${year}-${String(month).padStart(2, "0")}-01`),
    month: `${year}-${String(month).padStart(2, "0")}`,
    monthEnd: formatIsoDate(
      nextMonthDate.getUTCFullYear(),
      nextMonthDate.getUTCMonth() + 1,
      1,
    ),
    monthStart: `${year}-${String(month).padStart(2, "0")}-01`,
  };
}

function getActorScopeLabel(role: PdfProfile["role"]): string {
  if (role === "admin") {
    return "Admin-Zugriff";
  }

  if (role === "dispatcher") {
    return "Depot-Zugriff";
  }

  return "Eigener Zugriff";
}

function getPaymentModeLabel(mode: Shift["payment_mode_snapshot"]): string {
  return mode === "daily_fixed" ? "Tagespauschale" : "Stundenbasis";
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

function formatShortDateLabel(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function formatMonthLabel(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    month: "long",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00.000Z`));
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

function formatIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
