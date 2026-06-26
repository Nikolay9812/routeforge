import { Text, View } from "react-native";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";

const reportSteps = ["Depot", "Fahrzeug", "Pakete", "Fotos", "Unterschrift"];

export default function ReportScreen() {
  return (
    <MobileScreen>
      <MobileHeader />
      <RouteForgeCard>
        <View className="flex-row items-center gap-3">
          <RfIcon className="text-rfPrimary" name="clipboard-text-outline" size={28} />
          <View className="flex-1 gap-0.5">
            <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
              Tagesbericht
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Entwurf fuer heute
            </Text>
          </View>
          <StatusBadge label="Offen" tone="warning" />
        </View>
      </RouteForgeCard>
      <RouteForgeCard compact>
        <Text className="text-base font-extrabold leading-[22px] text-rfTextPrimary">
          Berichtsbereiche
        </Text>
        {reportSteps.map((step) => (
          <View
            className="min-h-12 flex-row items-center gap-3 border-t border-rfBorderLight"
            key={step}>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-rfPrimaryLightest">
              <RfIcon className="text-rfPrimary" name="check" size={18} />
            </View>
            <Text className="text-[15px] font-bold leading-5 text-rfTextPrimary">{step}</Text>
          </View>
        ))}
      </RouteForgeCard>
    </MobileScreen>
  );
}
