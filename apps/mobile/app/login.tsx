import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { AuthTextField } from "@/components/auth/AuthTextField";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RfIcon } from "@/components/ui/RfIcon";
import { useMobileAuth } from "@/features/auth/AuthProvider";

export default function LoginScreen() {
  const { authError, clearAuthError, loading, signIn } = useMobileAuth();
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    clearAuthError();
    setFormError(null);

    if (!normalizedEmail || !password) {
      setFormError("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setSubmitting(true);
    await signIn(normalizedEmail, password);
    setSubmitting(false);
  };
  const visibleError = formError ?? authError;
  const isDisabled = submitting || loading;

  return (
    <MobileScreen>
      <StatusBar style="dark" />
      <View className="min-h-[720px] justify-between py-4">
        <View className="items-center gap-3 pt-5">
          <Image
            className="h-[90px] w-[90px]"
            resizeMode="contain"
            source={require("@/assets/images/icon.png")}
          />
          <Text className="text-[21px] font-extrabold leading-7 text-rfPrimaryDarker">
            ROUTEFORGE
          </Text>
        </View>

        <View className="gap-6">
          <View className="gap-5 rounded-rf3xl border border-rfBorder bg-rfSurface p-5 shadow-sm">
            <View className="items-center gap-1">
              <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
                Anmelden
              </Text>
              <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
                Melde dich bei deinem Konto an
              </Text>
            </View>

            <View className="gap-4">
              <AuthTextField
                iconName="email-outline"
                keyboardType="email-address"
                label="E-Mail"
                onChangeText={setEmail}
                placeholder="E-Mail Adresse"
                textContentType="emailAddress"
                value={email}
              />
              <AuthTextField
                iconName="lock-outline"
                label="Passwort"
                onChangeText={setPassword}
                placeholder="Passwort"
                secureTextEntry
                textContentType="password"
                value={password}
              />
            </View>

            {visibleError ? (
              <View className="gap-1 rounded-rf2xl border border-rfErrorLight bg-rfErrorLightest p-4">
                <Text className="text-[13px] font-extrabold leading-[18px] text-rfErrorForeground">
                  Anmeldung nicht moeglich
                </Text>
                <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
                  {visibleError}
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              className={`min-h-[52px] items-center justify-center rounded-rfXl ${
                isDisabled ? "bg-rfBorderStrong" : "bg-rfPrimary"
              }`}
              disabled={isDisabled}
              onPress={handleLogin}>
              <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
                {submitting ? "Anmeldung laeuft..." : "Anmelden"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="link"
              className="min-h-11 items-center justify-center"
              onPress={() => router.push("./invite")}>
              <Text className="text-[14px] font-bold leading-5 text-rfPrimary">
                Invite Code verwenden
              </Text>
            </Pressable>
          </View>

          <View className="items-center">
            <Pressable className="min-h-[44px] flex-row items-center gap-2 rounded-rfLg border border-rfBorder bg-rfSurface px-4">
              <RfIcon className="text-rfTextSecondary" name="web" size={18} />
              <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
                Deutsch
              </Text>
              <RfIcon className="text-rfTextSecondary" name="chevron-down" size={18} />
            </Pressable>
          </View>
        </View>

        <Text className="text-center text-xs font-medium leading-4 text-rfTextMuted">
          (c) 2025 RouteForge
        </Text>
      </View>
    </MobileScreen>
  );
}
