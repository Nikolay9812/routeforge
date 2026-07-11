import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import {
  mockMobileShellLanguages,
  mockMobileShellNotifications,
  type MobileShellLanguage,
} from "@/features/mock/mobileShell";
import { useMobileProfileHydration } from "@/features/profile/mobileProfileHydration";

type HeaderPanel = "depot" | "language" | "notifications" | null;

export function MobileHeader() {
  const { companyName, depots, fullName, initials, languageCode } =
    useMobileProfileHydration();
  const [activePanel, setActivePanel] = useState<HeaderPanel>(null);
  const [selectedDepotCode, setSelectedDepotCode] = useState<string | null>(null);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<
    MobileShellLanguage["code"] | null
  >(null);
  const selectedDepot =
    depots.find((depot) => depot.code === selectedDepotCode) ?? depots[0];
  const selectedLanguage =
    mockMobileShellLanguages.find(
      (language) => language.code === (selectedLanguageCode ?? languageCode),
    ) ?? mockMobileShellLanguages[0];

  const unreadNotifications = useMemo(
    () => mockMobileShellNotifications.filter((notification) => notification.unread).length,
    [],
  );

  function togglePanel(panel: Exclude<HeaderPanel, null>) {
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));
  }

  return (
    <View className="-mx-4 -mt-4 gap-[18px] bg-rfPrimaryDarker px-5 pb-5 pt-[18px]">
      <View className="flex-row items-center justify-between gap-3">
        <Pressable
          accessibilityRole="button"
          className="flex-1 flex-row items-center gap-3"
          onPress={() => router.push("/profile")}>
          <View className="h-11 w-11 items-center justify-center rounded-full bg-rfPrimaryLight">
            <Text className="text-[15px] font-extrabold text-rfPrimaryDarker">
              {initials}
            </Text>
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-[13px] font-semibold leading-[18px] text-rfPrimaryLight">
              Hallo,
            </Text>
            <Text className="text-xl font-extrabold leading-[26px] text-rfTextInverse">
              {fullName}
            </Text>
          </View>
        </Pressable>

        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            className="min-h-10 min-w-10 items-center justify-center rounded-full bg-rfPrimaryLight px-2.5"
            onPress={() => togglePanel("language")}>
            <Text className="text-[11px] font-extrabold text-rfPrimaryDarker">
              {selectedLanguage.code}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="relative h-10 w-10 items-center justify-center rounded-full bg-rfSurface"
            onPress={() => togglePanel("notifications")}>
            <RfIcon className="text-rfPrimaryDarker" name="bell-outline" size={19} />
            {unreadNotifications > 0 ? (
              <View className="absolute right-0.5 top-0.5 min-h-4 min-w-4 items-center justify-center rounded-full bg-rfError px-1">
                <Text className="text-[9px] font-extrabold leading-[11px] text-rfTextInverse">
                  {unreadNotifications}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <Pressable
          accessibilityRole="button"
          className="min-h-[58px] flex-1 justify-center gap-0.5 rounded-rfLg px-3"
          onPress={() => togglePanel("depot")}>
          <View className="flex-row items-center gap-2">
            <Text className="flex-1 text-lg font-extrabold leading-6 text-rfTextInverse">
              {companyName}
            </Text>
            <RfIcon
              className="text-rfPrimaryLight"
              name={activePanel === "depot" ? "chevron-up" : "chevron-down"}
              size={20}
            />
          </View>
          <Text className="text-[13px] font-semibold leading-[18px] text-rfPrimaryLight">
            {selectedDepot?.name}
          </Text>
        </Pressable>
      </View>

      {activePanel === "depot" ? (
        <View className="gap-2 rounded-rf2xl border border-rfPrimaryLight bg-rfSurface p-3">
          <Text className="text-xs font-extrabold uppercase leading-4 text-rfTextMuted">
            Depot auswaehlen
          </Text>
          {depots.map((depot) => (
            <Pressable
              className="min-h-12 flex-row items-center gap-3 rounded-rfLg bg-rfSurfaceSecondary px-3 py-2"
              key={depot.code}
              onPress={() => {
                setSelectedDepotCode(depot.code);
                setActivePanel(null);
              }}>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-rfPrimaryLightest">
                <Text className="text-[11px] font-extrabold text-rfPrimaryDarker">
                  {depot.code}
                </Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-[14px] font-extrabold leading-5 text-rfTextPrimary">
                  {depot.name}
                </Text>
                <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
                  {depot.addressLabel}
                </Text>
              </View>
              {selectedDepot?.code === depot.code ? (
                <RfIcon className="text-rfSuccessForeground" name="check-circle" size={20} />
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {activePanel === "language" ? (
        <View className="gap-2 rounded-rf2xl border border-rfPrimaryLight bg-rfSurface p-3">
          <Text className="text-xs font-extrabold uppercase leading-4 text-rfTextMuted">
            Sprache
          </Text>
          <View className="flex-row gap-2">
            {mockMobileShellLanguages.map((language) => (
              <Pressable
                className={`min-h-11 flex-1 items-center justify-center rounded-rfLg border px-3 ${
                  selectedLanguage.code === language.code
                    ? "border-rfPrimaryLight bg-rfPrimaryLightest"
                    : "border-rfBorder bg-rfSurfaceSecondary"
                }`}
                key={language.code}
                onPress={() => {
                  setSelectedLanguageCode(language.code);
                  setActivePanel(null);
                }}>
                <Text
                  className={`text-[14px] font-extrabold leading-5 ${
                    selectedLanguage.code === language.code
                      ? "text-rfPrimaryDarker"
                      : "text-rfTextSecondary"
                  }`}>
                  {language.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {activePanel === "notifications" ? (
        <View className="gap-2 rounded-rf2xl border border-rfPrimaryLight bg-rfSurface p-3">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xs font-extrabold uppercase leading-4 text-rfTextMuted">
              Benachrichtigungen
            </Text>
            <Text className="text-xs font-extrabold leading-4 text-rfPrimaryDarker">
              {unreadNotifications} neu
            </Text>
          </View>
          {mockMobileShellNotifications.map((notification) => (
            <View
              className="min-h-[58px] flex-row gap-3 rounded-rfLg bg-rfSurfaceSecondary px-3 py-2"
              key={notification.id}>
              <View
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  notification.unread ? "bg-rfPrimary" : "bg-rfBorderStrong"
                }`}
              />
              <View className="min-w-0 flex-1 gap-0.5">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 text-[14px] font-extrabold leading-5 text-rfTextPrimary">
                    {notification.title}
                  </Text>
                  <Text className="text-xs font-bold leading-4 text-rfTextMuted">
                    {notification.timeLabel}
                  </Text>
                </View>
                <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
                  {notification.message}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
