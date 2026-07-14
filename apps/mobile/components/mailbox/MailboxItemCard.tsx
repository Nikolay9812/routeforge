import { Pressable, Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import type { MailboxItemViewModel } from "@/features/mailbox/mailboxTypes";

type MailboxItemCardProps = {
  isSelected?: boolean;
  item: MailboxItemViewModel;
  onPress: () => void;
};

type ToneClasses = {
  iconShell: string;
  icon: string;
};

const toneClasses: Record<MailboxItemViewModel["tone"], ToneClasses> = {
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

const kindClasses: Record<MailboxItemViewModel["fileKind"], { badge: string; text: string }> = {
  Nachricht: {
    badge: "bg-rfPrimaryLightest",
    text: "text-rfPrimaryDarker",
  },
  PDF: {
    badge: "bg-rfErrorLightest",
    text: "text-rfError",
  },
};

export function MailboxItemCard({ isSelected = false, item, onPress }: MailboxItemCardProps) {
  const isUnread = item.readAt === null;
  const shellClasses = isUnread
    ? "border-rfPrimaryLight bg-rfPrimaryLightest"
    : "border-rfBorder bg-rfSurface";
  const selectedClasses = isSelected ? "border-rfPrimary" : "";

  return (
    <Pressable
      className={`min-h-[116px] flex-row items-center gap-3 rounded-rf3xl border p-4 ${shellClasses} ${selectedClasses}`}
      onPress={onPress}>
      <View className="w-4 items-center">
        {isUnread ? <View className="h-2.5 w-2.5 rounded-full bg-rfPrimary" /> : null}
      </View>

      <View
        className={`h-14 w-14 items-center justify-center rounded-rfXl ${
          toneClasses[item.tone].iconShell
        }`}>
        <RfIcon className={toneClasses[item.tone].icon} name={item.iconName} size={27} />
      </View>

      <View className="min-w-0 flex-1 gap-1">
        <Text
          className="text-[16px] font-extrabold leading-[22px] text-rfTextPrimary"
          numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
          {item.subtitle}
        </Text>
        <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
          {isUnread ? "Ungelesen" : "Gelesen"} - {item.senderLabel}
        </Text>
      </View>

      <View className="items-end gap-2">
        <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
          {item.receivedLabel}
        </Text>
        <View className={`rounded-full px-2.5 py-1 ${kindClasses[item.fileKind].badge}`}>
          <Text className={`text-xs font-extrabold leading-4 ${kindClasses[item.fileKind].text}`}>
            {item.fileKind}
          </Text>
        </View>
        <RfIcon className="text-rfTextSecondary" name="chevron-right" size={21} />
      </View>
    </Pressable>
  );
}

