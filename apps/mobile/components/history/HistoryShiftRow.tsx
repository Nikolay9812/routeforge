import { Pressable, Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { HistoryShiftMock, HistoryShiftStatus } from "@/features/mock/history";

type HistoryShiftRowProps = {
  isSelected?: boolean;
  onPress?: () => void;
  shift: HistoryShiftMock;
};

const statusTone: Record<HistoryShiftStatus, "success" | "info" | "warning"> = {
  approved: "success",
  draft: "warning",
  rejected: "warning",
  submitted: "info",
};

export function HistoryShiftRow({ isSelected = false, onPress, shift }: HistoryShiftRowProps) {
  return (
    <Pressable
      className={`min-h-[92px] flex-row items-center gap-3 border-t border-rfBorderLight px-4 py-3 ${
        isSelected ? "bg-rfPrimaryLightest" : "bg-rfSurface"
      }`}
      onPress={onPress}>
      <View className="w-[62px] gap-1">
        <Text className="text-[12px] font-extrabold leading-4 text-rfTextSecondary">
          {shift.dayLabel}
        </Text>
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
          {shift.dateLabel}
        </Text>
      </View>

      <View className="h-12 w-px bg-rfBorderLight" />

      <View className="flex-1 gap-1">
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
          {shift.depotLabel}
        </Text>
        <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
          {shift.routeLabel} · {shift.packageLabel}
        </Text>
        <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
          {shift.realTimeLabel} gearbeitet · {shift.billableTimeLabel} abrechenbar
        </Text>
      </View>

      <View className="items-end gap-2">
        <StatusBadge label={shift.statusLabel} tone={statusTone[shift.status]} />
        <RfIcon className="text-rfTextSecondary" name="chevron-right" size={20} />
      </View>
    </Pressable>
  );
}
