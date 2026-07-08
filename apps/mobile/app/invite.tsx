import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthTextField } from "@/components/auth/AuthTextField";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RfIcon } from "@/components/ui/RfIcon";
import { useMobileAuth } from "@/features/auth/AuthProvider";

export default function InviteScreen() {
  const { authError, clearAuthError, loading, registerWithInvite } = useMobileAuth();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("./login");
  };

  const handleInviteSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedInviteCode = inviteCode.trim().toUpperCase();
    const trimmedFullName = fullName.trim();

    clearAuthError();
    setFormError(null);
    setNeedsVerification(false);

    if (!trimmedFullName || !normalizedEmail || !normalizedInviteCode || !password) {
      setFormError("Bitte Name, E-Mail, Invite Code und Passwort eingeben.");
      return;
    }

    if (password.length < 6) {
      setFormError("Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }

    setSubmitting(true);
    const result = await registerWithInvite({
      email: normalizedEmail,
      fullName: trimmedFullName,
      inviteCode: normalizedInviteCode,
      password,
    });
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    if (result.needsEmailVerification) {
      setNeedsVerification(true);
      return;
    }

    setIsPendingApproval(true);
    router.replace("/pending-approval" as never);
  };

  const visibleError = formError ?? authError;
  const isDisabled = submitting || loading;

  return (
    <MobileScreen>
      <StatusBar style="dark" />
      <View className="min-h-[780px] justify-between py-3">
        <View className="gap-7">
          <Pressable
            accessibilityLabel="Zurueck zur Anmeldung"
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
              Gib deine Daten und den RF-Einladungscode deiner Firma ein, um dein
              Kurierkonto zu registrieren.
            </Text>
          </View>

          <View className="gap-4 rounded-rf2xl border border-rfBorder bg-rfSurface p-4 shadow-sm">
            <AuthTextField
              autoCapitalize="words"
              iconName="account-outline"
              label="Name"
              onChangeText={setFullName}
              placeholder="Vor- und Nachname"
              value={fullName}
            />
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
              placeholder="RF-Einladungscode eingeben"
              value={inviteCode}
            />
            <AuthTextField
              iconName="lock-outline"
              label="Passwort"
              onChangeText={setPassword}
              placeholder="Passwort erstellen"
              secureTextEntry
              textContentType="password"
              value={password}
            />

            {visibleError ? (
              <View className="gap-1 rounded-rf2xl border border-rfErrorLight bg-rfErrorLightest p-4">
                <Text className="text-[13px] font-extrabold leading-[18px] text-rfErrorForeground">
                  Registrierung nicht moeglich
                </Text>
                <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
                  {visibleError}
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              className={`min-h-[52px] items-center justify-center rounded-rfLg ${
                isDisabled ? "bg-rfBorderStrong" : "bg-rfPrimaryDarker"
              }`}
              disabled={isDisabled}
              onPress={handleInviteSubmit}>
              <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
                {submitting ? "Registrierung laeuft..." : "Weiter"}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3 rounded-rf2xl border border-rfPrimaryLight bg-rfPrimaryLightest p-4">
            <View className="h-8 w-8 items-center justify-center rounded-full">
              <RfIcon className="text-rfPrimary" name="information-outline" size={22} />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
                {needsVerification
                  ? "E-Mail bestaetigen"
                  : isPendingApproval
                    ? "Registrierung angefragt"
                    : "Was passiert als Naechstes?"}
              </Text>
              <Text className="text-[12px] font-medium leading-[17px] text-rfTextSecondary">
                {needsVerification
                  ? "Pruefe deine E-Mail und bestaetige den Link. Danach meldest du dich mit E-Mail und Passwort an; dein pending_approval Profil wird dann automatisch angelegt."
                  : isPendingApproval
                    ? "Dein Konto wurde als pending_approval gespeichert. Du erhaeltst eine E-Mail, sobald dein Zugang aktiviert ist."
                    : "Nach der Registrierung wird dein Konto von deinem Unternehmen ueberprueft. Du erhaeltst eine E-Mail, sobald dein Zugang aktiviert ist."}
              </Text>
              {!needsVerification && !isPendingApproval ? (
                <Text className="text-[12px] font-bold leading-[17px] text-rfPrimaryDarker">
                  Der E-Mail-Bestaetigungscode ist nicht der RF-Einladungscode.
                </Text>
              ) : null}
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
