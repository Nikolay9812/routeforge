import { Text, View } from "react-native";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockMobileShellCompany, mockMobileShellUser } from "@/features/mock/mobileShell";

export default function ProfileScreen() {
  return (
    <MobileScreen>
      <MobileHeader />
      <RouteForgeCard>
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-rfPrimaryLight">
            <Text className="text-lg font-extrabold text-rfPrimaryDarker">
              {mockMobileShellUser.initials}
            </Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-xl font-extrabold leading-[26px] text-rfTextPrimary">
              {mockMobileShellUser.fullName}
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              {mockMobileShellUser.roleLabel} - {mockMobileShellCompany.name}
            </Text>
          </View>
          <StatusBadge label={mockMobileShellUser.statusLabel} tone="success" />
        </View>
      </RouteForgeCard>
      <RouteForgeCard compact>
        <ProfileRow icon="warehouse" label="Depot" value={mockMobileShellCompany.depotName} />
        <ProfileRow icon="cash-clock" label="Zahlungsart" value="Stundenbasis" />
        <ProfileRow icon="translate" label="Sprache" value="Deutsch" />
      </RouteForgeCard>
    </MobileScreen>
  );
}

function ProfileRow({ icon, label, value }: { icon: RfIconName; label: string; value: string }) {
  return (
    <View className="min-h-[52px] flex-row items-center gap-3 border-t border-rfBorderLight">
      <RfIcon className="text-rfPrimary" name={icon} size={22} />
      <View className="flex-1 gap-0.5">
        <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
          {label}
        </Text>
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">{value}</Text>
      </View>
    </View>
  );
}
