import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import type { Shift } from "@routeforge/shared";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { CurrentShiftCard } from "@/components/shift/CurrentShiftCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMobileAuth } from "@/features/auth/AuthProvider";
import type { LocalShiftLocationCheckpoint } from "@/features/location/shiftLocationCapture";
import { loadCourierMailboxItems } from "@/features/mailbox/mailboxBackend";
import {
  baseCurrentShiftViewModel,
  type CurrentShiftMetricViewModel,
  type CurrentShiftViewModel,
} from "@/features/shifts/currentShiftViewModel";
import { useMobileProfileHydration } from "@/features/profile/mobileProfileHydration";
import { loadTodayCourierShift } from "@/features/shifts/shiftBackend";
import { useLocalShiftTimer } from "@/features/shifts/useLocalShiftTimer";

function buildPackageMetrics(
  shift: Shift | null,
): CurrentShiftMetricViewModel[] {
  if (!shift) {
    return baseCurrentShiftViewModel.packageMetrics;
  }

  return baseCurrentShiftViewModel.packageMetrics.map((metric) => {
    if (metric.label === "Zustellungen") {
      return {
        ...metric,
        helper: "Backend-Schicht",
        value: formatCounter(shift.packages_delivered),
      };
    }

    if (metric.label === "Ruecklaeufer") {
      return {
        ...metric,
        helper: "Backend-Schicht",
        value: formatCounter(shift.packages_returned),
      };
    }

    return {
      ...metric,
      helper: "Backend-Schicht",
      value: formatCounter(shift.packages_picked_up),
    };
  });
}

function formatCounter(value: number | null): string {
  return new Intl.NumberFormat("de-DE").format(Math.max(value ?? 0, 0));
}

function formatShiftTime(dateTime: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(dateTime));
}

function getTodayShiftReportStatusLabel(status: Shift["status"]): string {
  const labels: Record<Shift["status"], string> = {
    approved: "Genehmigt",
    corrected: "Korrigiert",
    draft: "Entwurf offen",
    rejected: "Zurueckgewiesen",
    submitted: "Eingereicht",
    under_review: "In Pruefung",
  };

  return labels[status];
}

function PackageMetricCard({
  helper,
  iconName,
  label,
  value,
}: CurrentShiftMetricViewModel) {
  return (
    <View className="flex-1 gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3">
      <View className="h-10 w-10 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
        <RfIcon className="text-rfPrimary" name={iconName} size={21} />
      </View>
      <View className="gap-0.5">
        <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
          {value}
        </Text>
        <Text className="text-xs font-extrabold leading-4 text-rfTextPrimary">
          {label}
        </Text>
        <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
          {helper}
        </Text>
      </View>
    </View>
  );
}

function buildLocationCheckpointDisplay(
  checkpoint: CurrentShiftViewModel["checkpoints"][number],
  locationCheckpoint: LocalShiftLocationCheckpoint,
  isCapturing: boolean,
): CurrentShiftViewModel["checkpoints"][number] {
  if (isCapturing) {
    return {
      ...checkpoint,
      accentClassName: "bg-rfWarning",
      description: "Standortfreigabe wird geprueft",
      statusLabel: "Pruefen",
    };
  }

  if (locationCheckpoint.status === "captured") {
    if (locationCheckpoint.isInsideDepotGeofence === false) {
      const distanceLabel =
        locationCheckpoint.distanceFromDepotMeters === null
          ? "Ausserhalb Depotbereich"
          : `Ausserhalb Depotbereich (${Math.round(locationCheckpoint.distanceFromDepotMeters)} m)`;

      return {
        ...checkpoint,
        accentClassName: "bg-rfError",
        description: distanceLabel,
        statusLabel: "Warnung",
      };
    }

    if (locationCheckpoint.isInsideDepotGeofence === true) {
      const distanceLabel =
        locationCheckpoint.distanceFromDepotMeters === null
          ? "Serverseitig gespeichert"
          : `Serverseitig gespeichert (${Math.round(locationCheckpoint.distanceFromDepotMeters)} m)`;

      return {
        ...checkpoint,
        accentClassName: "bg-rfSuccess",
        description: distanceLabel,
        statusLabel: "Gespeichert",
      };
    }

    const accuracyLabel =
      locationCheckpoint.accuracyMeters === null
        ? "Genauigkeit unbekannt"
        : `Genauigkeit ca. ${Math.round(locationCheckpoint.accuracyMeters)} m`;

    return {
      ...checkpoint,
      accentClassName: "bg-rfSuccess",
      description: accuracyLabel,
      statusLabel: "Gespeichert",
    };
  }

  if (locationCheckpoint.status === "missing") {
    return {
      ...checkpoint,
      accentClassName: "bg-rfWarning",
      description: locationCheckpoint.message,
      statusLabel: "Fehlt",
    };
  }

  return checkpoint;
}

