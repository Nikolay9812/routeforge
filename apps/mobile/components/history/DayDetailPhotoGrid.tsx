import { Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import type { HistoryDayPhotoMock } from "@/features/mock/history";

type DayDetailPhotoGridProps = {
  photos: HistoryDayPhotoMock[];
};

export function DayDetailPhotoGrid({ photos }: DayDetailPhotoGridProps) {
  const availableCount = photos.filter((photo) => photo.state === "available").length;

  return (
    <View className="gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="gap-0.5">
          <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
            Nachweisfotos
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
            {availableCount} von {photos.length} Fotos sichtbar
          </Text>
        </View>
        <Text className="text-[13px] font-extrabold leading-[18px] text-rfPrimary">
          Anzeigen
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2.5">
        {photos.map((photo) => {
          const isExpired = photo.state === "expired";
          const isMissing = photo.state === "missing";

          return (
            <View
              className={`min-h-[126px] flex-1 basis-[46%] justify-between rounded-rf2xl border p-3.5 ${
                isExpired
                  ? "border-rfBorderLight bg-rfNeutralLight"
                  : isMissing
                    ? "border-rfWarningLight bg-rfWarningLightest"
                  : "border-rfPrimaryLight bg-rfPrimaryLightest"
              }`}
              key={photo.label}>
              <View className="flex-row items-start justify-between gap-2">
                <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfSurface">
                  <RfIcon
                    className={
                      isExpired
                        ? "text-rfTextMuted"
                        : isMissing
                          ? "text-rfWarningForeground"
                          : "text-rfPrimary"
                    }
                    name={photo.iconName}
                    size={23}
                  />
                </View>
                <View
                  className={`h-7 w-7 items-center justify-center rounded-full ${
                    isExpired
                      ? "bg-rfSurface"
                      : isMissing
                        ? "bg-rfSurface"
                        : "bg-rfSuccessLightest"
                  }`}>
                  <RfIcon
                    className={
                      isExpired
                        ? "text-rfTextMuted"
                        : isMissing
                          ? "text-rfWarningForeground"
                          : "text-rfSuccessForeground"
                    }
                    name={isExpired ? "clock-outline" : isMissing ? "alert-outline" : "check"}
                    size={16}
                  />
                </View>
              </View>
              <View className="gap-1">
                <Text className="text-[14px] font-extrabold leading-5 text-rfTextPrimary">
                  {photo.label}
                </Text>
                <Text className="text-[11px] font-semibold leading-[15px] text-rfTextSecondary">
                  {isExpired ? "Datei nach 14 Tagen gelöscht" : photo.helper}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
