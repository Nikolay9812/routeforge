import { Text, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";
import type { ProfileDocumentMock, ProfileDocumentStatus } from "@/features/mock/profile";

const statusClasses: Record<
  ProfileDocumentStatus,
  { actionIcon: RfIconName; badge: string; iconBg: string; iconColor: string; text: string }
> = {
  expired: {
    actionIcon: "refresh",
    badge: "bg-rfErrorLightest",
    iconBg: "bg-rfErrorLightest",
    iconColor: "text-rfError",
    text: "text-rfErrorForeground",
  },
  missing: {
    actionIcon: "upload",
    badge: "bg-rfWarningLightest",
    iconBg: "bg-rfWarningLightest",
    iconColor: "text-rfWarning",
    text: "text-rfWarningForeground",
  },
  uploaded: {
    actionIcon: "clock-outline",
    badge: "bg-rfPrimaryLightest",
    iconBg: "bg-rfPrimaryLightest",
    iconColor: "text-rfPrimary",
    text: "text-rfPrimaryDarker",
  },
  valid: {
    actionIcon: "file-replace-outline",
    badge: "bg-rfSuccessLightest",
    iconBg: "bg-rfSuccessLightest",
    iconColor: "text-rfSuccessForeground",
    text: "text-rfSuccessForeground",
  },
};

const documentIcons: Record<string, RfIconName> = {
  "address-registration": "home-account",
  "driver-license": "card-account-details-outline",
  "iban-proof": "bank-outline",
  "id-card": "card-account-details-star-outline",
};

type ProfileDocumentStatusCardProps = {
  document: ProfileDocumentMock;
};

export function ProfileDocumentStatusCard({ document }: ProfileDocumentStatusCardProps) {
  const status = statusClasses[document.status];

  return (
    <View className="gap-3 rounded-rf2xl border border-rfBorder bg-rfSurface p-4">
      <View className="flex-row items-center gap-3">
        <View className={`h-12 w-12 items-center justify-center rounded-rfLg ${status.iconBg}`}>
          <RfIcon
            className={status.iconColor}
            name={documentIcons[document.id] ?? "file-document-outline"}
            size={25}
          />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
            {document.title}
          </Text>
          <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
            {document.kindLabel}
          </Text>
        </View>
        <View className={`rounded-full px-2.5 py-1 ${status.badge}`}>
          <Text className={`text-xs font-extrabold leading-4 ${status.text}`}>
            {document.statusLabel}
          </Text>
        </View>
      </View>

      <View className="gap-1 rounded-rfLg bg-rfSurfaceSecondary p-3">
        <Text className="text-[13px] font-bold leading-[18px] text-rfTextPrimary">
          {document.dateLabel}
        </Text>
        <Text className="text-xs font-medium leading-4 text-rfTextSecondary">
          {document.helperText}
        </Text>
      </View>

      <View className="min-h-11 flex-row items-center justify-center gap-2 rounded-rfLg border border-rfBorder bg-rfSurface px-4">
        <RfIcon className="text-rfPrimary" name={status.actionIcon} size={19} />
        <Text className="text-[14px] font-extrabold leading-5 text-rfPrimary">
          {document.actionLabel}
        </Text>
      </View>
    </View>
  );
}
