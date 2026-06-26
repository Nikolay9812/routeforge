import { Text, View } from "react-native";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function MailboxScreen() {
  return (
    <MobileScreen>
      <MobileHeader />
      <RouteForgeCard>
        <View className="flex-row items-center gap-3">
          <RfIcon className="text-rfPrimary" name="email-outline" size={28} />
          <View className="flex-1 gap-0.5">
            <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
              Postfach
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Dokumente und Hinweise
            </Text>
          </View>
          <StatusBadge label="1 neu" tone="info" />
        </View>
      </RouteForgeCard>
      <RouteForgeCard compact highlighted>
        <View className="min-h-[52px] flex-row items-center gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-base font-extrabold leading-[22px] text-rfTextPrimary">
              Lohnabrechnung Juni
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Abrechnung - heute
            </Text>
          </View>
          <RfIcon className="text-rfPrimary" name="chevron-right" size={24} />
        </View>
      </RouteForgeCard>
      <RouteForgeCard compact>
        <View className="min-h-[52px] flex-row items-center gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-base font-extrabold leading-[22px] text-rfTextPrimary">
              Depot-Hinweis HBW3
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Hinweis - gelesen
            </Text>
          </View>
          <RfIcon className="text-rfTextMuted" name="chevron-right" size={24} />
        </View>
      </RouteForgeCard>
    </MobileScreen>
  );
}
