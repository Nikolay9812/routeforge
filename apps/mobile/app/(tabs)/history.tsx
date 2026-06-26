import { Text, View } from "react-native";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function HistoryScreen() {
  return (
    <MobileScreen>
      <MobileHeader />
      <RouteForgeCard>
        <View className="flex-row items-center gap-3">
          <RfIcon className="text-rfPrimary" name="calendar-month-outline" size={28} />
          <View className="flex-1 gap-0.5">
            <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
              Historie
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Juni 2026
            </Text>
          </View>
          <StatusBadge label="Mock" tone="info" />
        </View>
        <View className="flex-row gap-2.5">
          <Metric label="Schichten" value="18" />
          <Metric label="Arbeitszeit" value="146h" />
          <Metric label="Abrechnung" value="150h" />
        </View>
      </RouteForgeCard>
      <RouteForgeCard compact>
        <Text className="text-base font-extrabold leading-[22px] text-rfTextPrimary">
          Letzte Tage
        </Text>
        <HistoryRow date="24.06." status="Genehmigt" time="8h 20min" />
        <HistoryRow date="25.06." status="Eingereicht" time="7h 45min" />
        <HistoryRow date="26.06." status="Entwurf" time="Offen" />
      </RouteForgeCard>
    </MobileScreen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1 rounded-rfXl bg-rfSurfaceSecondary p-3">
      <Text className="text-lg font-extrabold leading-6 text-rfTextPrimary">{value}</Text>
      <Text className="text-xs font-semibold leading-4 text-rfTextSecondary">{label}</Text>
    </View>
  );
}

function HistoryRow({ date, status, time }: { date: string; status: string; time: string }) {
  return (
    <View className="min-h-11 flex-row items-center gap-2.5 border-t border-rfBorderLight">
      <Text className="w-14 text-sm font-extrabold text-rfTextPrimary">{date}</Text>
      <Text className="flex-1 text-sm font-semibold text-rfTextSecondary">{status}</Text>
      <Text className="text-sm font-bold text-rfTextPrimary">{time}</Text>
    </View>
  );
}
