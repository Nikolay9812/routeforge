import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { useMobileAuth } from "@/features/auth/AuthProvider";

export default function PendingApprovalScreen() {
  const { profile, refreshProfile, signOut } = useMobileAuth();
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  async function handleRefreshProfile() {
    setChecking(true);
    setCheckMessage(null);

    const refreshed = await refreshProfile();

    if (!refreshed) {
      setCheckMessage("Status konnte nicht geprueft werden.");
    } else {
      setCheckMessage("Status aktualisiert.");
    }

    setChecking(false);
  }

  return (
    <MobileScreen scroll={false}>
      <StatusBar style="dark" />
      <View className="flex-1 justify-center gap-5">
        <RouteForgeCard className="gap-5">
          <View className="items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-rf2xl bg-rfPrimaryLightest">
              <RfIcon className="text-rfPrimary" name="account-clock-outline" size={34} />
            </View>
            <View className="items-center gap-2">
              <Text className="text-center text-[24px] font-extrabold leading-8 text-rfTextPrimary">
                Freigabe ausstehend
              </Text>
              <Text className="text-center text-[14px] font-semibold leading-5 text-rfTextSecondary">
                Dein Kurierprofil wurde angelegt und wartet auf die Freigabe
                durch dein Unternehmen.
              </Text>
            </View>
          </View>

          <View className="gap-3 rounded-rf2xl border border-rfPrimaryLight bg-rfPrimaryLightest p-4">
            <View className="flex-row items-center gap-2">
              <RfIcon className="text-rfPrimary" name="shield-check-outline" size={20} />
              <Text className="text-[14px] font-extrabold leading-5 text-rfTextPrimary">
                Was passiert als Naechstes?
              </Text>
            </View>
            <Text className="text-[13px] font-medium leading-[19px] text-rfTextSecondary">
              Sobald dein Profil aktiv ist, kannst du Schichten starten,
              Berichte senden und dein Postfach nutzen.
            </Text>
          </View>

          <View className="gap-2 rounded-rf2xl border border-rfBorder bg-rfSurfaceSecondary p-4">
            <Text className="text-xs font-extrabold uppercase leading-4 text-rfTextMuted">
              Angemeldet als
            </Text>
            <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
              {profile?.full_name ?? "Kurier"}
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              {profile?.email ?? "E-Mail noch nicht geladen"}
            </Text>
          </View>

          {checkMessage ? (
            <Text className="text-center text-[13px] font-bold leading-[18px] text-rfTextSecondary">
              {checkMessage}
            </Text>
          ) : null}

          <View className="gap-3">
            <Pressable
              accessibilityRole="button"
              className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-rfXl bg-rfPrimary px-5 py-3"
              disabled={checking}
              onPress={() => void handleRefreshProfile()}>
              <RfIcon className="text-rfTextInverse" name="refresh" size={21} />
              <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
                {checking ? "Prueft..." : "Status pruefen"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-rfXl border border-rfBorder bg-rfSurface px-5 py-3"
              onPress={() => void signOut()}>
              <RfIcon className="text-rfTextPrimary" name="logout" size={21} />
              <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
                Abmelden
              </Text>
            </Pressable>
          </View>
        </RouteForgeCard>
      </View>
    </MobileScreen>
  );
}
