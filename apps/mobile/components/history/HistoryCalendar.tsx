import { Pressable, Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import type { HistoryCalendarDayViewModel } from "@/features/history/historyTypes";

type HistoryCalendarProps = {
  days: HistoryCalendarDayViewModel[];
  monthLabel: string;
  onSelectDay: (shiftId: string) => void;
  selectedShiftId: string;
};

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getDayClasses(day: HistoryCalendarDayViewModel, selectedShiftId: string) {
  if (day.shiftId === selectedShiftId) {
    return {
      container: "bg-rfPrimary",
      marker: "bg-rfTextInverse",
      text: "text-rfTextInverse",
    };
  }

  return {
    container: "bg-transparent",
    marker: day.shiftId ? "bg-rfSuccess" : day.isToday ? "border border-rfPrimary" : "bg-rfBorderMuted",
    text: day.isCurrentMonth ? "text-rfTextPrimary" : "text-rfTextMuted",
  };
}

export function HistoryCalendar({
  days,
  monthLabel,
  onSelectDay,
  selectedShiftId,
}: HistoryCalendarProps) {
  return (
    <View className="overflow-hidden rounded-rf3xl border border-rfBorder bg-rfSurface">
      <View className="min-h-[70px] flex-row items-center justify-between border-b border-rfBorderLight px-4">
        <Pressable
          accessibilityLabel="Vorheriger Monat"
          className="h-11 w-11 items-center justify-center rounded-full bg-rfSurfaceSecondary">
          <RfIcon className="text-rfTextSecondary" name="chevron-left" size={25} />
        </Pressable>

        <View className="flex-row items-center gap-2">
          <Text className="text-[19px] font-extrabold leading-7 text-rfTextPrimary">
            {monthLabel}
          </Text>
          <RfIcon className="text-rfTextSecondary" name="chevron-down" size={22} />
        </View>

        <Pressable
          accessibilityLabel="Naechster Monat"
          className="h-11 w-11 items-center justify-center rounded-full bg-rfSurfaceSecondary">
          <RfIcon className="text-rfTextSecondary" name="chevron-right" size={25} />
        </Pressable>
      </View>

      <View className="gap-2 px-3 pb-4 pt-3">
        <View className="flex-row">
          {weekdays.map((weekday) => (
            <Text
              className="flex-1 text-center text-[12px] font-extrabold leading-4 text-rfTextSecondary"
              key={weekday}>
              {weekday}
            </Text>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {days.map((day) => {
            const dayClasses = getDayClasses(day, selectedShiftId);
            const isSelectable = Boolean(day.shiftId);

            return (
              <View className="basis-[14.285714%] p-1" key={day.dateLabel}>
                <Pressable
                  accessibilityLabel={`${day.dayNumber}. Tag`}
                  className={`h-[52px] items-center justify-center rounded-rfLg ${dayClasses.container}`}
                  disabled={!isSelectable}
                  onPress={() => {
                    if (day.shiftId) {
                      onSelectDay(day.shiftId);
                    }
                  }}>
                  <Text className={`text-[15px] font-extrabold leading-5 ${dayClasses.text}`}>
                    {day.dayNumber}
                  </Text>
                  <View
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${
                      isSelectable || day.isToday ? dayClasses.marker : "bg-transparent"
                    }`}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>

        <View className="flex-row flex-wrap gap-x-4 gap-y-2 border-t border-rfBorderLight pt-3">
          <LegendDot className="bg-rfSuccess" label="Abgeschlossen" />
          <LegendDot className="border border-rfPrimary bg-rfSurface" label="Heute" />
          <LegendDot className="bg-rfBorderMuted" label="Keine Schicht" />
        </View>
      </View>
    </View>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className={`h-2.5 w-2.5 rounded-full ${className}`} />
      <Text className="text-[12px] font-semibold leading-4 text-rfTextSecondary">{label}</Text>
    </View>
  );
}

