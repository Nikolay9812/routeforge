import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { MobileScreen } from "@/components/layout/MobileScreen";
import { RfIcon } from "@/components/ui/RfIcon";
import {
  mockMobileSettings,
  settingsLanguageOptions,
  type SettingsLanguageId,
} from "@/features/mock/settings";

export default function SettingsScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<SettingsLanguageId>("de");

  return (
    <MobileScreen>
      <View className="-mx-4 -mt-4 gap-5 bg-rfPrimary px-4 pb-5 pt-4">
        <View className="min-h-[56px] flex-row items-center justify-between">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full"
            onPress={() => router.back()}>
            <RfIcon className="text-rfTextInverse" name="chevron-left" size={34} />
          </Pressable>
          <Text className="text-[23px] font-extrabold leading-8 text-rfTextInverse">
            Einstellungen
          </Text>
          <View className="h-11 w-11 items-center justify-center rounded-full">
            <RfIcon className="text-rfTextInverse" name="cog-outline" size={25} />
          </View>
        </View>

        <Text className="px-1 text-[13px] font-semibold leading-[18px] text-rfPrimaryLight">
          Sprache, Datenschutz und Hilfe fuer dein eigenes Kurierprofil.
        </Text>
      </View>

      <View className="gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
        <View className="flex-row items-start gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
            <RfIcon className="text-rfPrimary" name="translate" size={25} />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-[20px] font-extrabold leading-7 text-rfTextPrimary">
              Sprache
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              Waehle die bevorzugte Sprache fuer die mobile App.
            </Text>
          </View>
        </View>

        <View className="gap-3">
          {settingsLanguageOptions.map((language) => {
            const isSelected = selectedLanguage === language.id;

            return (
              <Pressable
                className={`min-h-[70px] flex-row items-center gap-3 rounded-rf2xl border p-4 ${
                  isSelected
                    ? "border-rfPrimaryLight bg-rfPrimaryLightest"
                    : "border-rfBorder bg-rfSurfaceSecondary"
                }`}
                key={language.id}
                onPress={() => setSelectedLanguage(language.id)}>
                <View
                  className={`h-10 w-10 items-center justify-center rounded-full ${
                    isSelected ? "bg-rfPrimary" : "bg-rfSurface"
                  }`}>
                  <Text
                    className={`text-xs font-extrabold ${
                      isSelected ? "text-rfTextInverse" : "text-rfPrimaryDarker"
                    }`}>
                    {language.code}
                  </Text>
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
                    {language.label}
                  </Text>
                  <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
                    {language.helperText}
                  </Text>
                </View>
                {isSelected ? (
                  <RfIcon className="text-rfSuccessForeground" name="check-circle" size={22} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfSurfaceSecondary">
            <RfIcon className="text-rfTextSubtle" name="cellphone-cog" size={25} />
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
              App-Version
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              RouteForge Mobile {mockMobileSettings.appVersion}
            </Text>
          </View>
          <View className="rounded-full bg-rfNeutralLight px-3 py-1">
            <Text className="text-xs font-extrabold leading-4 text-rfNeutralForeground">
              {mockMobileSettings.buildLabel}
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-3 rounded-rf3xl border border-rfPrimaryLight bg-rfPrimaryLightest p-5">
        <View className="flex-row items-center gap-2">
          <RfIcon className="text-rfPrimary" name="shield-lock-outline" size={22} />
          <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
            {mockMobileSettings.privacyTitle}
          </Text>
        </View>
        <Text className="text-[13px] font-medium leading-[19px] text-rfTextSecondary">
          {mockMobileSettings.privacyText}
        </Text>
      </View>

      <View className="gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
        <View className="flex-row items-center gap-2">
          <RfIcon className="text-rfPrimary" name="lifebuoy" size={22} />
          <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
            Hilfe und Kontakt
          </Text>
        </View>

        {mockMobileSettings.supportItems.map((item, index) => (
          <View
            className={`min-h-[54px] flex-row items-center gap-3 py-2 ${
              index > 0 ? "border-t border-rfBorderLight" : ""
            }`}
            key={item.label}>
            <View className="h-10 w-10 items-center justify-center rounded-rfLg bg-rfSurfaceSecondary">
              <RfIcon className="text-rfTextSubtle" name={item.icon} size={21} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
                {item.label}
              </Text>
              <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="gap-3 rounded-rf3xl border border-rfErrorLight bg-rfErrorLightest p-5">
        <View className="flex-row items-start gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfSurface">
            <RfIcon className="text-rfError" name="logout" size={24} />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
              Abmelden
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              {mockMobileSettings.logoutHelper}
            </Text>
          </View>
        </View>

        <Pressable className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-rfXl bg-rfError px-5 py-3">
          <RfIcon className="text-rfTextInverse" name="logout" size={21} />
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
            Abmelden
          </Text>
        </Pressable>
      </View>
    </MobileScreen>
  );
}
