import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { HistoryCalendar } from "@/components/history/HistoryCalendar";
import { HistoryShiftRow } from "@/components/history/HistoryShiftRow";
import { HistorySummaryTile } from "@/components/history/HistorySummaryTile";
import { SelectedDaySummary } from "@/components/history/SelectedDaySummary";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { mockHistoryMonth } from "@/features/mock/history";

export default function HistoryScreen() {
  const [selectedShiftId, setSelectedShiftId] = useState(mockHistoryMonth.recentShifts[0].id);
  const selectedShift = useMemo(
    () =>
      mockHistoryMonth.shiftDetails.find((shift) => shift.id === selectedShiftId) ??
      mockHistoryMonth.recentShifts[0],
    [selectedShiftId],
  );

  return (
    <MobileScreen>
      <MobileHeader />

      <View className="gap-3">
        <View className="flex-row items-end justify-between gap-3">
          <View className="gap-1">
            <Text className="text-[30px] font-extrabold leading-9 text-rfTextPrimary">
              Historie
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Monatsuebersicht deiner Schichten
            </Text>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full border border-rfBorder bg-rfSurface">
            <RfIcon className="text-rfTextSecondary" name="tune-variant" size={22} />
          </Pressable>
        </View>

        <HistoryCalendar
          days={mockHistoryMonth.calendarDays}
          monthLabel={mockHistoryMonth.monthLabel}
          onSelectDay={setSelectedShiftId}
          selectedShiftId={selectedShiftId}
        />
      </View>

      <View className="flex-row gap-2.5">
        <FilterChip iconName="calendar-month-outline" label={mockHistoryMonth.monthLabel} selected />
        {mockHistoryMonth.filters.map((filter) => (
          <FilterChip iconName={filter.startsWith("Status") ? "filter-outline" : "warehouse"} key={filter} label={filter} />
        ))}
      </View>

      <View className="overflow-hidden rounded-rf3xl border border-rfBorder bg-rfSurface">
        <View className="flex-row">
          {mockHistoryMonth.summary.map((metric, index) => (
            <HistorySummaryTile
              helper={metric.helper}
              iconName={metric.iconName}
              key={metric.label}
              label={metric.label}
              showDivider={index < mockHistoryMonth.summary.length - 1}
              value={metric.value}
            />
          ))}
        </View>
      </View>

      <SelectedDaySummary helper={mockHistoryMonth.selectedDayHelper} shift={selectedShift} />

      <View className="min-h-[56px] flex-row items-center justify-center gap-2.5 rounded-rfXl border border-rfPrimaryLight bg-rfSurface px-4 py-3">
        <RfIcon className="text-rfPrimary" name="download-outline" size={22} />
        <Text className="text-[14px] font-extrabold leading-5 text-rfPrimaryDarker">
          {mockHistoryMonth.monthlyPdfLabel} herunterladen
        </Text>
      </View>

      <RouteForgeCard className="overflow-hidden p-0">
        <View className="flex-row items-center justify-between gap-3 px-4 pt-4">
          <View className="gap-0.5">
            <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
              Letzte Schichten
            </Text>
            <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
              Mock-Daten fuer {mockHistoryMonth.monthLabel}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-[13px] font-extrabold leading-[18px] text-rfPrimary">
              Alle anzeigen
            </Text>
            <RfIcon className="text-rfPrimary" name="chevron-right" size={18} />
          </View>
        </View>

        <View>
          {mockHistoryMonth.recentShifts.map((shift) => (
            <HistoryShiftRow
              isSelected={shift.id === selectedShiftId}
              key={shift.id}
              onPress={() => setSelectedShiftId(shift.id)}
              shift={shift}
            />
          ))}
        </View>
      </RouteForgeCard>
    </MobileScreen>
  );
}

function FilterChip({
  iconName,
  label,
  selected = false,
}: {
  iconName: "calendar-month-outline" | "filter-outline" | "warehouse";
  label: string;
  selected?: boolean;
}) {
  return (
    <Pressable
      className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-rfXl border px-3 py-2 ${
        selected ? "border-rfPrimary bg-rfPrimaryLightest" : "border-rfBorder bg-rfSurface"
      }`}>
      <RfIcon
        className={selected ? "text-rfPrimary" : "text-rfTextSecondary"}
        name={iconName}
        size={19}
      />
      <Text
        className={`text-center text-[12px] font-extrabold leading-4 ${
          selected ? "text-rfPrimaryDarker" : "text-rfTextPrimary"
        }`}>
        {label}
      </Text>
      <RfIcon
        className={selected ? "text-rfPrimary" : "text-rfTextSecondary"}
        name="chevron-down"
        size={17}
      />
    </Pressable>
  );
}
