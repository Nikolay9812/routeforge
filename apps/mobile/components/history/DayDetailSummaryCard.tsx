import { Text, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";
import type { HistoryDayDetailMock } from "@/features/mock/history";

type DayDetailSummaryCardProps = {
  detail: Pick<HistoryDayDetailMock, "kmSummary" | "packageCounters">;
};

export function DayDetailSummaryCard({ detail }: DayDetailSummaryCardProps) {
  return (
    <View className="gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
      <View className="flex-row items-center justify-between gap-3">
        <View className="gap-0.5">
          <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
            Kilometer & Pakete
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
            Tageswerte aus dem eingereichten Bericht
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
          <RfIcon className="text-rfPrimary" name="speedometer" size={22} />
        </View>
      </View>

      <View className="flex-row gap-2.5">
        <KmTile helper="Start" iconName="map-marker-outline" value={detail.kmSummary.startKmLabel} />
        <KmTile helper="Ende" iconName="map-marker-check-outline" value={detail.kmSummary.endKmLabel} />
        <KmTile helper="Gefahren" iconName="routes" value={detail.kmSummary.distanceLabel} />
      </View>

      <View className="flex-row flex-wrap gap-2.5">
        {detail.packageCounters.map((counter) => (
          <View
            className="min-h-[104px] flex-1 basis-[46%] gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3.5"
            key={counter.label}>
            <View className="h-10 w-10 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
              <RfIcon className="text-rfPrimary" name={counter.iconName} size={22} />
            </View>
            <View className="gap-0.5">
              <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
                {counter.value}
              </Text>
              <Text className="text-[12px] font-extrabold leading-4 text-rfTextSecondary">
                {counter.label}
              </Text>
              <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
                {counter.helper}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function KmTile({ helper, iconName, value }: { helper: string; iconName: RfIconName; value: string }) {
  return (
    <View className="min-h-[86px] flex-1 gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3">
      <RfIcon className="text-rfPrimary" name={iconName} size={20} />
      <View className="gap-0.5">
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">{value}</Text>
        <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">{helper}</Text>
      </View>
    </View>
  );
}
