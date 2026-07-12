import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { MobileScreen } from "@/components/layout/MobileScreen";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMobileAuth } from "@/features/auth/AuthProvider";
import {
  downloadMailboxDocument,
  loadMailboxItemById,
  markMailboxItemRead,
} from "@/features/mailbox/mailboxBackend";
import type { MailboxItemMock } from "@/features/mock/mailbox";

type ToneClasses = {
  iconShell: string;
  icon: string;
};

const toneClasses: Record<MailboxItemMock["tone"], ToneClasses> = {
  error: {
    iconShell: "bg-rfErrorLightest",
    icon: "text-rfError",
  },
  neutral: {
    iconShell: "bg-rfNeutralLight",
    icon: "text-rfNeutralForeground",
  },
  primary: {
    iconShell: "bg-rfPrimaryLightest",
    icon: "text-rfPrimary",
  },
  success: {
    iconShell: "bg-rfSuccessLightest",
    icon: "text-rfSuccessForeground",
  },
  warning: {
    iconShell: "bg-rfWarningLightest",
    icon: "text-rfWarningForeground",
  },
};

const categoryTone: Record<MailboxItemMock["category"], "info" | "neutral" | "success" | "warning"> =
  {
    contract: "info",
    document: "success",
    notice: "warning",
    payslip: "neutral",
  };

