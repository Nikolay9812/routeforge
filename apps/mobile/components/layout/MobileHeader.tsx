import { Image, Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import { mockMobileShellCompany, mockMobileShellUser } from "@/features/mock/mobileShell";

export function MobileHeader() {
  return (
    <View className="-mx-4 -mt-4 gap-[18px] bg-rfPrimaryDarker px-5 pb-5 pt-[18px]">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-rfLg bg-rfPrimaryLightest">
            <Image
              className="h-9 w-9"
              resizeMode="contain"
              source={require("@/assets/images/icon.png")}
            />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-xl font-extrabold leading-[26px] text-rfTextInverse">
              {mockMobileShellCompany.name}
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfPrimaryLight">
              Hallo, {mockMobileShellUser.fullName}
            </Text>
          </View>
        </View>

        <View className="h-12 w-12 items-center justify-center rounded-full bg-rfPrimaryLight">
          <Text className="text-[15px] font-extrabold text-rfPrimaryDarker">
            {mockMobileShellUser.initials}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-extrabold leading-6 text-rfTextInverse">
            {mockMobileShellCompany.depotCode}
          </Text>
          <Text className="text-[13px] font-semibold leading-[18px] text-rfPrimaryLight">
            {mockMobileShellCompany.depotName}
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          <View className="min-h-9 justify-center rounded-full bg-rfPrimaryLight px-3">
            <Text className="text-xs font-extrabold text-rfPrimaryDarker">
              {mockMobileShellUser.languageLabel}
            </Text>
          </View>
          <View className="relative h-[42px] w-[42px] items-center justify-center rounded-full bg-rfSurface">
            <RfIcon className="text-rfPrimaryDarker" name="bell-outline" size={20} />
            <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rfSuccess" />
          </View>
        </View>
      </View>
    </View>
  );
}
