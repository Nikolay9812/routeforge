import { Text, View } from "react-native";

import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockCourierProfile } from "@/features/mock/profile";

export function ProfileSummaryCard() {
  return (
    <RouteForgeCard className="gap-5">
      <View className="flex-row items-center gap-4">
        <View className="relative h-[88px] w-[88px] items-center justify-center rounded-full bg-rfPrimaryLightest">
          <Text className="text-[28px] font-extrabold leading-9 text-rfPrimaryDarker">
            {mockCourierProfile.initials}
          </Text>
          <View className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-rfSurface bg-rfSuccess" />
        </View>

        <View className="min-w-0 flex-1 gap-2">
          <Text className="text-[25px] font-extrabold leading-[32px] text-rfTextPrimary">
            {mockCourierProfile.fullName}
          </Text>
          <View className="gap-1.5">
            <View className="flex-row items-center gap-2">
              <RfIcon className="text-rfTextSubtle" name="office-building-outline" size={18} />
              <Text className="flex-1 text-[15px] font-bold leading-5 text-rfPrimary">
                {mockCourierProfile.companyName}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <RfIcon className="text-rfTextSubtle" name="account-outline" size={18} />
              <Text className="text-[14px] font-semibold leading-5 text-rfTextSecondary">
                {mockCourierProfile.roleLabel}
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2">
            <StatusBadge label={mockCourierProfile.statusLabel} tone="success" />
            <StatusBadge label={mockCourierProfile.accessLabel} tone="success" />
          </View>
        </View>
      </View>
    </RouteForgeCard>
  );
}
