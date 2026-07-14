import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
import { useMobileAuth } from "@/features/auth/AuthProvider";
import { loadCourierMailboxItems } from "@/features/mailbox/mailboxBackend";
import type { ProfileDocumentViewModel } from "@/features/profile/profileTypes";
import {
  pickAndUploadCourierProfileDocument,
  updateCourierOwnProfile,
  type ProfileDocumentKind,
} from "@/features/profile/profileBackend";
import { useMobileProfileHydration } from "@/features/profile/mobileProfileHydration";

type ProfileEditMode = "address" | "iban" | "phone";

type ProfileEditDraft = {
  addressLine1: string;
  city: string;
  iban: string;
  phone: string;
  postalCode: string;
};

type ProfileFeedback = {
  message: string;
  tone: "error" | "success";
};

type LiveProfileDocument = ProfileDocumentViewModel & {
  documentKind: ProfileDocumentKind;
};

const profileDocumentDefinitions: {
  documentKind: ProfileDocumentKind;
  id: string;
  kindLabel: string;
  title: string;
}[] = [
  {
    documentKind: "id_card",
    id: "id-card",
    kindLabel: "Persoenliches Dokument",
    title: "Personalausweis",
  },
  {
    documentKind: "driver_license",
    id: "driver-license",
    kindLabel: "Fahrberechtigung",
    title: "Fuehrerschein Klasse B",
  },
  {
    documentKind: "registration",
    id: "address-registration",
    kindLabel: "Adressnachweis",
    title: "Adressnachweis",
  },
  {
    documentKind: "bank",
    id: "iban-proof",
    kindLabel: "Zahlungsnachweis",
    title: "IBAN-Nachweis",
  },
];

