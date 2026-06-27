import { Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";

type DayDetailWarningCardProps = {
  helper: string;
  isWarning: boolean;
  title: string;
};

export function DayDetailWarningCard({ helper, isWarning, title }: DayDetailWarningCardProps) {
  return (
    <View
      className={`min-h-[88px] flex-row items-center gap-3 rounded-rf2xl border p-4 ${
        isWarning
          ? "border-rfWarning bg-rfWarningLightest"
          : "border-rfSuccessLight bg-rfSuccessLightest"
      }`}>
      <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfSurface">
        <RfIcon
          className={isWarning ? "text-rfWarning" : "text-rfSuccessForeground"}
          name={isWarning ? "alert-outline" : "check-circle-outline"}
          size={28}
        />
      </View>
      <View className="flex-1 gap-1">
        <Text
          className={`text-[14px] font-extrabold leading-5 ${
            isWarning ? "text-rfWarningForeground" : "text-rfSuccessForeground"
          }`}>
          {title}
        </Text>
        <Text className="text-[12px] font-semibold leading-4 text-rfTextSecondary">
          {helper}
        </Text>
      </View>
      <RfIcon className="text-rfTextSecondary" name="chevron-right" size={22} />
    </View>
  );
}
