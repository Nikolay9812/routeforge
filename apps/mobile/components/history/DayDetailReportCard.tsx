import { Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { HistoryDayReportRowViewModel } from "@/features/history/historyTypes";

type DayDetailReportCardProps = {
  note: string;
  rows: HistoryDayReportRowViewModel[];
};

export function DayDetailReportCard({ note, rows }: DayDetailReportCardProps) {
  return (
    <View className="gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
      <View className="gap-0.5">
        <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
          Berichte & Notizen
        </Text>
        <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">{note}</Text>
      </View>

      <View className="overflow-hidden rounded-rf2xl border border-rfBorderLight">
        {rows.map((row, index) => (
          <View
            className={`min-h-[76px] flex-row items-center gap-3 bg-rfSurface px-3 py-3 ${
              index > 0 ? "border-t border-rfBorderLight" : ""
            }`}
            key={row.label}>
            <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
              <RfIcon className="text-rfPrimary" name={row.iconName} size={23} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-[14px] font-extrabold leading-5 text-rfTextPrimary">
                {row.label}
              </Text>
              <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
                {row.helper}
              </Text>
            </View>
            <View className="items-end gap-1">
              {row.statusLabel ? <StatusBadge label={row.statusLabel} tone="success" /> : null}
              <Text className="text-[12px] font-semibold leading-4 text-rfTextSecondary">
                {row.value}
              </Text>
            </View>
            <RfIcon className="text-rfTextSecondary" name="chevron-right" size={20} />
          </View>
        ))}
      </View>
    </View>
  );
}

