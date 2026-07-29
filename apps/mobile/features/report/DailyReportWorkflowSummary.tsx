import { Text, View } from "react-native";

import type { ShiftPhotoType } from "@routeforge/shared";

import { SignatureCard } from "@/components/report/SignatureCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDraftSavedAtLabel } from "@/features/report/dailyReportDraftStorage";
import type { DailyReportValidationDraft } from "@/features/report/dailyReportValidation";
import type { DailyReportFormState } from "@/features/report/dailyReportWorkflowTypes";
import {
  getShiftPhotoCompressionLabel,
  type LocalShiftPhoto,
} from "@/features/report/photoCapture";
import type { LocalSignature } from "@/features/report/signatureCapture";

const photoLabels: Record<ShiftPhotoType, string> = {
  end_km: "End-KM Foto",
  fahrtenbuch: "Fahrtenbuch",
  mentor: "Mentor Screenshot",
  start_km: "Start-KM Foto",
};

type ReportLifecycleNoticeProps = {
  isLocked: boolean;
  lastSavedAtLabel: string | null;
  syncQueueOperationId: string | null;
  syncStatusError: string | null;
  syncStatusLabel: string;
  syncStatusTone: "error" | "info" | "neutral" | "success" | "warning";
};

export function ReportLifecycleNotice({
  isLocked,
  lastSavedAtLabel,
  syncQueueOperationId,
  syncStatusError,
  syncStatusLabel,
  syncStatusTone,
}: ReportLifecycleNoticeProps) {
  return (
    <View
      className={`gap-2 rounded-rf2xl border p-3 ${
        isLocked
          ? "border-rfPrimaryLight bg-rfPrimaryLightest"
          : "border-rfWarningLight bg-rfWarningLightest"
      }`}
    >
      <View className="flex-row items-center gap-2">
        <RfIcon
          className={isLocked ? "text-rfPrimary" : "text-rfWarningForeground"}
          name={isLocked ? "lock-check-outline" : "cloud-sync-outline"}
          size={20}
        />
        <Text
          className={`flex-1 text-[13px] font-extrabold leading-[18px] ${
            isLocked ? "text-rfPrimaryDarker" : "text-rfWarningForeground"
          }`}
        >
          {isLocked ? "Bericht eingereicht" : "Offline-Entwurf"}
        </Text>
        <StatusBadge label={syncStatusLabel} tone={syncStatusTone} />
      </View>
      <Text
        className={`text-[12px] font-medium leading-4 ${
          isLocked ? "text-rfPrimaryDarker" : "text-rfWarningForeground"
        }`}
      >
        {syncStatusError ??
          (isLocked
            ? "Server hat die Einreichung bestaetigt. Dieser Bericht kann nicht mehr bearbeitet werden."
            : lastSavedAtLabel
              ? `Lokal gespeichert am ${lastSavedAtLabel}. Einreichung sperrt erst nach Serverbestaetigung.`
              : "Aenderungen werden lokal gespeichert und fuer den spaeteren Sync vorgemerkt.")}
      </Text>
      {syncQueueOperationId ? (
        <Text
          className={`text-[11px] font-bold leading-[15px] ${
            isLocked ? "text-rfPrimaryDarker" : "text-rfWarningForeground"
          }`}
        >
          Sync-Vorgang vorbereitet
        </Text>
      ) : null}
    </View>
  );
}

type SubmittedReportSummaryProps = {
  capturedPhotos: Partial<Record<ShiftPhotoType, LocalShiftPhoto>>;
  depotLabel: string;
  formState: DailyReportFormState;
  lockedAt: string | null;
  localSignature: LocalSignature | null;
  submittedAt: string | null;
  uploadedPhotoTypes: ShiftPhotoType[];
  validationDraft: DailyReportValidationDraft;
};

