import type {
  AdminShiftListItem,
  AdminShiftTone,
} from "@/lib/adminShifts";

export type AdminShiftDetailMetric = {
  helper: string;
  label: string;
  tone?: AdminShiftTone;
  value: string;
};

export type AdminShiftCounter = {
  helper: string;
  label: string;
  value: string;
};

export type AdminShiftPhotoEvidence = {
  capturedAt: string;
  description: string;
  label: string;
  previewUrl?: string | null;
  statusLabel: string;
  statusTone: AdminShiftTone;
  typeLabel: string;
};

export type AdminShiftLocationCheckpoint = {
  accuracy: string;
  address: string;
  distance: string;
  label: string;
  stateLabel: string;
  time: string;
  tone: AdminShiftTone;
};

export type AdminShiftAuditItem = {
  action: string;
  actor: string;
  reason?: string;
  time: string;
};

export type AdminShiftReviewDetail = AdminShiftListItem & {
  adminNote: string;
  auditTrail: AdminShiftAuditItem[];
  billableRuleLabel: string;
  billableSourceLabel: string;
  courierNote: string;
  courierStatusLabel: string;
  deliveredPackages: string;
  deviation: string;
  drivenKm: string;
  endKm: string;
  firstDelivery: string;
  geofenceWarnings: AdminShiftAuditItem[];
  initials: string;
  lastDelivery: string;
  locationCheckpoints: AdminShiftLocationCheckpoint[];
  netTime: string;
  packageCounters: AdminShiftCounter[];
  photoEvidence: AdminShiftPhotoEvidence[];
  photoRetentionLabel: string;
  pickedUpPackages: string;
  plannedShift: string;
  returnedPackages: string;
  routeCode: string;
  signatureLabel: string;
  signaturePreviewUrl?: string | null;
  signedAt: string;
  signedBy: string;
  startKm: string;
  timeMetrics: AdminShiftDetailMetric[];
  totalStops: string;
  vehiclePlate: string;
};
