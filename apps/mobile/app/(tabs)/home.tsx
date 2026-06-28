import { Text, View } from "react-native";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { CurrentShiftCard } from "@/components/shift/CurrentShiftCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  mockCurrentShift,
  type CurrentShiftMetricMock,
  type CurrentShiftMock,
} from "@/features/mock/currentShift";
import { useLocalShiftTimer } from "@/features/shifts/useLocalShiftTimer";

function PackageMetricCard({ helper, iconName, label, value }: CurrentShiftMetricMock) {
  return (
    <View className="flex-1 gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3">
      <View className="h-10 w-10 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
        <RfIcon className="text-rfPrimary" name={iconName} size={21} />
      </View>
      <View className="gap-0.5">
        <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
          {value}
        </Text>
        <Text className="text-xs font-extrabold leading-4 text-rfTextPrimary">{label}</Text>
        <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
          {helper}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const shiftTimer = useLocalShiftTimer({
    currentDepotId: mockCurrentShift.depotId,
    paymentMode: mockCurrentShift.paymentMode,
  });
  const isShiftRunning = shiftTimer.status === "running";
  const isShiftEnded = shiftTimer.status === "ended";
  const isShiftAutoStopped = shiftTimer.status === "auto_stopped";
  const isAutoStopWarning = isShiftRunning && shiftTimer.isAutoStopWarning;
  const breakHint = isShiftAutoStopped
    ? "Automatisch bei 10:00h gestoppt"
    : isShiftRunning
      ? "Pausen werden spaeter berechnet"
      : mockCurrentShift.breakHint;
  const paymentSummary = isShiftAutoStopped
    ? "Automatisch bei 10:00h beendet. Mehrzeit kann nur im Review korrigiert werden."
    : isAutoStopWarning
      ? "Noch weniger als 30 Min. bis zum 10:00h Limit."
      : isShiftRunning && shiftTimer.startedAtLabel
        ? `Gestartet um ${shiftTimer.startedAtLabel} Uhr. Max. 10:00h abrechenbar.`
        : mockCurrentShift.paymentSummary;
  const primaryActionLabel = isShiftRunning
    ? "Schicht beenden"
    : isShiftAutoStopped
      ? "Automatisch beendet"
      : isShiftEnded
        ? "Schicht beendet"
        : "Schicht starten";
  const proofSummary = isShiftAutoStopped
    ? "Schicht wurde bei 10:00h gestoppt. Tagesbericht bleibt offen."
    : isShiftRunning
      ? "Startzeit erfasst. Fotos bleiben im Tagesbericht offen."
      : isShiftEnded
        ? "Schichtzeit erfasst. Tagesbericht bleibt offen."
        : mockCurrentShift.proofSummary;
  const reportStatusLabel = isShiftRunning
    ? "Schicht laeuft"
    : isShiftEnded || isShiftAutoStopped
      ? "Entwurf offen"
      : mockCurrentShift.reportStatusLabel;
  const statusLabel = isShiftAutoStopped
    ? "Auto-Stopp 10:00h"
    : isAutoStopWarning
      ? "Limit bald erreicht"
      : isShiftRunning
        ? "Schicht laeuft"
        : isShiftEnded
          ? "Schicht beendet"
          : mockCurrentShift.statusLabel;
  const statusTone = isShiftAutoStopped || isAutoStopWarning
    ? "warning"
    : isShiftRunning
      ? "info"
      : isShiftEnded
        ? "neutral"
        : "success";

  const currentShift: CurrentShiftMock = {
    ...mockCurrentShift,
    breakHint,
    checkpoints: mockCurrentShift.checkpoints.map((checkpoint) => {
      if (checkpoint.label !== "Start (GPS)") {
        return (isShiftEnded || isShiftAutoStopped) && checkpoint.label === "Ende (GPS)"
          ? { ...checkpoint, statusLabel: "Zeit erfasst" }
          : checkpoint;
      }

      if (shiftTimer.status === "idle") {
        return checkpoint;
      }

      return {
        ...checkpoint,
        statusLabel: "Zeit erfasst",
      };
    }),
    paymentSummary,
    plannedStartLabel:
      shiftTimer.status !== "idle" && shiftTimer.startedAtLabel
        ? shiftTimer.startedAtLabel
        : mockCurrentShift.plannedStartLabel,
    primaryActionLabel,
    proofSummary,
    reportStatusLabel,
    statusLabel,
    statusTone,
    timerLabel: shiftTimer.timerLabel,
  };
  const handlePrimaryShiftAction = isShiftRunning ? shiftTimer.stopShift : shiftTimer.startShift;

  return (
    <MobileScreen>
      <MobileHeader />

      <CurrentShiftCard
        onPrimaryAction={handlePrimaryShiftAction}
        primaryActionDisabled={isShiftEnded || isShiftAutoStopped}
        primaryActionIconName={isShiftRunning || isShiftAutoStopped ? "stop" : "play"}
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
              {mockCurrentShift.depotName}
            </Text>
            <Text className="text-xs font-medium leading-4 text-rfTextMuted">
              {mockCurrentShift.depotAddress}
            </Text>
          </View>
        </RouteForgeCard>

        <RouteForgeCard className="min-h-[132px] flex-1" compact>
          <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
            <RfIcon className="text-rfPrimary" name="truck-delivery-outline" size={22} />
          </View>
          <View className="gap-1">
            <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
              Fahrzeug
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              {mockCurrentShift.vehicleLabel}
            </Text>
            <StatusBadge label={mockCurrentShift.vehicleStatusLabel} tone="neutral" />
          </View>
        </RouteForgeCard>
      </View>

      <RouteForgeCard compact>
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfWarningLightest">
            <RfIcon className="text-rfWarningForeground" name="crosshairs-gps" size={24} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
              Standortstatus
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              {mockCurrentShift.locationSummary}
            </Text>
          </View>
          <StatusBadge label="GPS offen" tone="warning" />
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
          {mockCurrentShift.packageMetrics.map((metric) => (
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
              Tagesübersicht
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              Bericht: {currentShift.reportStatusLabel}
            </Text>
          </View>
          <StatusBadge label={mockCurrentShift.syncStatusLabel} tone="success" />
        </View>
      </RouteForgeCard>

      <View className="flex-row gap-2.5">
        <RouteForgeCard className="min-h-32 flex-1" compact>
          <View className="flex-row items-center justify-between gap-2">
            <RfIcon className="text-rfPrimary" name="clipboard-text-outline" size={24} />
            <RfIcon className="text-rfTextSecondary" name="chevron-right" size={21} />
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
            <RfIcon className="text-rfTextSecondary" name="chevron-right" size={21} />
          </View>
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">Postfach</Text>
          <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
            1 ungelesen
          </Text>
        </RouteForgeCard>
        <RouteForgeCard className="min-h-32 flex-1" compact>
          <View className="flex-row items-center justify-between gap-2">
            <RfIcon className="text-rfPrimary" name="account-circle-outline" size={24} />
            <RfIcon className="text-rfTextSecondary" name="chevron-right" size={21} />
          </View>
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">Profil</Text>
          <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
            Daten prüfen
          </Text>
        </RouteForgeCard>
      </View>

      <RouteForgeCard highlighted compact>
        <View className="flex-row items-center gap-3">
          <RfIcon className="text-rfPrimary" name="shield-check-outline" size={24} />
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
