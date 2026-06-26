import { Pressable, Text, View } from "react-native";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockMobileShellCompany } from "@/features/mock/mobileShell";

export default function HomeScreen() {
  return (
    <MobileScreen>
      <MobileHeader />

      <RouteForgeCard>
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-rfXl bg-rfPrimaryLightest">
            <RfIcon className="text-rfPrimary" name="calendar-clock" size={26} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-lg font-extrabold leading-6 text-rfTextPrimary">
              Aktuelle Schicht
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSubtle">
              Heute am Depot {mockMobileShellCompany.depotCode}
            </Text>
          </View>
          <StatusBadge label="Noch offen" tone="warning" />
        </View>

        <View className="h-px bg-rfBorder" />

        <View className="flex-row flex-wrap gap-3">
          <View className="w-[47%] gap-1">
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Depot
            </Text>
            <Text className="text-base font-extrabold leading-[22px] text-rfTextPrimary">
              {mockMobileShellCompany.depotName}
            </Text>
          </View>
          <View className="w-[47%] gap-1">
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Zeitfenster
            </Text>
            <Text className="text-base font-extrabold leading-[22px] text-rfTextPrimary">
              07:00 - 16:00
            </Text>
          </View>
          <View className="w-[47%] gap-1">
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Zahlungsart
            </Text>
            <Text className="text-base font-extrabold leading-[22px] text-rfTextPrimary">
              Stundenbasis
            </Text>
          </View>
          <View className="w-[47%] gap-1">
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              Bericht
            </Text>
            <Text className="text-base font-extrabold leading-[22px] text-rfTextPrimary">
              Nicht begonnen
            </Text>
          </View>
        </View>

        <Pressable className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-rfXl bg-rfPrimary">
          <RfIcon className="text-rfTextInverse" name="play" size={20} />
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
            Schicht starten
          </Text>
        </Pressable>
      </RouteForgeCard>

      <View className="flex-row gap-2.5">
        <RouteForgeCard className="min-h-32 flex-1" compact>
          <RfIcon className="text-rfPrimary" name="clipboard-text-outline" size={24} />
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
            Tagesbericht
          </Text>
          <Text className="text-xs font-medium leading-4 text-rfTextSecondary">Tourdaten</Text>
        </RouteForgeCard>
        <RouteForgeCard className="min-h-32 flex-1" compact>
          <RfIcon className="text-rfPrimary" name="email-outline" size={24} />
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">Postfach</Text>
          <Text className="text-xs font-medium leading-4 text-rfTextSecondary">1 ungelesen</Text>
        </RouteForgeCard>
        <RouteForgeCard className="min-h-32 flex-1" compact>
          <RfIcon className="text-rfPrimary" name="account-circle-outline" size={24} />
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">Profil</Text>
          <Text className="text-xs font-medium leading-4 text-rfTextSecondary">Daten</Text>
        </RouteForgeCard>
      </View>

      <RouteForgeCard highlighted compact>
        <View className="flex-row items-center gap-3">
          <RfIcon className="text-rfPrimary" name="shield-check-outline" size={24} />
          <View className="flex-1 gap-0.5">
            <Text className="text-[15px] font-extrabold leading-5 text-rfPrimaryDarker">
              Sicherheit geht vor
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              Pausenzeiten und Standortfreigabe pruefen.
            </Text>
          </View>
        </View>
      </RouteForgeCard>
    </MobileScreen>
  );
}
