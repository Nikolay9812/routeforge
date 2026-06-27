import { Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import type { HistoryDayMetricMock } from "@/features/mock/history";

type DayDetailMetricGridProps = {
  metrics: HistoryDayMetricMock[];
};

const toneClasses: Record<NonNullable<HistoryDayMetricMock["tone"]>, string> = {
  default: "bg-rfSurfaceSecondary",
  success: "bg-rfSuccessLightest",
  warning: "bg-rfWarningLightest",
};

const iconToneClasses: Record<NonNullable<HistoryDayMetricMock["tone"]>, string> = {
  default: "text-rfPrimary",
  success: "text-rfSuccessForeground",
  warning: "text-rfWarningForeground",
};

export function DayDetailMetricGrid({ metrics }: DayDetailMetricGridProps) {
  return (
    <View className="overflow-hidden rounded-rf3xl border border-rfBorder bg-rfSurface">
      <View className="flex-row flex-wrap">
        {metrics.map((metric, index) => {
          const tone = metric.tone ?? "default";
          const hasRightBorder = index % 2 === 0;
          const hasBottomBorder = index < metrics.length - 2;

          return (
            <View
              className={`min-h-[132px] w-1/2 gap-2.5 p-4 ${
                hasRightBorder ? "border-r border-rfBorderLight" : ""
              } ${hasBottomBorder ? "border-b border-rfBorderLight" : ""}`}
              key={`${metric.label}-${metric.value}`}>
              <View
                className={`h-10 w-10 items-center justify-center rounded-rfLg ${toneClasses[tone]}`}>
                <RfIcon className={iconToneClasses[tone]} name={metric.iconName} size={22} />
              </View>
              <View className="gap-0.5">
                <Text className="text-[12px] font-extrabold leading-4 text-rfTextSecondary">
                  {metric.label}
                </Text>
                <Text className="text-[22px] font-extrabold leading-7 text-rfPrimary">
                  {metric.value}
                </Text>
                <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
                  {metric.helper}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
