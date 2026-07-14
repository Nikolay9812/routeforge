import { Pressable, Text, View } from "react-native";

import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { CurrentShiftViewModel } from "@/features/shifts/currentShiftViewModel";

type CurrentShiftCardProps = {
  shift: CurrentShiftViewModel;
  onPrimaryAction: () => void;
  primaryActionDisabled?: boolean;
  primaryActionIconName?: RfIconName;
};

type DetailItemProps = {
  iconName: RfIconName;
  label: string;
  title: string;
  helper?: string;
};

type CheckpointRowProps = {
  accentClassName: string;
  description: string;
  iconName: RfIconName;
  label: string;
  statusLabel: string;
};

function DetailItem({ helper, iconName, label, title }: DetailItemProps) {
  return (
    <View className="flex-1 flex-row gap-3">
      <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
        <RfIcon className="text-rfPrimary" name={iconName} size={24} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
          {label}
        </Text>
        <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
          {title}
        </Text>
        {helper ? (
          <Text className="text-xs font-medium leading-4 text-rfTextSubtle">{helper}</Text>
        ) : null}
      </View>
    </View>
  );
}

function CheckpointRow({
  accentClassName,
  description,
  iconName,
  label,
  statusLabel,
}: CheckpointRowProps) {
  return (
    <View className="flex-row items-center gap-3 py-1">
      <View className={`h-12 w-12 items-center justify-center rounded-full ${accentClassName}`}>
        <RfIcon className="text-rfTextInverse" name={iconName} size={23} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[14px] font-extrabold leading-5 text-rfTextPrimary">
          {label}
        </Text>
        <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
          {description}
        </Text>
      </View>
      <View className="min-h-10 items-center justify-center rounded-rfLg border border-rfBorderStrong bg-rfSurface px-3">
        <Text className="text-[13px] font-bold leading-[18px] text-rfTextSecondary">
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

export function CurrentShiftCard({
  onPrimaryAction,
  primaryActionDisabled = false,
  primaryActionIconName = "play",
  shift,
}: CurrentShiftCardProps) {
  const primaryActionClassName = primaryActionDisabled ? "bg-rfNeutralLight" : "bg-rfPrimary";
  const primaryActionTextClassName = primaryActionDisabled
    ? "text-rfTextMuted"
    : "text-rfTextInverse";

  return (
    <RouteForgeCard className="gap-5">
      <View className="flex-row items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-rfXl bg-rfPrimaryLightest">
          <RfIcon className="text-rfPrimary" name="calendar-clock" size={29} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-xl font-extrabold leading-7 text-rfTextPrimary">
            Aktuelle Schicht
          </Text>
          <Text className="text-[13px] font-medium leading-[18px] text-rfTextSubtle">
            Heute, {shift.dateLabel}
          </Text>
        </View>
        <StatusBadge label={shift.statusLabel} tone={shift.statusTone} />
      </View>

      <View className="h-px bg-rfBorder" />

      <View className="items-center gap-3 rounded-rf2xl bg-rfSurfaceSecondary px-4 py-5">
        <Text className="text-[13px] font-bold leading-[18px] text-rfTextSecondary">
          {shift.timerTitleLabel}
        </Text>
        <Text className="text-[44px] font-extrabold leading-[52px] text-rfTextPrimary">
          {shift.timerLabel}
        </Text>
        <View className="items-center gap-2">
          <StatusBadge label={shift.paymentModeLabel} tone="info" />
          <Text className="text-center text-xs font-medium leading-4 text-rfTextSubtle">
            {shift.paymentSummary}
          </Text>
        </View>
        {shift.billableSummary ? (
          <View className="w-full rounded-rfXl border border-rfBorderLight bg-rfSurface px-3 py-3">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 gap-0.5">
                <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
                  {shift.billableSummary.label}
                </Text>
                <Text className="text-xs font-medium leading-4 text-rfTextSubtle">
                  {shift.billableSummary.helper}
                </Text>
              </View>
              <Text className="text-[22px] font-extrabold leading-7 text-rfPrimaryDarker">
                {shift.billableSummary.value}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="gap-5">
        <View className="flex-row gap-4">
          <DetailItem
            iconName="office-building-marker-outline"
            label="Depot"
            title={shift.depotName}
          />
          <DetailItem
            helper={shift.plannedDurationLabel}
            iconName="clock-outline"
            label="Zeitfenster"
            title={shift.plannedWindowLabel}
          />
        </View>

        <View className="h-px bg-rfBorderLight" />

        <View className="flex-row gap-4">
          <DetailItem
            iconName="clock-start"
            label="Geplanter Start"
            title={shift.plannedStartLabel}
          />
          <DetailItem
            helper={shift.breakHint}
            iconName="coffee-outline"
            label="Pause"
            title={shift.breakLabel}
          />
        </View>
      </View>

      <View className="h-px bg-rfBorder" />

      <View className="gap-3">
        <Text className="text-[16px] font-extrabold leading-6 text-rfTextPrimary">
          Schicht-Checkpoints
        </Text>
        {shift.checkpoints.map((checkpoint) => (
          <CheckpointRow
            accentClassName={checkpoint.accentClassName}
            description={checkpoint.description}
            iconName={checkpoint.iconName}
            key={checkpoint.label}
            label={checkpoint.label}
            statusLabel={checkpoint.statusLabel}
          />
        ))}
      </View>

      <View className="h-px bg-rfBorder" />

      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
          <RfIcon className="text-rfPrimary" name="shield-check-outline" size={24} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
            Schicht-Nachweise
          </Text>
          <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
            {shift.proofSummary}
          </Text>
        </View>
        <RfIcon className="text-rfTextSecondary" name="chevron-right" size={24} />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={primaryActionDisabled}
        onPress={onPrimaryAction}
        className={`min-h-[56px] flex-row items-center justify-center gap-2 rounded-rfXl ${primaryActionClassName}`}>
        <RfIcon className={primaryActionTextClassName} name={primaryActionIconName} size={21} />
        <Text className={`text-[16px] font-extrabold leading-5 ${primaryActionTextClassName}`}>
          {shift.primaryActionLabel}
        </Text>
      </Pressable>
    </RouteForgeCard>
  );
}

