import type { Depot } from "@routeforge/shared";

export type AdminDepotTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type AdminDepotListItem = Depot & {
  statusLabel: string;
  statusTone: AdminDepotTone;
  geofenceLabel: string;
  geofenceTone: AdminDepotTone;
  dispatcherCount: number;
  courierCount: number;
  openWarnings: number;
  contactName: string;
  contactPhone: string;
  operatingHours: string;
  lastShiftLabel: string;
};

export type AdminDepotFilterGroup = {
  label: string;
  value: string;
};

export type AdminDepotDetailDraft = {
  depotId: string;
  depotName: string;
  depotCode: string;
  statusLabel: string;
  statusTone: AdminDepotTone;
  fields: Array<{
    label: string;
    value: string;
  }>;
  assignedDispatchers: Array<{
    name: string;
    accessLabel: string;
    tone: AdminDepotTone;
  }>;
  courierPreview: Array<{
    label: string;
    value: string;
    tone: AdminDepotTone;
  }>;
  geofenceChecks: Array<{
    label: string;
    value: string;
    tone: AdminDepotTone;
  }>;
  auditReminder: string;
};

export const adminDepotFilterGroups: AdminDepotFilterGroup[] = [
  { label: "Status", value: "Alle Status" },
  { label: "Geofence", value: "Alle Pruefungen" },
  { label: "Zuweisung", value: "Alle Zuweisungen" },
];

export const adminDepotListItems: AdminDepotListItem[] = [
  {
    id: "DEP-MA-N",
    company_id: "company-ivt",
    name: "Mannheim Nord",
    code: "MA-N",
    address_line_1: "Hafenstrasse 12",
    postal_code: "68159",
    city: "Mannheim",
    country_code: "DE",
    latitude: 49.49871,
    longitude: 8.46724,
    geofence_radius_meters: 180,
    is_active: true,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-07-02T09:30:00.000Z",
    statusLabel: "Aktiv",
    statusTone: "success",
    geofenceLabel: "2 Warnungen",
    geofenceTone: "error",
    dispatcherCount: 2,
    courierCount: 18,
    openWarnings: 2,
    contactName: "Anna Mueller",
    contactPhone: "+49 621 400120",
    operatingHours: "06:00 - 18:30",
    lastShiftLabel: "Heute, 08:42",
  },
  {
    id: "DEP-MA-S",
    company_id: "company-ivt",
    name: "Mannheim Sued",
    code: "MA-S",
    address_line_1: "Casterfeldstrasse 86",
    postal_code: "68199",
    city: "Mannheim",
    country_code: "DE",
    latitude: 49.44582,
    longitude: 8.49316,
    geofence_radius_meters: 220,
    is_active: true,
    created_at: "2026-06-01T08:15:00.000Z",
    updated_at: "2026-07-01T14:10:00.000Z",
    statusLabel: "Aktiv",
    statusTone: "success",
    geofenceLabel: "Stabil",
    geofenceTone: "success",
    dispatcherCount: 2,
    courierCount: 14,
    openWarnings: 0,
    contactName: "Thomas Bauer",
    contactPhone: "+49 621 400220",
    operatingHours: "06:30 - 18:00",
    lastShiftLabel: "Heute, 07:58",
  },
  {
    id: "DEP-HD",
    company_id: "company-ivt",
    name: "Heidelberg",
    code: "HD",
    address_line_1: "Eppelheimer Strasse 74",
    postal_code: "69123",
    city: "Heidelberg",
    country_code: "DE",
    latitude: 49.40319,
    longitude: 8.67201,
    geofence_radius_meters: 160,
    is_active: true,
    created_at: "2026-06-05T10:00:00.000Z",
    updated_at: "2026-06-30T16:45:00.000Z",
    statusLabel: "Aktiv",
    statusTone: "success",
    geofenceLabel: "1 fehlt",
    geofenceTone: "warning",
    dispatcherCount: 1,
    courierCount: 9,
    openWarnings: 1,
    contactName: "Georg Keller",
    contactPhone: "+49 6221 400310",
    operatingHours: "07:00 - 17:30",
    lastShiftLabel: "Gestern, 17:05",
  },
  {
    id: "DEP-LU",
    company_id: "company-ivt",
    name: "Ludwigshafen Reserve",
    code: "LU-R",
    address_line_1: "Industriestrasse 19",
    postal_code: "67063",
    city: "Ludwigshafen",
    country_code: "DE",
    latitude: 49.48602,
    longitude: 8.42786,
    geofence_radius_meters: 140,
    is_active: false,
    created_at: "2026-06-12T09:00:00.000Z",
    updated_at: "2026-06-28T11:20:00.000Z",
    statusLabel: "Inaktiv",
    statusTone: "neutral",
    geofenceLabel: "Pausiert",
    geofenceTone: "neutral",
    dispatcherCount: 0,
    courierCount: 0,
    openWarnings: 0,
    contactName: "Nikolay Ivanov",
    contactPhone: "+49 621 400100",
    operatingHours: "Reservestandort",
    lastShiftLabel: "Keine aktive Schicht",
  },
];

export const adminDepotSummary = {
  total: adminDepotListItems.length,
  active: adminDepotListItems.filter((depot) => depot.is_active).length,
  geofenceWarnings: adminDepotListItems.reduce(
    (total, depot) => total + depot.openWarnings,
    0,
  ),
  assignedCouriers: adminDepotListItems.reduce(
    (total, depot) => total + depot.courierCount,
    0,
  ),
};

export const adminDepotDetailDraft: AdminDepotDetailDraft = {
  depotId: "DEP-MA-N",
  depotName: "Mannheim Nord",
  depotCode: "MA-N",
  statusLabel: "Aktiv",
  statusTone: "success",
  fields: [
    { label: "Name", value: "Mannheim Nord" },
    { label: "Code", value: "MA-N" },
    { label: "Adresse", value: "Hafenstrasse 12" },
    { label: "PLZ / Stadt", value: "68159 Mannheim" },
    { label: "Breitengrad", value: "49.49871" },
    { label: "Laengengrad", value: "8.46724" },
    { label: "Geofence-Radius", value: "180 m" },
    { label: "Status", value: "Aktiv" },
  ],
  assignedDispatchers: [
    { name: "Anna Mueller", accessLabel: "Vollzugriff", tone: "success" },
    { name: "Ivana Ruseva", accessLabel: "Geplant", tone: "warning" },
  ],
  courierPreview: [
    { label: "Aktive Kuriere", value: "18", tone: "success" },
    { label: "Heute gestartet", value: "11", tone: "info" },
    { label: "Dokumente offen", value: "3", tone: "warning" },
  ],
  geofenceChecks: [
    { label: "Start ausserhalb", value: "1", tone: "error" },
    { label: "Stopp ausserhalb", value: "1", tone: "error" },
    { label: "Fehlende GPS-Daten", value: "0", tone: "success" },
  ],
  auditReminder:
    "Depot- und Geofence-Aenderungen muessen spaeter serverseitig company-scoped gespeichert und bei sensiblen Aenderungen im Audit Log dokumentiert werden.",
};
