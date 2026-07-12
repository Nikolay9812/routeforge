import { Pressable, Text, View } from "react-native";

import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";

type ProfileSignatureCardProps = {
  onOpenReport: () => void;
};

export function ProfileSignatureCard({ onOpenReport }: ProfileSignatureCardProps) {
  return (
    <RouteForgeCard>
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
          <RfIcon className="text-rfPrimary" name="pencil-outline" size={26} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
            Unterschrift
          </Text>
          <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
            Unterschrift wird pro Tagesbericht neu erfasst und privat gespeichert.
          </Text>
        </View>
      </View>

      <View className="min-h-[116px] justify-between rounded-rf2xl border border-rfBorder bg-rfSurfaceSecondary p-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
            Tagesbericht
          </Text>
          <View className="rounded-rfLg bg-rfPrimaryLightest px-3 py-1">
            <Text className="text-xs font-extrabold leading-4 text-rfPrimaryDarker">
              Erforderlich
            </Text>
          </View>
        </View>
        <View className="items-center gap-2">
          <RfIcon className="text-rfPrimary" name="draw-pen" size={34} />
          <Text className="text-center text-[13px] font-bold leading-[18px] text-rfTextPrimary">
            Nach dem Einreichen ist die Unterschrift im Admin-Review sichtbar.
          </Text>
        </View>
        <Text className="text-xs font-medium leading-4 text-rfTextMuted">
          Alte Unterschriften werden nicht automatisch wiederverwendet.
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Tagesbericht mit Unterschrift oeffnen"
        accessibilityRole="button"
        className="min-h-[50px] flex-row items-center justify-center gap-2 rounded-rfXl bg-rfPrimary px-5 py-3"
        onPress={onOpenReport}>
        <RfIcon className="text-rfTextInverse" name="send-outline" size={20} />
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
          Zum Tagesbericht
        </Text>
      </Pressable>
    </RouteForgeCard>
  );
}
