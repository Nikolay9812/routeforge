import { Pressable, Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { HistoryShiftViewModel, HistoryShiftStatus } from "@/features/history/historyTypes";

type SelectedDaySummaryProps = {
  helper: string;
  onOpenDetails?: () => void;
  shift: HistoryShiftViewModel;
};

const statusTone: Record<HistoryShiftStatus, "success" | "info" | "warning"> = {
  approved: "success",
  draft: "warning",
  rejected: "warning",
  submitted: "info",
};

export function SelectedDaySummary({ helper, onOpenDetails, shift }: SelectedDaySummaryProps) {
  return (
    <View className="gap-3.5 rounded-rf3xl border border-rfPrimaryLight bg-rfPrimaryLightest p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="gap-0.5">
          <Text className="text-[13px] font-extrabold leading-[18px] text-rfPrimaryDarker">
            Ausgewaehlter Tag
          </Text>
          <Text className="text-[21px] font-extrabold leading-7 text-rfTextPrimary">
            {shift.dayLabel} {shift.dateLabel}
          </Text>
        </View>
        <StatusBadge label={shift.statusLabel} tone={statusTone[shift.status]} />
      </View>

      <View className="flex-row gap-2.5">
        <SummaryPill iconName="warehouse" label={shift.depotLabel} />
        <SummaryPill iconName="routes" label={shift.routeLabel} />
      </View>

      <View className="flex-row rounded-rf2xl border border-rfBorderLight bg-rfSurface">
        <SummaryMetric label="Gearbeitet" value={shift.realTimeLabel} />
        <SummaryMetric label="Abrechenbar" showDivider value={shift.billableTimeLabel} />
        <SummaryMetric label="Strecke" value={shift.distanceLabel} />
      </View>

      <Pressable
        className="min-h-[54px] flex-row items-center justify-center gap-2.5 rounded-rfXl bg-rfPrimary px-4 py-3"
        onPress={onOpenDetails}>
        <RfIcon className="text-rfTextInverse" name="file-document-outline" size={22} />
        <Text className="text-[14px] font-extrabold leading-5 text-rfTextInverse">
          Tagesdetails oeffnen
        </Text>
      </Pressable>

      <Text className="text-center text-[12px] font-medium leading-4 text-rfTextSecondary">
        {helper}
      </Text>
    </View>
  );
}

function SummaryMetric({
  label,
  showDivider = false,
  value,
}: {
  label: string;
  showDivider?: boolean;
  value: string;
}) {
  return (
    <View className={`flex-1 gap-0.5 p-3 ${showDivider ? "border-x border-rfBorderLight" : ""}`}>
      <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">{value}</Text>
      <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">{label}</Text>
    </View>
  );
}

function SummaryPill({ iconName, label }: { iconName: "routes" | "warehouse"; label: string }) {
  return (
    <View className="min-h-10 flex-1 flex-row items-center gap-2 rounded-full bg-rfSurface px-3 py-2">
      <RfIcon className="text-rfPrimary" name={iconName} size={17} />
      <Text className="flex-1 text-[12px] font-extrabold leading-4 text-rfTextPrimary">
        {label}
      </Text>
    </View>
  );
}

