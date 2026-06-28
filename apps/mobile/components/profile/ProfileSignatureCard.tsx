import { Text, View } from "react-native";

import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { mockCourierProfile } from "@/features/mock/profile";

export function ProfileSignatureCard() {
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
            {mockCourierProfile.signature.helperText}
          </Text>
        </View>
      </View>

      <View className="min-h-[116px] justify-between rounded-rf2xl border border-rfBorder bg-rfSurfaceSecondary p-4">
        <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
          Vorschau
        </Text>
        <Text className="self-center text-[32px] font-semibold italic leading-[42px] text-rfTextPrimary">
          {mockCourierProfile.signature.label}
        </Text>
        <Text className="text-xs font-medium leading-4 text-rfTextMuted">
          {mockCourierProfile.signature.updatedAtLabel}
        </Text>
      </View>

      <View className="min-h-[50px] flex-row items-center justify-center gap-2 rounded-rfXl bg-rfPrimary px-5 py-3">
        <RfIcon className="text-rfTextInverse" name="pencil-plus-outline" size={20} />
        <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
          Unterschrift aktualisieren
        </Text>
      </View>
    </RouteForgeCard>
  );
}
