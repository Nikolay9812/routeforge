import { Text, View } from "react-native";

import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import type { HydratedPaymentModeDisplay } from "@/features/profile/mobileProfileHydration";

type ProfilePaymentCardProps = {
  paymentMode: HydratedPaymentModeDisplay;
};

export function ProfilePaymentCard({ paymentMode }: ProfilePaymentCardProps) {
  return (
    <RouteForgeCard highlighted>
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfSurface">
          <RfIcon className="text-rfPrimary" name="cash-clock" size={24} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
            Zahlungsmodus
          </Text>
          <Text className="text-[14px] font-semibold leading-5 text-rfTextSecondary">
            {paymentMode.label}
          </Text>
        </View>
        <View className="rounded-full bg-rfSurface px-3 py-1">
          <Text className="text-xs font-extrabold leading-4 text-rfPrimaryDarker">
            {paymentMode.capLabel}
          </Text>
        </View>
      </View>

      <View className="gap-2 rounded-rf2xl border border-rfPrimaryLight bg-rfSurface p-4">
        <View className="flex-row items-center gap-2">
          <RfIcon className="text-rfPrimary" name="timer-outline" size={19} />
          <Text className="flex-1 text-[14px] font-bold leading-5 text-rfTextPrimary">
            {paymentMode.detail}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <RfIcon className="text-rfSuccessForeground" name="shield-check-outline" size={19} />
          <Text className="flex-1 text-[13px] font-medium leading-[18px] text-rfTextSecondary">
            {paymentMode.breakLabel}
          </Text>
        </View>
      </View>
    </RouteForgeCard>
  );
}