export default function HomeScreen() {
  const { profile } = useMobileAuth();
  const hydratedProfile = useMobileProfileHydration();
  const [todayShift, setTodayShift] = useState<Shift | null>(null);
  const [unreadMailboxCount, setUnreadMailboxCount] = useState(0);
  const hasAssignedDepot = Boolean(profile?.primary_depot_id);
  const shiftTimer = useLocalShiftTimer({
    companyId: profile?.company_id ?? null,
    courierProfileId: profile?.id ?? null,
    currentDepotId: profile?.primary_depot_id ?? null,
    enabled: Boolean(profile),
    paymentMode: profile?.payment_mode ?? baseCurrentShiftViewModel.paymentMode,
  });

  useEffect(() => {
    let isActive = true;

    async function loadUnreadMailboxCount() {
      if (!profile) {
        setUnreadMailboxCount(0);
        return;
      }

      const result = await loadCourierMailboxItems(
        profile.company_id,
        profile.id,
      );

      if (!isActive) {
        return;
      }

      setUnreadMailboxCount(
        result.error ? 0 : result.items.filter((item) => !item.readAt).length,
      );
    }

    void loadUnreadMailboxCount();

    return () => {
      isActive = false;
    };
  }, [profile]);

  useEffect(() => {
    let isActive = true;

    async function loadTodayShiftCounters() {
      if (!profile) {
        setTodayShift(null);
        return;
      }

      const result = await loadTodayCourierShift(
        profile.id,
        profile.company_id,
      );

      if (!isActive) {
        return;
      }

      setTodayShift(result.error ? null : result.shift);
    }

    void loadTodayShiftCounters();

    return () => {
      isActive = false;
    };
  }, [profile]);
  const isShiftRunning = shiftTimer.status === "running";
  const isShiftEnded = shiftTimer.status === "ended";
  const isShiftAutoStopped = shiftTimer.status === "auto_stopped";
  const isAutoStopWarning = isShiftRunning && shiftTimer.isAutoStopWarning;
  const isDailyFixedMode = shiftTimer.activeShift.paymentMode === "daily_fixed";
  const isCapturingStartLocation = shiftTimer.capturingLocationType === "start";
  const isCapturingStopLocation = shiftTimer.capturingLocationType === "stop";
  const hasMissingLocation =
    shiftTimer.activeShift.startLocation.status === "missing" ||
    shiftTimer.activeShift.stopLocation.status === "missing";
  const hasCapturedStartLocation =
    shiftTimer.activeShift.startLocation.status === "captured";
  const hasCapturedStopLocation =
    shiftTimer.activeShift.stopLocation.status === "captured";
  const hasOutsideGeofence =
    shiftTimer.activeShift.startLocation.isInsideDepotGeofence === false ||
    shiftTimer.activeShift.stopLocation.isInsideDepotGeofence === false;
  const hasServerSavedLocation =
    shiftTimer.activeShift.startLocation.distanceFromDepotMeters !== null ||
    shiftTimer.activeShift.stopLocation.distanceFromDepotMeters !== null;
  const locationStatusLabel = shiftTimer.isCapturingLocation
    ? "GPS pruefen"
    : hasOutsideGeofence
      ? "Depot-Warnung"
      : hasMissingLocation
        ? "GPS fehlt"
        : hasCapturedStartLocation &&
            (hasCapturedStopLocation || isShiftRunning)
          ? "GPS gespeichert"
          : "GPS offen";
  const locationStatusTone = shiftTimer.isCapturingLocation
    ? "warning"
    : hasOutsideGeofence
      ? "error"
      : hasMissingLocation
        ? "warning"
        : hasCapturedStartLocation &&
            (hasCapturedStopLocation || isShiftRunning)
          ? "success"
          : "warning";
  const locationStatusIconClassName = hasOutsideGeofence
    ? "bg-rfErrorLightest"
    : hasMissingLocation
      ? "bg-rfWarningLightest"
      : hasCapturedStartLocation || hasCapturedStopLocation
        ? "bg-rfSuccessLightest"
        : "bg-rfWarningLightest";
  const locationStatusIconTextClassName = hasOutsideGeofence
    ? "text-rfErrorForeground"
    : hasMissingLocation
      ? "text-rfWarningForeground"
      : hasCapturedStartLocation || hasCapturedStopLocation
        ? "text-rfSuccessForeground"
        : "text-rfWarningForeground";
  const locationSummary = shiftTimer.isCapturingLocation
    ? "RouteForge fragt den Standort nur fuer diesen Checkpoint ab."
    : hasOutsideGeofence
      ? "Standort ist gespeichert und liegt ausserhalb des Depotbereichs."
      : hasMissingLocation
        ? "Schicht laeuft weiter. Fehlender Standort wird spaeter als Warnung sichtbar."
        : hasServerSavedLocation &&
            hasCapturedStartLocation &&
            hasCapturedStopLocation
          ? "Start- und Endstandort serverseitig gespeichert. Keine Live-Ortung."
          : hasServerSavedLocation && hasCapturedStartLocation
            ? "Startstandort serverseitig gespeichert. Ende wird beim Schichtende erfasst."
            : hasCapturedStartLocation && hasCapturedStopLocation
              ? "Start- und Endstandort lokal gespeichert. Keine Live-Ortung."
              : hasCapturedStartLocation
                ? "Startstandort lokal gespeichert. Ende wird beim Schichtende erfasst."
                : baseCurrentShiftViewModel.locationSummary;
  const syncStatusLabel =
    shiftTimer.backendStatus === "loading"
      ? "Server pruefen"
      : shiftTimer.backendStatus === "saving"
        ? "Server speichert"
        : shiftTimer.backendError
          ? "Serverfehler"
          : "Server synchron";
  const syncStatusTone =
    shiftTimer.backendStatus !== "idle"
      ? "warning"
      : shiftTimer.backendError
        ? "error"
        : "success";
  const breakHint = isShiftAutoStopped
    ? "Automatisch bei 10:00h gestoppt"
    : isDailyFixedMode
      ? "Echte Pausenzeit wird gespeichert"
      : isShiftRunning
        ? "Pausen werden spaeter berechnet"
        : baseCurrentShiftViewModel.breakHint;
  const dailyFixedPaymentSummary =
    isShiftRunning && shiftTimer.startedAtLabel
      ? `Gestartet um ${shiftTimer.startedAtLabel} Uhr. Echte Arbeitszeit laeuft weiter.`
      : isShiftEnded
        ? `Schichtzeit erfasst. Abrechnung standardmaessig ${shiftTimer.billableTimeLabel}.`
        : `Echte Arbeitszeit wird gespeichert. Abrechnung standardmaessig ${shiftTimer.billableTimeLabel}.`;
  const paymentSummary = isDailyFixedMode
    ? dailyFixedPaymentSummary
    : isShiftAutoStopped
      ? "Automatisch bei 10:00h beendet. Mehrzeit kann nur im Review korrigiert werden."
      : isAutoStopWarning
        ? "Noch weniger als 30 Min. bis zum 10:00h Limit."
        : isShiftRunning && shiftTimer.startedAtLabel
          ? `Gestartet um ${shiftTimer.startedAtLabel} Uhr. Max. 10:00h abrechenbar.`
          : baseCurrentShiftViewModel.paymentSummary;
  const primaryActionLabel = isShiftRunning
    ? shiftTimer.backendStatus === "saving" && !isCapturingStopLocation
      ? "Server speichert..."
      : isCapturingStopLocation
        ? "Standort pruefen..."
        : "Schicht beenden"
    : shiftTimer.backendStatus === "loading"
      ? "Server pruefen..."
      : shiftTimer.backendStatus === "saving" && !isCapturingStartLocation
        ? "Server speichert..."
        : isShiftAutoStopped
          ? "Automatisch beendet"
          : isShiftEnded
            ? "Schicht beendet"
            : !hasAssignedDepot
              ? "Kein Depot zugewiesen"
              : isCapturingStartLocation
                ? "Standort pruefen..."
                : "Schicht starten";
  const proofSummary = isShiftAutoStopped
    ? "Schicht wurde bei 10:00h gestoppt. Tagesbericht bleibt offen."
    : isShiftRunning
      ? "Startzeit erfasst. Fotos bleiben im Tagesbericht offen."
      : isShiftEnded
        ? "Schichtzeit erfasst. Tagesbericht bleibt offen."
        : baseCurrentShiftViewModel.proofSummary;
  const reportStatusLabel = isShiftRunning
    ? "Schicht laeuft"
    : isShiftEnded || isShiftAutoStopped
      ? "Entwurf offen"
      : todayShift
        ? getTodayShiftReportStatusLabel(todayShift.status)
        : baseCurrentShiftViewModel.reportStatusLabel;
  const statusLabel = isShiftAutoStopped
    ? "Auto-Stopp 10:00h"
    : isAutoStopWarning
      ? "Limit bald erreicht"
      : isShiftRunning
        ? "Schicht laeuft"
        : isShiftEnded
          ? "Schicht beendet"
          : baseCurrentShiftViewModel.statusLabel;
  const statusTone =
    isShiftAutoStopped || isAutoStopWarning
      ? "warning"
      : isShiftRunning
        ? "info"
        : isShiftEnded
          ? "neutral"
          : "success";

  const currentShift: CurrentShiftViewModel = {
    ...baseCurrentShiftViewModel,
    billableSummary: isDailyFixedMode
      ? {
          helper: "Admin/Dispatcher kann im Review mit Grund korrigieren.",
          label: "Abrechenbar",
          value: shiftTimer.billableTimeLabel,
        }
      : null,
    breakHint,
    checkpoints: baseCurrentShiftViewModel.checkpoints.map((checkpoint) =>
      checkpoint.label === "Start (GPS)"
        ? buildLocationCheckpointDisplay(
            checkpoint,
            shiftTimer.activeShift.startLocation,
            isCapturingStartLocation,
          )
        : buildLocationCheckpointDisplay(
            checkpoint,
            shiftTimer.activeShift.stopLocation,
            isCapturingStopLocation,
          ),
    ),
    locationSummary,
    packageMetrics: buildPackageMetrics(todayShift),
    depotAddress: hydratedProfile.depotAddressLabel,
    depotName: hydratedProfile.depotName,
    paymentSummary,
    paymentModeLabel: isDailyFixedMode ? "Tagespauschale" : "Stundenbasis",
    plannedStartLabel:
      shiftTimer.status !== "idle" && shiftTimer.startedAtLabel
        ? shiftTimer.startedAtLabel
        : todayShift?.start_time
          ? formatShiftTime(todayShift.start_time)
          : baseCurrentShiftViewModel.plannedStartLabel,
    primaryActionLabel,
    proofSummary,
    reportStatusLabel,
    statusLabel,
    statusTone,
    timerTitleLabel: isDailyFixedMode
      ? "Echte Arbeitszeit heute"
      : "Arbeitszeit heute",
    timerLabel: shiftTimer.timerLabel,
    vehicleLabel:
      todayShift?.van_plate || baseCurrentShiftViewModel.vehicleLabel,
    vehicleStatusLabel: todayShift?.van_plate
      ? "Heute"
      : baseCurrentShiftViewModel.vehicleStatusLabel,
  };
  const handlePrimaryShiftAction = isShiftRunning
    ? shiftTimer.stopShift
    : shiftTimer.startShift;

  return (
    <MobileScreen>
      <MobileHeader />

      {shiftTimer.backendError ? (
        <RouteForgeCard compact>
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfErrorLightest">
              <RfIcon
                className="text-rfErrorForeground"
                name="alert-circle-outline"
                size={24}
              />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
                Schicht konnte nicht synchronisiert werden
              </Text>
              <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
                {shiftTimer.backendError}
              </Text>
            </View>
            <StatusBadge label="Pruefen" tone="error" />
          </View>
        </RouteForgeCard>
      ) : null}

      <CurrentShiftCard
        onPrimaryAction={handlePrimaryShiftAction}
        primaryActionDisabled={
          !hasAssignedDepot ||
          isShiftEnded ||
          isShiftAutoStopped ||
          shiftTimer.isBackendBusy ||
          shiftTimer.isCapturingLocation
        }
        primaryActionIconName={
          isShiftRunning || isShiftAutoStopped ? "stop" : "play"
        }
        shift={currentShift}
      />

      <View className="flex-row gap-3">
        <RouteForgeCard className="min-h-[132px] flex-1" compact>
          <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
            <RfIcon className="text-rfPrimary" name="warehouse" size={22} />
          </View>
          <View className="gap-1">
            <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
              Depot
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              {hydratedProfile.depotName}
            </Text>
            <Text className="text-xs font-medium leading-4 text-rfTextMuted">
              {hydratedProfile.depotAddressLabel}
            </Text>
          </View>
        </RouteForgeCard>

        <RouteForgeCard className="min-h-[132px] flex-1" compact>
          <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
            <RfIcon
              className="text-rfPrimary"
              name="truck-delivery-outline"
              size={22}
            />
          </View>
          <View className="gap-1">
            <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
              Fahrzeug
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              {currentShift.vehicleLabel}
            </Text>
            <StatusBadge
              label={currentShift.vehicleStatusLabel}
              tone="neutral"
            />
          </View>
        </RouteForgeCard>
      </View>

      <RouteForgeCard compact>
        <View className="flex-row items-center gap-3">
          <View
            className={`h-12 w-12 items-center justify-center rounded-rfLg ${locationStatusIconClassName}`}
          >
            <RfIcon
              className={locationStatusIconTextClassName}
              name="crosshairs-gps"
              size={24}
            />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
              Standortstatus
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              {currentShift.locationSummary}
            </Text>
          </View>
          <StatusBadge label={locationStatusLabel} tone={locationStatusTone} />
        </View>
      </RouteForgeCard>

      <RouteForgeCard>
        <View className="flex-row items-center justify-between gap-3">
          <View className="gap-0.5">
            <Text className="text-[16px] font-extrabold leading-6 text-rfTextPrimary">
              Pakete heute
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              Wird im Tagesbericht erfasst.
            </Text>
          </View>
          <RfIcon className="text-rfPrimary" name="package-variant" size={24} />
        </View>

        <View className="flex-row gap-2.5">
          {currentShift.packageMetrics.map((metric) => (
            <PackageMetricCard
              helper={metric.helper}
              iconName={metric.iconName}
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </View>
      </RouteForgeCard>

      <RouteForgeCard compact>
        <View className="flex-row items-center justify-between gap-3">
          <View className="gap-0.5">
            <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
              Tagesuebersicht
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              Bericht: {currentShift.reportStatusLabel}
            </Text>
          </View>
          <StatusBadge label={syncStatusLabel} tone={syncStatusTone} />
        </View>
      </RouteForgeCard>

      <View className="flex-row gap-2.5">
        <RouteForgeCard className="min-h-32 flex-1" compact>
          <View className="flex-row items-center justify-between gap-2">
            <RfIcon
              className="text-rfPrimary"
              name="clipboard-text-outline"
              size={24}
            />
            <RfIcon
              className="text-rfTextSecondary"
              name="chevron-right"
              size={21}
            />
          </View>
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
            Tagesbericht
          </Text>
          <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
            Tourdaten erfassen
          </Text>
        </RouteForgeCard>
        <RouteForgeCard className="min-h-32 flex-1" compact>
          <View className="flex-row items-center justify-between gap-2">
            <RfIcon className="text-rfPrimary" name="email-outline" size={24} />
            <RfIcon
              className="text-rfTextSecondary"
              name="chevron-right"
              size={21}
            />
          </View>
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
            Postfach
          </Text>
          <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
            {unreadMailboxCount > 0
              ? `${unreadMailboxCount} ungelesen`
              : "Keine neuen Eintraege"}
          </Text>
        </RouteForgeCard>
        <RouteForgeCard className="min-h-32 flex-1" compact>
          <View className="flex-row items-center justify-between gap-2">
            <RfIcon
              className="text-rfPrimary"
              name="account-circle-outline"
              size={24}
            />
            <RfIcon
              className="text-rfTextSecondary"
              name="chevron-right"
              size={21}
            />
          </View>
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
            Profil
          </Text>
          <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
            Daten pruefen
          </Text>
        </RouteForgeCard>
      </View>

      <RouteForgeCard highlighted compact>
        <View className="flex-row items-center gap-3">
          <RfIcon
            className="text-rfPrimary"
            name="shield-check-outline"
            size={24}
          />
          <View className="flex-1 gap-0.5">
            <Text className="text-[15px] font-extrabold leading-5 text-rfPrimaryDarker">
              Sicherheit geht vor
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              Pausenzeiten und Standortfreigabe pruefen.
            </Text>
          </View>
        </View>
      </RouteForgeCard>
    </MobileScreen>
  );
}
