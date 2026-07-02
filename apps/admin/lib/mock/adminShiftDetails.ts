import {
  adminShiftListItems,
  type AdminShiftListItem,
  type AdminShiftTone,
} from "@/lib/mock/adminShifts";

export type AdminShiftDetailMetric = {
  label: string;
  value: string;
  helper: string;
  tone?: AdminShiftTone;
};

export type AdminShiftCounter = {
  label: string;
  value: string;
  helper: string;
};

export type AdminShiftPhotoEvidence = {
  label: string;
  typeLabel: string;
  capturedAt: string;
  statusLabel: string;
  statusTone: AdminShiftTone;
  description: string;
};

export type AdminShiftLocationCheckpoint = {
  label: string;
  time: string;
  stateLabel: string;
  tone: AdminShiftTone;
  distance: string;
  accuracy: string;
  address: string;
};

export type AdminShiftAuditItem = {
  time: string;
  actor: string;
  action: string;
  reason?: string;
};

export type AdminShiftReviewDetail = AdminShiftListItem & {
  initials: string;
  courierStatusLabel: string;
  plannedShift: string;
  netTime: string;
  deviation: string;
  billableSourceLabel: string;
  billableRuleLabel: string;
  vehiclePlate: string;
  routeCode: string;
  startKm: string;
  endKm: string;
  drivenKm: string;
  firstDelivery: string;
  lastDelivery: string;
  deliveredPackages: string;
  returnedPackages: string;
  pickedUpPackages: string;
  totalStops: string;
  courierNote: string;
  adminNote: string;
  signatureLabel: string;
  signedAt: string;
  signedBy: string;
  photoRetentionLabel: string;
  timeMetrics: AdminShiftDetailMetric[];
  packageCounters: AdminShiftCounter[];
  photoEvidence: AdminShiftPhotoEvidence[];
  locationCheckpoints: AdminShiftLocationCheckpoint[];
  geofenceWarnings: AdminShiftAuditItem[];
  auditTrail: AdminShiftAuditItem[];
};

