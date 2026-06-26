import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthTextField } from "@/components/auth/AuthTextField";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RfIcon } from "@/components/ui/RfIcon";

export default function InviteScreen() {
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("./login");
  };

  const handleMockInviteSubmit = () => {
    setIsPendingApproval(true);
  };

  return (
    <MobileScreen>
      <StatusBar style="dark" />
      <View className="min-h-[720px] justify-between py-3">
        <View className="gap-7">
          <Pressable
            accessibilityLabel="Zurück zur Anmeldung"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full"
            onPress={handleBack}>
            <RfIcon className="text-rfTextPrimary" name="arrow-left" size={24} />
          </Pressable>

          <View className="items-center gap-2 px-4">
            <Text className="text-center text-[22px] font-extrabold leading-7 text-rfTextPrimary">
              Invite Code verwenden
            </Text>
            <Text className="max-w-[280px] text-center text-[14px] font-medium leading-5 text-rfTextSecondary">
              Gib deine E-Mail-Adresse und den Invite Code ein, um dich zu registrieren.
            </Text>
          </View>

          <View className="gap-4 rounded-rf2xl border border-rfBorder bg-rfSurface p-4 shadow-sm">
            <AuthTextField
              iconName="email-outline"
              keyboardType="email-address"
              label="E-Mail Adresse"
              onChangeText={setEmail}
              placeholder="E-Mail Adresse"
              textContentType="emailAddress"
              value={email}
            />
            <AuthTextField
              autoCapitalize="characters"
              iconName="ticket-confirmation-outline"
              label="Invite Code"
              onChangeText={setInviteCode}
              placeholder="Invite Code eingeben"
              value={inviteCode}
            />

            <Pressable
              accessibilityRole="button"
              className="min-h-[52px] items-center justify-center rounded-rfLg bg-rfPrimaryDarker"
              onPress={handleMockInviteSubmit}>
              <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
                {isPendingApproval ? "Anfrage gesendet" : "Weiter"}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3 rounded-rf2xl border border-rfPrimaryLight bg-rfPrimaryLightest p-4">
            <View className="h-8 w-8 items-center justify-center rounded-full">
              <RfIcon className="text-rfPrimary" name="information-outline" size={22} />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
                {isPendingApproval ? "Registrierung angefragt" : "Was passiert als Nächstes?"}
              </Text>
              <Text className="text-[12px] font-medium leading-[17px] text-rfTextSecondary">
                {isPendingApproval
                  ? "Dein Konto wurde lokal als pending_approval markiert. Du erhältst eine E-Mail, sobald dein Zugang aktiviert ist."
                  : "Nach der Registrierung wird dein Konto von deinem Unternehmen überprüft. Du erhältst eine E-Mail, sobald dein Zugang aktiviert ist."}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-center gap-6 pt-7">
          <Pressable className="min-h-[44px] flex-row items-center gap-2 rounded-rfLg border border-rfBorder bg-rfSurface px-4">
            <RfIcon className="text-rfTextSecondary" name="web" size={18} />
            <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
              Deutsch
            </Text>
            <RfIcon className="text-rfTextSecondary" name="chevron-down" size={18} />
          </Pressable>

          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-center text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              Hast du bereits ein Konto?
            </Text>
            <Pressable
              accessibilityRole="link"
              className="min-h-11 justify-center"
              onPress={() => router.replace("./login")}>
              <Text className="text-[13px] font-extrabold leading-[18px] text-rfPrimary">
                Anmelden
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </MobileScreen>
  );
}