export default function MailboxItemDetailScreen() {
  const { profile } = useMobileAuth();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [serverItem, setServerItem] = useState<MailboxItemMock | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const item = serverItem;
  const isUnread = item?.readAt === null;
  const readStateLabel = isUnread ? "Ungelesen" : "Gelesen";
  const readStateHelper = isUnread
    ? "Dieser Eintrag wird beim Oeffnen als gelesen markiert."
    : item
      ? `Bereits gelesen am ${item.receivedLabel}.`
      : "Postfach-Eintrag konnte nicht geladen werden.";
  const downloadLabel = item?.fileKind === "PDF" ? "PDF herunterladen" : "Nachricht oeffnen";

  useEffect(() => {
    let isMounted = true;

    async function loadItem(): Promise<void> {
      if (!profile || !itemId) {
        return;
      }

      const result = await loadMailboxItemById(
        profile.company_id,
        profile.id,
        itemId,
      );

      if (!isMounted) {
        return;
      }

      if (result.error || !result.item) {
        setDetailError(result.error ?? "Postfach-Eintrag wurde nicht gefunden.");
        setServerItem(null);
        return;
      }

      setDetailError(null);
      setServerItem(result.item);

      if (result.item.readAt === null) {
        const readResult = await markMailboxItemRead(result.item.id);

        if (isMounted && readResult.item) {
          setServerItem(readResult.item);
        }
      }
    }

    void loadItem();

    return () => {
      isMounted = false;
    };
  }, [itemId, profile]);

  async function handleDownload(): Promise<void> {
    if (!item) {
      setDownloadStatus("Postfach-Eintrag wurde nicht geladen.");
      return;
    }

    if (!item.documentId) {
      setDownloadStatus("Diese Nachricht hat keinen Datei-Anhang.");
      return;
    }

    setDownloadStatus("Download wird vorbereitet...");
    const result = await downloadMailboxDocument(item.documentId);

    if (result.error || !result.blob) {
      setDownloadStatus(result.error ?? "Download fehlgeschlagen.");
      return;
    }

    setDownloadStatus(
      `${result.title ?? item.attachmentLabel} wurde authentifiziert geladen (${Math.max(
        1,
        Math.round(result.blob.size / 1024),
      )} KB).`,
    );
  }

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
            Postfach Details
          </Text>
          <View className="h-11 w-11 items-center justify-center rounded-full">
            <RfIcon className="text-rfTextInverse" name="lock-outline" size={26} />
          </View>
        </View>

        <Text className="px-1 text-[13px] font-semibold leading-[18px] text-rfPrimaryLight">
          Nur fuer Ihr eigenes Kurierprofil sichtbar.
        </Text>
      </View>

      <View
        className={`gap-4 rounded-rf3xl border p-5 ${
          isUnread ? "border-rfPrimaryLight bg-rfPrimaryLightest" : "border-rfBorder bg-rfSurface"
        }`}>
        <View className="flex-row items-start gap-4">
          <View
            className={`h-[78px] w-[78px] items-center justify-center rounded-rf2xl ${
              toneClasses[item?.tone ?? "neutral"].iconShell
            }`}>
            <RfIcon
              className={toneClasses[item?.tone ?? "neutral"].icon}
              name={item?.iconName ?? "email-outline"}
              size={36}
            />
          </View>

          <View className="min-w-0 flex-1 gap-2">
            <View className="flex-row flex-wrap items-center gap-2">
              <StatusBadge
                label={item?.categoryLabel ?? "Postfach"}
                tone={item ? categoryTone[item.category] : "neutral"}
              />
              <StatusBadge label={readStateLabel} tone={isUnread ? "info" : "neutral"} />
            </View>
            <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
              {item?.title ?? "Eintrag nicht gefunden"}
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              {item
                ? `Empfangen am ${item.receivedLabel} - ${item.senderLabel}`
                : "Der Eintrag ist nicht verfuegbar oder nicht fuer dein Profil freigegeben."}
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
        <View className="flex-row items-center gap-2">
          <RfIcon className="text-rfPrimary" name="email-open-outline" size={22} />
          <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
            Nachricht
          </Text>
        </View>

        {(item?.detailBody ?? ["Dieser Postfach-Eintrag konnte nicht geladen werden."]).map((paragraph) => (
          <Text
            className="text-[14px] font-medium leading-[21px] text-rfTextSecondary"
            key={paragraph}>
            {paragraph}
          </Text>
        ))}
      </View>

      {detailError ? (
        <View className="rounded-rf2xl border border-rfWarningLight bg-rfWarningLightest px-4 py-3">
          <Text className="text-[13px] font-semibold leading-[18px] text-rfWarningForeground">
            {detailError}
          </Text>
        </View>
      ) : null}

      <View className="gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
        <View className="flex-row items-start gap-3">
          <View
            className={`h-14 w-14 items-center justify-center rounded-rfXl ${
              toneClasses[item?.tone ?? "neutral"].iconShell
            }`}>
            <RfIcon
              className={toneClasses[item?.tone ?? "neutral"].icon}
              name={item?.iconName ?? "email-outline"}
              size={28}
            />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-[17px] font-extrabold leading-[23px] text-rfTextPrimary">
              {item?.attachmentLabel ?? "Kein Anhang"}
            </Text>
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              {item?.attachmentHelper ?? "Kein Server-Eintrag geladen"}
            </Text>
            <Text className="text-[12px] font-medium leading-4 text-rfTextMuted">
              {item?.fileKind ?? "Nachricht"}
              {item?.fileSizeLabel ? ` - ${item.fileSizeLabel}` : ""} - private Ablage
            </Text>
          </View>
        </View>

        <Pressable
          className="min-h-[56px] flex-row items-center justify-center gap-2.5 rounded-rfXl bg-rfPrimary px-5 py-3"
          disabled={!item}
          onPress={() => void handleDownload()}>
          <RfIcon className="text-rfTextInverse" name="download-outline" size={23} />
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextInverse">
            {downloadLabel}
          </Text>
        </Pressable>

        <Text className="text-[12px] font-medium leading-4 text-rfTextMuted">
          Zugriff erfolgt ueber private RouteForge Storage-Berechtigungen.
        </Text>
        {downloadStatus ? (
          <Text className="text-[12px] font-semibold leading-4 text-rfPrimary">
            {downloadStatus}
          </Text>
        ) : null}
      </View>

      <View
        className={`gap-2 rounded-rf3xl border p-4 ${
          isUnread
            ? "border-rfPrimaryLight bg-rfPrimaryLightest"
            : "border-rfBorder bg-rfSurface"
        }`}>
        <View className="flex-row items-center gap-2">
          <RfIcon
            className={isUnread ? "text-rfPrimary" : "text-rfNeutralForeground"}
            name={isUnread ? "circle-small" : "check-circle-outline"}
            size={24}
          />
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
            Lesestatus
          </Text>
        </View>
        <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
          {readStateHelper}
        </Text>
      </View>
    </MobileScreen>
  );
}