const detailOverrides: Record<string, Partial<AdminShiftReviewDetail>> = {
  "SR-2026-07-01-0842": {
    initials: "NW",
    plannedShift: "06:00 - 16:00",
    netTime: "09:28",
    deviation: "+00:13",
    billableSourceLabel: "Automatisch gekappt",
    billableRuleLabel: "Stundenlohn: maximal 10:00 h abrechenbar.",
    vehiclePlate: "MA RF 1842",
    routeCode: "T-2026-07-01-0842",
    startKm: "84.120",
    endKm: "84.314",
    drivenKm: "194 km",
    firstDelivery: "06:41",
    lastDelivery: "15:49",
    deliveredPackages: "52",
    returnedPackages: "3",
    pickedUpPackages: "0",
    totalStops: "55",
    courierNote:
      "Stopp wegen gesperrter Einfahrt spaeter ausserhalb des Depotbereichs erfasst.",
    adminNote:
      "Geofence-Stopp pruefen. Abrechenbare Zeit ist durch 10h-Kappung bereits begrenzt.",
    locationCheckpoints: [
      {
        label: "Start",
        time: "06:04",
        stateLabel: "Im Depot",
        tone: "success",
        distance: "42 m vom Depot",
        accuracy: "Genauigkeit 11 m",
        address: "Mannheim Nord, Tor 2",
      },
      {
        label: "Stopp",
        time: "16:17",
        stateLabel: "Ausserhalb",
        tone: "error",
        distance: "410 m vom Depot",
        accuracy: "Genauigkeit 18 m",
        address: "Industriestrasse 21, Mannheim",
      },
    ],
    geofenceWarnings: [
      {
        time: "16:17",
        actor: "System",
        action: "Stopp ausserhalb Depot-Geofence",
        reason: "410 m Distanz bei erlaubtem Radius 250 m.",
      },
    ],
  },
  "SR-2026-07-01-0774": {
    initials: "SP",
    netTime: "07:27",
    deviation: "-00:23",
    vehiclePlate: "MA RF 0774",
    routeCode: "T-2026-07-01-0774",
    startKm: "62.410",
    endKm: "62.548",
    drivenKm: "138 km",
    deliveredPackages: "37",
    returnedPackages: "2",
    pickedUpPackages: "0",
    totalStops: "39",
    courierNote: "Start wurde nach Fahrzeuguebernahme vor dem Depot erfasst.",
    locationCheckpoints: [
      {
        label: "Start",
        time: "06:55",
        stateLabel: "Ausserhalb",
        tone: "warning",
        distance: "185 m vom Depot",
        accuracy: "Genauigkeit 14 m",
        address: "Mannheim Sued, Zufahrt West",
      },
      {
        label: "Stopp",
        time: "14:52",
        stateLabel: "Im Depot",
        tone: "success",
        distance: "36 m vom Depot",
        accuracy: "Genauigkeit 9 m",
        address: "Mannheim Sued, Hof",
      },
    ],
  },
  "SR-2026-06-30-0668": {
    initials: "MR",
    netTime: "07:42",
    deviation: "-00:18",
    vehiclePlate: "HD RF 0668",
    routeCode: "T-2026-06-30-0668",
    startKm: "91.705",
    endKm: "91.842",
    drivenKm: "137 km",
    deliveredPackages: "28",
    returnedPackages: "1",
    pickedUpPackages: "0",
    totalStops: "29",
    courierNote: "Stopp-Standort konnte wegen fehlender Berechtigung nicht gespeichert werden.",
    adminNote:
      "Abgelehnt, weil Stopp-GPS fehlt. Courier soll Standortberechtigung pruefen und Bericht korrigieren.",
    locationCheckpoints: [
      {
        label: "Start",
        time: "08:08",
        stateLabel: "Im Depot",
        tone: "success",
        distance: "22 m vom Depot",
        accuracy: "Genauigkeit 8 m",
        address: "Heidelberg Depot, Halle A",
      },
      {
        label: "Stopp",
        time: "16:20",
        stateLabel: "Standort fehlt",
        tone: "warning",
        distance: "Nicht gespeichert",
        accuracy: "Keine Genauigkeit",
        address: "Keine Standortdaten vorhanden",
      },
    ],
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildDefaultDetail(shift: AdminShiftListItem): AdminShiftReviewDetail {
  const override = detailOverrides[shift.id];
  const initials = override?.initials ?? getInitials(shift.courierName);
  const netTime = override?.netTime ?? shift.billableTime;
  const plannedShift = override?.plannedShift ?? "07:00 - 15:30";
  const vehiclePlate = override?.vehiclePlate ?? `${shift.depotCode} RF 0816`;
  const routeCode = override?.routeCode ?? `T-${shift.shiftDate}-0816`;
  const deliveredPackages = override?.deliveredPackages ?? "41";
  const returnedPackages = override?.returnedPackages ?? "1";
  const pickedUpPackages = override?.pickedUpPackages ?? "1";
  const totalStops = override?.totalStops ?? "43";
  const billableRuleLabel =
    override?.billableRuleLabel ??
    (shift.paymentMode === "hourly"
      ? "Stundenlohn: reale Nettozeit bis maximal 10:00 h."
      : "Tagespauschale: Standardwert 08:20 h abrechenbar.");

  return {
    ...shift,
    initials,
    courierStatusLabel: "Aktiv",
    plannedShift,
    netTime,
    deviation: override?.deviation ?? "+00:00",
    billableSourceLabel: override?.billableSourceLabel ?? "Automatisch",
    billableRuleLabel,
    vehiclePlate,
    routeCode,
    startKm: override?.startKm ?? "72.184",
    endKm: override?.endKm ?? "72.329",
    drivenKm: override?.drivenKm ?? "145 km",
    firstDelivery: override?.firstDelivery ?? "07:42",
    lastDelivery: override?.lastDelivery ?? "14:58",
    deliveredPackages,
    returnedPackages,
    pickedUpPackages,
    totalStops,
    courierNote: override?.courierNote ?? "Keine besonderen Hinweise vom Kurier.",
    adminNote:
      override?.adminNote ??
      "Alle Pflichtnachweise liegen vor. Bitte Geofence-Status und Zeiten final pruefen.",
    signatureLabel: "Unterschrift vorhanden",
    signedAt: `${shift.dateLabel}, ${shift.endTime}`,
    signedBy: shift.courierName,
    photoRetentionLabel: "Nachweise werden nach 14 Tagen aus shift-photos geloescht.",
    timeMetrics: [
      {
        label: "Geplante Schicht",
        value: plannedShift,
        helper: "Depot-Planung",
      },
      {
        label: "Bruttozeit",
        value: shift.grossTime,
        helper: "Start bis Stopp",
      },
      {
        label: "Pausen",
        value: shift.breakTime,
        helper: "gesetzlich beruecksichtigt",
      },
      {
        label: "Nettozeit",
        value: netTime,
        helper: "effektive Arbeitszeit",
      },
      {
        label: "Abrechenbar",
        value: shift.billableTime,
        helper: shift.paymentModeLabel,
        tone: "primary",
      },
      {
        label: "Abweichung",
        value: override?.deviation ?? "+00:00",
        helper: "gegen Plan",
        tone: shift.geofenceTone,
      },
    ],
    packageCounters: [
      {
        label: "Geliefert",
        value: deliveredPackages,
        helper: "zugestellte Pakete",
      },
      {
        label: "Retouren",
        value: returnedPackages,
        helper: "zurueckgefuehrt",
      },
      {
        label: "Abholungen",
        value: pickedUpPackages,
        helper: "beim Kunden",
      },
      {
        label: "Stopps",
        value: totalStops,
        helper: "gesamt",
      },
    ],
    photoEvidence: [
      {
        label: "Start KM",
        typeLabel: "start_km",
        capturedAt: shift.startTime,
        statusLabel: "Vorhanden",
        statusTone: "success",
        description: `KM ${override?.startKm ?? "72.184"}`,
      },
      {
        label: "Ende KM",
        typeLabel: "end_km",
        capturedAt: shift.endTime,
        statusLabel: "Vorhanden",
        statusTone: "success",
        description: `KM ${override?.endKm ?? "72.329"}`,
      },
      {
        label: "Fahrtenbuch",
        typeLabel: "fahrtenbuch",
        capturedAt: "12:44",
        statusLabel: "Vorhanden",
        statusTone: "success",
        description: "komprimiertes Foto",
      },
      {
        label: "Mentor",
        typeLabel: "mentor",
        capturedAt: "15:02",
        statusLabel: "Vorhanden",
        statusTone: "success",
        description: "Screenshot hochgeladen",
      },
    ],
    locationCheckpoints:
      override?.locationCheckpoints ??
      (shift.geofenceState === "inside"
        ? [
            {
              label: "Start",
              time: shift.startTime,
              stateLabel: "Im Depot",
              tone: "success",
              distance: "28 m vom Depot",
              accuracy: "Genauigkeit 10 m",
              address: `${shift.depotName}, Tor 1`,
            },
            {
              label: "Stopp",
              time: shift.endTime,
              stateLabel: "Im Depot",
              tone: "success",
              distance: "31 m vom Depot",
              accuracy: "Genauigkeit 12 m",
              address: `${shift.depotName}, Hof`,
            },
          ]
        : []),
    geofenceWarnings:
      override?.geofenceWarnings ??
      (shift.geofenceState === "inside"
        ? []
        : [
            {
              time: shift.endTime,
              actor: "System",
              action: shift.geofenceDetail,
              reason: "Warnung aus Start/Stopp-Geofence-Pruefung.",
            },
          ]),
    auditTrail: [
      {
        time: shift.submittedAt,
        actor: shift.courierName,
        action: "Bericht eingereicht",
      },
      {
        time: "Heute, 10:22",
        actor: "System",
        action:
          shift.geofenceState === "inside"
            ? "Pflichtnachweise geprueft"
            : "Geofence-Warnung erzeugt",
      },
      {
        time: "Heute, 10:28",
        actor: "Admin Demo",
        action:
          shift.status === "approved"
            ? "Schicht genehmigt"
            : "Schicht zur Pruefung geoeffnet",
      },
    ],
  };
}

export function getAdminShiftReviewDetail(
  id: string,
): AdminShiftReviewDetail | null {
  const shift = adminShiftListItems.find((item) => item.id === id);

  if (!shift) {
    return null;
  }

  return buildDefaultDetail(shift);
}