export default function ProfileScreen() {
  const hydratedProfile = useMobileProfileHydration();
  const { refreshProfile } = useMobileAuth();
  const [editMode, setEditMode] = useState<ProfileEditMode | null>(null);
  const [editDraft, setEditDraft] = useState<ProfileEditDraft>(() =>
    createProfileEditDraft(hydratedProfile.profile),
  );
  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);
  const [unreadMailboxCount, setUnreadMailboxCount] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingDocumentKind, setUploadingDocumentKind] =
    useState<ProfileDocumentKind | null>(null);
  const profileDocumentStates = useMemo(
    () => buildProfileDocumentStates(hydratedProfile.profile),
    [hydratedProfile.profile],
  );
  const validDocumentCount = profileDocumentStates.filter(
    (document) => document.status === "valid",
  ).length;
  const attentionDocumentCount = profileDocumentStates.filter(
    (document) => document.status === "missing" || document.status === "expired",
  ).length;

  useEffect(() => {
    let isActive = true;
    const profile = hydratedProfile.profile;

    async function loadUnreadMailboxCount() {
      if (!profile) {
        setUnreadMailboxCount(0);
        return;
      }

      const result = await loadCourierMailboxItems(profile.company_id, profile.id);

      if (!isActive) {
        return;
      }

      setUnreadMailboxCount(result.error ? 0 : result.items.filter((item) => !item.readAt).length);
    }

    void loadUnreadMailboxCount();

    return () => {
      isActive = false;
    };
  }, [hydratedProfile.profile]);

  function openProfileEditor(mode: ProfileEditMode) {
    setEditDraft(createProfileEditDraft(hydratedProfile.profile));
    setEditMode(mode);
    setFeedback(null);
  }

  async function handleSaveProfileEdit() {
    const profile = hydratedProfile.profile;

    if (!profile) {
      setFeedback({
        message: "Profil konnte nicht geladen werden.",
        tone: "error",
      });
      return;
    }

    setSavingProfile(true);
    setFeedback(null);

    try {
      await updateCourierOwnProfile({
        addressLine1: editDraft.addressLine1,
        city: editDraft.city,
        iban: editDraft.iban,
        phone: editDraft.phone,
        postalCode: editDraft.postalCode,
        preferredLanguage: profile.preferred_language,
      });
      await refreshProfile();
      await hydratedProfile.refresh();
      setEditMode(null);
      setFeedback({
        message: "Profildaten wurden gespeichert.",
        tone: "success",
      });
    } catch (error) {
      console.error("[mobile/profile/save]", error);
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Profildaten konnten nicht gespeichert werden.",
        tone: "error",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUploadDocument(documentKind: ProfileDocumentKind) {
    const profile = hydratedProfile.profile;

    if (!profile) {
      setFeedback({
        message: "Profil konnte nicht geladen werden.",
        tone: "error",
      });
      return;
    }

    setUploadingDocumentKind(documentKind);
    setFeedback(null);

    const result = await pickAndUploadCourierProfileDocument({
      documentKind,
      profile,
    });

    if (result.success) {
      await refreshProfile();
      await hydratedProfile.refresh();
      setFeedback({
        message: "Dokument wurde hochgeladen.",
        tone: "success",
      });
    } else if (!result.canceled) {
      setFeedback({
        message: result.error,
        tone: "error",
      });
    }

    setUploadingDocumentKind(null);
  }

  const personalRows: ProfileInfoRow[] = [
    {
      icon: "email-outline",
      label: "E-Mail",
      value: hydratedProfile.displayEmail,
    },
    {
      editLabel: "Telefon bearbeiten",
      icon: "phone-outline",
      label: "Telefon",
      onEdit: () => openProfileEditor("phone"),
      value: hydratedProfile.displayPhone,
    },
    {
      editLabel: "Adresse bearbeiten",
      icon: "map-marker-outline",
      label: "Adresse",
      onEdit: () => openProfileEditor("address"),
      value: hydratedProfile.displayAddress,
    },
    {
      editLabel: "IBAN bearbeiten",
      helperText: "Sensibler Wert wird nur maskiert angezeigt.",
      icon: "bank-outline",
      label: "IBAN",
      onEdit: () => openProfileEditor("iban"),
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
          badgeLabel={
            unreadMailboxCount > 0
              ? `${unreadMailboxCount} ungelesen`
              : "Keine neuen Eintraege"
          }
          helperText="Eigene digitale Post und Firmenmitteilungen."
          icon="email-outline"
          onPress={() => router.push("/mailbox")}
          title="Digitales Postfach"
        />
        <ProfileShortcutCard
          badgeLabel={`${validDocumentCount} / ${profileDocumentStates.length} vorhanden`}
          helperText="Private Dokumente werden authentifiziert geoeffnet."
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

      <ProfileSignatureCard onOpenReport={() => router.push("/report")} />

      <ProfileInfoSection rows={personalRows} title="Persoenliche Daten" />
      {feedback ? (
        <View
          className={`rounded-rf2xl border p-4 ${
            feedback.tone === "success"
              ? "border-rfSuccessLight bg-rfSuccessLightest"
              : "border-rfErrorLight bg-rfErrorLightest"
          }`}>
          <Text
            className={`text-[13px] font-extrabold leading-[18px] ${
              feedback.tone === "success"
                ? "text-rfSuccessForeground"
                : "text-rfErrorForeground"
            }`}>
            {feedback.message}
          </Text>
        </View>
      ) : null}
      {editMode ? (
        <RouteForgeCard compact className="gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
                {getEditTitle(editMode)}
              </Text>
              <Text className="text-xs font-semibold leading-4 text-rfTextSecondary">
                Diese Daten werden nur in deinem eigenen Kurierprofil gespeichert.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Bearbeitung schliessen"
              className="h-11 w-11 items-center justify-center rounded-full border border-rfBorder bg-rfSurface"
              onPress={() => setEditMode(null)}>
              <RfIcon className="text-rfTextSecondary" name="close" size={20} />
            </Pressable>
          </View>

          {editMode === "phone" ? (
            <TextInput
              className="min-h-12 rounded-rfLg border border-rfBorder bg-rfSurfaceSecondary px-4 py-3 text-[15px] font-bold text-rfTextPrimary"
              keyboardType="phone-pad"
              onChangeText={(value) =>
                setEditDraft((currentDraft) => ({
                  ...currentDraft,
                  phone: value,
                }))
              }
              value={editDraft.phone}
            />
          ) : null}

          {editMode === "address" ? (
            <View className="gap-3">
              <TextInput
                className="min-h-12 rounded-rfLg border border-rfBorder bg-rfSurfaceSecondary px-4 py-3 text-[15px] font-bold text-rfTextPrimary"
                onChangeText={(value) =>
                  setEditDraft((currentDraft) => ({
                    ...currentDraft,
                    addressLine1: value,
                  }))
                }
                placeholder="Strasse und Hausnummer"
                value={editDraft.addressLine1}
              />
              <View className="flex-row gap-3">
                <TextInput
                  className="min-h-12 flex-1 rounded-rfLg border border-rfBorder bg-rfSurfaceSecondary px-4 py-3 text-[15px] font-bold text-rfTextPrimary"
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    setEditDraft((currentDraft) => ({
                      ...currentDraft,
                      postalCode: value,
                    }))
                  }
                  placeholder="PLZ"
                  value={editDraft.postalCode}
                />
                <TextInput
                  className="min-h-12 flex-[2] rounded-rfLg border border-rfBorder bg-rfSurfaceSecondary px-4 py-3 text-[15px] font-bold text-rfTextPrimary"
                  onChangeText={(value) =>
                    setEditDraft((currentDraft) => ({
                      ...currentDraft,
                      city: value,
                    }))
                  }
                  placeholder="Ort"
                  value={editDraft.city}
                />
              </View>
            </View>
          ) : null}

          {editMode === "iban" ? (
            <View className="gap-2">
              <TextInput
                autoCapitalize="characters"
                className="min-h-12 rounded-rfLg border border-rfBorder bg-rfSurfaceSecondary px-4 py-3 text-[15px] font-bold text-rfTextPrimary"
                onChangeText={(value) =>
                  setEditDraft((currentDraft) => ({
                    ...currentDraft,
                    iban: value,
                  }))
                }
                value={editDraft.iban}
              />
              <Text className="text-xs font-medium leading-4 text-rfTextMuted">
                Die IBAN wird im Profil maskiert angezeigt.
              </Text>
            </View>
          ) : null}

          <View className="flex-row gap-3">
            <Pressable
              className="min-h-12 flex-1 items-center justify-center rounded-rfLg border border-rfBorder bg-rfSurface px-4"
              disabled={savingProfile}
              onPress={() => setEditMode(null)}>
              <Text className="text-[14px] font-extrabold leading-5 text-rfTextSecondary">
                Abbrechen
              </Text>
            </Pressable>
            <Pressable
              className={`min-h-12 flex-1 items-center justify-center rounded-rfLg bg-rfPrimary px-4 ${
                savingProfile ? "opacity-60" : ""
              }`}
              disabled={savingProfile}
              onPress={() => void handleSaveProfileEdit()}>
              <Text className="text-[14px] font-extrabold leading-5 text-rfTextInverse">
                {savingProfile ? "Speichert..." : "Speichern"}
              </Text>
            </Pressable>
          </View>
        </RouteForgeCard>
      ) : null}
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
              {profileDocumentStates.length}
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

          {profileDocumentStates.map((document) => (
            <ProfileDocumentStatusCard
              document={document}
              isUploading={uploadingDocumentKind === document.documentKind}
              key={document.id}
              onPress={() => void handleUploadDocument(document.documentKind)}
            />
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
            Dokumente werden in der privaten Ablage gespeichert und nur fuer dein eigenes
            Profil sowie berechtigte Admins sichtbar.
          </Text>
        </View>
      </RouteForgeCard>
    </MobileScreen>
  );
}

function buildProfileDocumentStates(profile: LiveProfileDocumentProfile | null): LiveProfileDocument[] {
  return profileDocumentDefinitions.map((definition) => {
    const hasDocument = Boolean(getProfileDocumentReference(profile, definition.documentKind));

    return {
      actionLabel: hasDocument ? "Ersetzen" : "Hochladen",
      dateLabel: hasDocument ? "Private Ablage vorhanden" : "Noch nicht hinterlegt",
      documentKind: definition.documentKind,
      helperText: hasDocument
        ? "Dokument ist im Backend hinterlegt."
        : "Bitte Foto des Dokuments hochladen.",
      id: definition.id,
      kindLabel: definition.kindLabel,
      status: hasDocument ? "valid" : "missing",
      statusLabel: hasDocument ? "Vorhanden" : "Fehlt",
      title: definition.title,
    };
  });
}

type LiveProfileDocumentProfile = NonNullable<ReturnType<typeof useMobileProfileHydration>["profile"]>;

function getProfileDocumentReference(
  profile: LiveProfileDocumentProfile | null,
  documentKind: ProfileDocumentKind,
): string | null {
  if (!profile) {
    return null;
  }

  const references: Record<ProfileDocumentKind, string | null> = {
    bank: profile.bank_document_url,
    driver_license: profile.driver_license_document_url,
    id_card: profile.id_card_document_url,
    registration: profile.registration_document_url,
  };

  return references[documentKind];
}

function createProfileEditDraft(
  profile: LiveProfileDocumentProfile | null,
): ProfileEditDraft {
  return {
    addressLine1: profile?.address_line_1 ?? "",
    city: profile?.city ?? "",
    iban: profile?.iban ?? "",
    phone: profile?.phone ?? "",
    postalCode: profile?.postal_code ?? "",
  };
}

function getEditTitle(editMode: ProfileEditMode): string {
  const labels: Record<ProfileEditMode, string> = {
    address: "Adresse bearbeiten",
    iban: "IBAN bearbeiten",
    phone: "Telefon bearbeiten",
  };

  return labels[editMode];
}

