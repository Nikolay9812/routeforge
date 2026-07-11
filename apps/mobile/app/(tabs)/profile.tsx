import { router } from "expo-router";
import { Text, View } from "react-native";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { ProfileDocumentStatusCard } from "@/components/profile/ProfileDocumentStatusCard";
import { ProfileInfoSection, type ProfileInfoRow } from "@/components/profile/ProfileInfoSection";
import { ProfilePaymentCard } from "@/components/profile/ProfilePaymentCard";
import { ProfileShortcutCard } from "@/components/profile/ProfileShortcutCard";
import { ProfileSignatureCard } from "@/components/profile/ProfileSignatureCard";
import { ProfileSummaryCard } from "@/components/profile/ProfileSummaryCard";
import { RfIcon } from "@/components/ui/RfIcon";
import { mockCourierProfile, profileDocuments } from "@/features/mock/profile";
import { useMobileProfileHydration } from "@/features/profile/mobileProfileHydration";

export default function ProfileScreen() {
  const hydratedProfile = useMobileProfileHydration();
  const validDocumentCount = profileDocuments.filter((document) => document.status === "valid")
    .length;
  const attentionDocumentCount = profileDocuments.filter(
    (document) => document.status === "missing" || document.status === "expired",
  ).length;
  const personalRows: ProfileInfoRow[] = [
    {
      icon: "email-outline",
      label: "E-Mail",
      value: hydratedProfile.displayEmail,
    },
    {
      icon: "phone-outline",
      label: "Telefon",
      value: hydratedProfile.displayPhone,
    },
    {
      icon: "map-marker-outline",
      label: "Adresse",
      value: hydratedProfile.displayAddress,
    },
    {
      helperText: "Sensibler Wert wird nur maskiert angezeigt.",
      icon: "bank-outline",
      label: "IBAN",
      value: hydratedProfile.maskedIban,
    },
  ];
  const workRows: ProfileInfoRow[] = [
    {
      icon: "translate",
      label: "Sprache",
      value: hydratedProfile.languageLabel,
    },
    {
      icon: "warehouse",
      label: "Depot",
      value: `${hydratedProfile.depotName} (${hydratedProfile.depotCode})`,
    },
    {
      icon: "account-check-outline",
      label: "Profilstatus",
      value: `${hydratedProfile.statusLabel} - ${hydratedProfile.accessLabel}`,
    },
  ];

  return (
    <MobileScreen>
      <MobileHeader />

      <View className="gap-1 pt-1">
        <Text className="text-[26px] font-extrabold leading-[33px] text-rfTextPrimary">
          Profil
        </Text>
        <Text className="text-[14px] font-semibold leading-5 text-rfTextSecondary">
          Eigene Daten, private Dokumente und Zahlungsmodus.
        </Text>
      </View>

      <ProfileSummaryCard
        summary={{
          accessLabel: hydratedProfile.accessLabel,
          companyName: hydratedProfile.companyName,
          fullName: hydratedProfile.fullName,
          initials: hydratedProfile.initials,
          roleLabel: hydratedProfile.roleLabel,
          statusLabel: hydratedProfile.statusLabel,
          statusTone: hydratedProfile.statusTone,
        }}
      />

      <View className="gap-3">
        <ProfileShortcutCard
          badgeLabel={mockCourierProfile.mailbox.unreadLabel}
          helperText={mockCourierProfile.mailbox.helperText}
          icon="email-outline"
          onPress={() => router.push("/mailbox")}
          title="Digitales Postfach"
        />
        <ProfileShortcutCard
          badgeLabel={mockCourierProfile.documents.summaryLabel}
          helperText={mockCourierProfile.documents.helperText}
          icon="file-document-outline"
          title="Dokumente"
        />
        <ProfileShortcutCard
          badgeLabel="Sprache und Hilfe"
          helperText="App-Sprache, Datenschutz und Support."
          icon="cog-outline"
          onPress={() => router.push("/settings")}
          title="Einstellungen"
        />
      </View>

      <ProfileSignatureCard />

      <ProfileInfoSection rows={personalRows} title="Persoenliche Daten" />
      <ProfileInfoSection rows={workRows} title="Profilinformationen" />
      <ProfilePaymentCard paymentMode={hydratedProfile.paymentMode} />

      <RouteForgeCard className="gap-4">
        <View className="flex-row items-start gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
            <RfIcon className="text-rfPrimary" name="file-document-multiple-outline" size={26} />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-[20px] font-extrabold leading-7 text-rfTextPrimary">
              Meine Dokumente
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              Pflichtdokumente fuer dein eigenes Kurierprofil.
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-rf2xl border border-rfBorder bg-rfSurfaceSecondary p-3">
            <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
              {profileDocuments.length}
            </Text>
            <Text className="text-xs font-bold leading-4 text-rfTextSecondary">Gesamt</Text>
          </View>
          <View className="flex-1 rounded-rf2xl border border-rfSuccessLight bg-rfSuccessLightest p-3">
            <Text className="text-[22px] font-extrabold leading-7 text-rfSuccessForeground">
              {validDocumentCount}
            </Text>
            <Text className="text-xs font-bold leading-4 text-rfSuccessForeground">
              Gueltig
            </Text>
          </View>
          <View className="flex-1 rounded-rf2xl border border-rfWarningLight bg-rfWarningLightest p-3">
            <Text className="text-[22px] font-extrabold leading-7 text-rfWarningForeground">
              {attentionDocumentCount}
            </Text>
            <Text className="text-xs font-bold leading-4 text-rfWarningForeground">
              Pruefen
            </Text>
          </View>
        </View>

        <View className="gap-3 border-t border-rfBorderLight pt-4">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
              Pflichtdokumente
            </Text>
            <View className="rounded-full bg-rfPrimaryLightest px-3 py-1">
              <Text className="text-xs font-extrabold leading-4 text-rfPrimaryDarker">
                eigene Dateien
              </Text>
            </View>
          </View>

          {profileDocuments.map((document) => (
            <ProfileDocumentStatusCard document={document} key={document.id} />
          ))}
        </View>

        <View className="gap-2 rounded-rf2xl border border-rfPrimaryLight bg-rfPrimaryLightest p-4">
          <View className="flex-row items-center gap-2">
            <RfIcon className="text-rfPrimary" name="lock-outline" size={18} />
            <Text className="flex-1 text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
              Private Dokumente
            </Text>
          </View>
          <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
            Uploads und Downloads sind hier nur visuelle Platzhalter. Echte Dateien laufen
            spaeter ueber private Speicherung und authentifizierten Zugriff.
          </Text>
        </View>
      </RouteForgeCard>
    </MobileScreen>
  );
}
