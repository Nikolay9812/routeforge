import { Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import type { HistoryDayDetailMock } from "@/features/mock/history";

type DayDetailSignatureCardProps = {
  signature: HistoryDayDetailMock["signature"];
};

export function DayDetailSignatureCard({ signature }: DayDetailSignatureCardProps) {
  return (
    <View className="gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfSuccessLightest">
          <RfIcon className="text-rfSuccessForeground" name="draw-pen" size={25} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
            Unterschrift
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
            {signature.helper}
          </Text>
        </View>
      </View>

      <View className="rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-4">
        <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
          {signature.signedByLabel}
        </Text>
        <Text className="mt-1 text-[12px] font-semibold leading-4 text-rfTextSecondary">
          Signiert am {signature.signedAtLabel}
        </Text>
        {signature.storageLabel ? (
          <Text className="mt-2 text-[11px] font-semibold leading-[15px] text-rfSuccessForeground">
            {signature.storageLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
