import { Pressable, Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { DailyReportValidationDraft } from "@/features/report/dailyReportValidation";
import type {
  DailyReportFormState,
  DailyWorkflowStep,
} from "@/features/report/dailyReportWorkflowTypes";

type HeaderMetricProps = {
  iconName: "calendar-month-outline" | "clock-outline" | "routes";
  label: string;
  showDivider?: boolean;
  value: string;
};

export function HeaderMetric({
  iconName,
  label,
  showDivider = true,
  value,
}: HeaderMetricProps) {
  return (
    <View
      className={`flex-1 gap-1 p-3.5 ${
        showDivider ? "border-r border-rfBorderLight" : ""
      }`}
    >
      <RfIcon className="text-rfPrimary" name={iconName} size={22} />
      <Text className="text-[13px] font-bold leading-[18px] text-rfTextPrimary">
        {label}
      </Text>
      <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
        {value}
      </Text>
    </View>
  );
}

export function WorkflowStepper({
  currentStep,
}: {
  currentStep: DailyWorkflowStep;
}) {
  const steps: { label: string; step: DailyWorkflowStep }[] = [
    { label: "Start", step: 1 },
    { label: "Ausfuellen", step: 2 },
    { label: "Unterschrift", step: 3 },
    { label: "Fertig", step: 4 },
  ];

  return (
    <View className="flex-row gap-2">
      {steps.map((item) => {
        const isActive = currentStep === item.step;
        const isDone = currentStep > item.step;

        return (
          <View
            className={`min-h-[52px] flex-1 items-center justify-center gap-1 rounded-rfXl border px-2 py-2 ${
              isActive
                ? "border-rfPrimary bg-rfPrimaryLightest"
                : isDone
                  ? "border-rfSuccessLight bg-rfSuccessLightest"
                  : "border-rfBorderLight bg-rfSurfaceSecondary"
            }`}
            key={item.step}
          >
            <Text
              className={`text-[12px] font-extrabold leading-4 ${
                isActive
                  ? "text-rfPrimary"
                  : isDone
                    ? "text-rfSuccessForeground"
                    : "text-rfTextMuted"
              }`}
            >
              {item.step}. {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

type WorkflowTimerCardProps = {
  helper: string;
  statusLabel: string;
  timerLabel: string;
};

export function WorkflowTimerCard({
  helper,
  statusLabel,
  timerLabel,
}: WorkflowTimerCardProps) {
  return (
    <View className="gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[16px] font-extrabold leading-6 text-rfTextPrimary">
          Heutige Schicht
        </Text>
        <StatusBadge label={statusLabel} tone="info" />
      </View>
      <Text className="text-center text-[44px] font-extrabold leading-[52px] text-rfTextPrimary">
        {timerLabel}
      </Text>
      <Text className="text-center text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
        {helper}
      </Text>
    </View>
  );
}

type StartWorkflowCardProps = {
  backendError: string | null;
  disabled: boolean;
  isStarting: boolean;
  onStart: () => Promise<void>;
  timerLabel: string;
};

export function StartWorkflowCard({
  backendError,
  disabled,
  isStarting,
  onStart,
  timerLabel,
}: StartWorkflowCardProps) {
  return (
    <View className="gap-5 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
      <View className="items-center gap-4">
        <View className="h-[188px] w-[188px] items-center justify-center rounded-full border-8 border-rfPrimaryLightest bg-rfSurface">
          <RfIcon className="text-rfTextMuted" name="clock-outline" size={34} />
          <Text className="mt-4 text-[34px] font-extrabold leading-[42px] text-rfTextPrimary">
            {timerLabel}
          </Text>
          <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
            Schichtzeit
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className={`min-h-[56px] w-full flex-row items-center justify-center gap-3 rounded-rfXl px-5 py-3 ${
            disabled ? "bg-rfNeutralLight" : "bg-rfPrimary"
          }`}
          disabled={disabled}
          onPress={onStart}
        >
          <RfIcon
            className={disabled ? "text-rfTextMuted" : "text-rfTextInverse"}
            name={isStarting ? "crosshairs-gps" : "play"}
            size={24}
          />
          <Text
            className={`text-[15px] font-extrabold leading-5 ${
              disabled ? "text-rfTextMuted" : "text-rfTextInverse"
            }`}
          >
            {isStarting ? "Schicht wird gestartet" : "Schicht starten"}
          </Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-3 rounded-rf2xl bg-rfPrimaryLightest p-3">
        <RfIcon className="text-rfPrimary" name="information-outline" size={22} />
        <Text className="flex-1 text-[13px] font-semibold leading-[18px] text-rfPrimaryDarker">
          Starte deine Schicht. Danach fuellst du Daten und Nachweise aus.
        </Text>
      </View>

      {backendError ? (
        <View className="flex-row items-center gap-2 rounded-rf2xl border border-rfErrorLight bg-rfErrorLightest p-3">
          <RfIcon
            className="text-rfErrorForeground"
            name="alert-circle-outline"
            size={20}
          />
          <Text className="flex-1 text-[12px] font-bold leading-4 text-rfErrorForeground">
            {backendError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function WorkflowDoneCard({
  onOpenHistory,
}: {
  onOpenHistory: () => void;
}) {
  return (
    <View className="gap-5 rounded-rf3xl border border-rfSuccessLight bg-rfSuccessLightest p-5">
      <View className="items-center gap-4 py-4">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-rfSuccess">
          <RfIcon className="text-rfTextInverse" name="check" size={46} />
        </View>
        <View className="items-center gap-1">
          <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
            Bericht eingereicht
          </Text>
          <Text className="text-center text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
            Keine Aufgaben mehr fuer heute. Morgen startet ein neuer Workflow.
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-rfXl border border-rfBorder bg-rfSurface px-5 py-3"
        onPress={onOpenHistory}
      >
        <RfIcon className="text-rfTextPrimary" name="calendar-month-outline" size={22} />
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
          Zur Historie
        </Text>
      </Pressable>
    </View>
  );
}

type WorkflowNavigationProps = {
  currentStep: DailyWorkflowStep;
  isNextBusy: boolean;
  isNextDisabled: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
};

export function WorkflowNavigation({
  currentStep,
  isNextBusy,
  isNextDisabled,
  nextLabel,
  onBack,
  onNext,
}: WorkflowNavigationProps) {
  if (currentStep === 2) {
    const nextButtonClassName = isNextDisabled
      ? "bg-rfNeutralLight"
      : "bg-rfPrimary";
    const nextTextClassName = isNextDisabled
      ? "text-rfTextMuted"
      : "text-rfTextInverse";

    return (
      <Pressable
        accessibilityRole="button"
        className={`min-h-[52px] flex-row items-center justify-center gap-2 rounded-rfXl px-5 py-3 ${nextButtonClassName}`}
        disabled={isNextDisabled}
        onPress={onNext}
      >
        <Text className={`text-[15px] font-extrabold leading-5 ${nextTextClassName}`}>
          {isNextBusy ? "Schicht wird beendet" : nextLabel}
        </Text>
        <RfIcon className={nextTextClassName} name="arrow-right" size={22} />
      </Pressable>
    );
  }

  if (currentStep === 3) {
    return (
      <Pressable
        accessibilityRole="button"
        className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-rfXl border border-rfBorder bg-rfSurface px-5 py-3"
        onPress={onBack}
      >
        <RfIcon className="text-rfTextPrimary" name="arrow-left" size={22} />
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
          Zurueck und aendern
        </Text>
      </Pressable>
    );
  }

  return null;
}

type ReviewSummaryCardProps = {
  formState: DailyReportFormState;
  timeLabel: string;
  validationDraft: DailyReportValidationDraft;
};

export function ReviewSummaryCard({
  formState,
  timeLabel,
  validationDraft,
}: ReviewSummaryCardProps) {
  return (
    <View className="gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
      <Text className="text-[16px] font-extrabold leading-6 text-rfTextPrimary">
        Zusammenfassung
      </Text>
      <View className="gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-4">
        <WorkflowSummaryRow label="Arbeitszeit" value={timeLabel} />
        <WorkflowSummaryRow label="Tournummer" value={formState.tourNumber || "-"} />
        <WorkflowSummaryRow label="Kennzeichen" value={formState.vanPlate || "-"} />
        <WorkflowSummaryRow
          label="Start-KM"
          value={formatWorkflowKm(validationDraft.startKm)}
        />
        <WorkflowSummaryRow
          label="End-KM"
          value={formatWorkflowKm(validationDraft.endKm)}
        />
        <WorkflowSummaryRow
          label="Zustellungen"
          value={formState.packagesDelivered || "0"}
        />
        <WorkflowSummaryRow
          label="Ruecklaeufer"
          value={formState.packagesReturned || "0"}
        />
        <WorkflowSummaryRow label="Abholungen" value={formState.packagesPickedUp || "0"} />
        <WorkflowSummaryRow label="Stopps" value={formState.totalStops || "0"} />
      </View>
    </View>
  );
}

function WorkflowSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
        {label}
      </Text>
      <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
        {value}
      </Text>
    </View>
  );
}

function formatWorkflowKm(value: number): string {
  return value >= 0 ? new Intl.NumberFormat("de-DE").format(value) : "-";
}