export function SubmittedReportSummary({
  capturedPhotos,
  depotLabel,
  formState,
  lockedAt,
  localSignature,
  submittedAt,
  uploadedPhotoTypes,
  validationDraft,
}: SubmittedReportSummaryProps) {
  const missingPhotoTypes = validationDraft.requiredPhotoTypes.filter(
    (photoType) => !uploadedPhotoTypes.includes(photoType),
  );

  return (
    <View className="gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-[20px] font-extrabold leading-7 text-rfTextPrimary">
            Bericht eingereicht
          </Text>
          <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
            {submittedAt
              ? `Eingereicht am ${formatSubmittedAtLabel(submittedAt)}`
              : "Heute abgeschlossen"}
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfTextMuted">
            Dieser Bericht kann nicht mehr bearbeitet werden. Fuer Korrekturen wenden Sie sich an Ihren Disponenten.
          </Text>
        </View>
        <StatusBadge label="Gesperrt" tone="neutral" />
      </View>

      <View className="gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-4">
        <SummaryRow label="Tournummer" value={formState.tourNumber || "-"} />
        <SummaryRow label="Kennzeichen" value={formState.vanPlate || "-"} />
        <SummaryRow label="Depot" value={depotLabel} />
        <SummaryRow label="Start-KM" value={formatKm(validationDraft.startKm)} />
        <SummaryRow label="End-KM" value={formatKm(validationDraft.endKm)} />
      </View>

      <View className="flex-row flex-wrap gap-2.5">
        <SummaryMetric label="Zustellungen" value={formState.packagesDelivered || "0"} />
        <SummaryMetric label="Ruecklaeufer" value={formState.packagesReturned || "0"} />
        <SummaryMetric label="Abholungen" value={formState.packagesPickedUp || "0"} />
        <SummaryMetric label="Stopps" value={formState.totalStops || "0"} />
      </View>

      <View className="gap-3">
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
          Nachweisfotos
        </Text>
        <View className="flex-row flex-wrap gap-2.5">
          {validationDraft.requiredPhotoTypes.map((photoType) => {
            const isUploaded = uploadedPhotoTypes.includes(photoType);
            const capturedPhoto = capturedPhotos[photoType];

            return (
              <View
                className={`min-h-[96px] flex-1 basis-[46%] gap-2 rounded-rf2xl border p-3 ${
                  isUploaded
                    ? "border-rfSuccessLight bg-rfSuccessLightest"
                    : "border-rfWarningLight bg-rfWarningLightest"
                }`}
                key={photoType}
              >
                <RfIcon
                  className={
                    isUploaded
                      ? "text-rfSuccessForeground"
                      : "text-rfWarningForeground"
                  }
                  name={isUploaded ? "check-circle-outline" : "alert-outline"}
                  size={22}
                />
                <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
                  {photoLabels[photoType]}
                </Text>
                <Text className="text-[11px] font-semibold leading-[15px] text-rfTextSecondary">
                  {isUploaded
                    ? capturedPhoto
                      ? getShiftPhotoCompressionLabel(capturedPhoto)
                      : "Vorhanden"
                    : "Pflichtfoto fehlt"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {missingPhotoTypes.length > 0 ? (
        <View className="gap-1 rounded-rf2xl border border-rfWarningLight bg-rfWarningLightest p-3">
          <Text className="text-[13px] font-extrabold leading-[18px] text-rfWarningForeground">
            Fehlende Nachweise erklaert
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfWarningForeground">
            {formState.missingProofExplanation}
          </Text>
        </View>
      ) : null}

      {formState.courierNote.trim() ? (
        <View className="gap-1 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3">
          <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
            Anmerkungen
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
            {formState.courierNote}
          </Text>
        </View>
      ) : null}

      <SignatureCard
        disabled
        helper={
          localSignature
            ? "Bestaetigt und schreibgeschuetzt."
            : "Keine Unterschrift vorhanden."
        }
        label="Unterschrift"
        onClear={() => undefined}
        onConfirm={() => undefined}
        signature={localSignature}
      />

      <View className="flex-row items-center gap-2 rounded-rf2xl border border-rfBorderLight bg-rfNeutralLight p-3">
        <RfIcon className="text-rfTextMuted" name="lock-outline" size={20} />
        <Text className="flex-1 text-[12px] font-bold leading-4 text-rfTextSecondary">
          Lokal gesperrt seit {lockedAt ? formatDraftSavedAtLabel(lockedAt) : "Einreichung"}.
        </Text>
      </View>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-[12px] font-bold leading-4 text-rfTextSecondary">
        {label}
      </Text>
      <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
        {value}
      </Text>
    </View>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-h-[82px] flex-1 basis-[46%] justify-center rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3">
      <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
        {value}
      </Text>
      <Text className="text-[12px] font-bold leading-4 text-rfTextSecondary">
        {label}
      </Text>
    </View>
  );
}

function formatSubmittedAtLabel(timestamp: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
    year: "numeric",
  }).format(new Date(timestamp));
}

function formatKm(value: number): string {
  return value >= 0 ? new Intl.NumberFormat("de-DE").format(value) : "-";
}
