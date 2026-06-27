import { Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import type { HistorySummaryMetricMock } from "@/features/mock/history";

type HistorySummaryTileProps = HistorySummaryMetricMock & {
  showDivider?: boolean;
};

export function HistorySummaryTile({
  helper,
  iconName,
  label,
  showDivider = false,
  value,
}: HistorySummaryTileProps) {
  return (
    <View
      className={`min-h-[92px] flex-1 justify-between p-3.5 ${
        showDivider ? "border-r border-rfBorderLight" : ""
      }`}>
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
          <RfIcon className="text-rfPrimary" name={iconName} size={18} />
        </View>
        <Text className="flex-1 text-[11px] font-extrabold leading-[15px] text-rfTextSecondary">
          {label}
        </Text>
      </View>
      <View className="gap-0.5">
        <Text className="text-[20px] font-extrabold leading-7 text-rfTextPrimary">
          {value}
        </Text>
        <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
          {helper}
        </Text>
      </View>
    </View>
  );
}
