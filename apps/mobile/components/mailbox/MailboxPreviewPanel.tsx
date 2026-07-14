import { Pressable, Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import type { MailboxItemViewModel } from "@/features/mailbox/mailboxTypes";

type MailboxPreviewPanelProps = {
  item: MailboxItemViewModel;
  onOpen?: () => void;
};

const previewToneClasses: Record<
  MailboxItemViewModel["tone"],
  {
    iconShell: string;
    icon: string;
  }
> = {
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

export function MailboxPreviewPanel({ item, onOpen }: MailboxPreviewPanelProps) {
  return (
    <View className="gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-5 shadow-sm">
      <View className="items-center">
        <View className="h-1.5 w-16 rounded-full bg-rfBorderStrong" />
      </View>

      <View className="flex-row gap-4">
        <View
          className={`h-[76px] w-[76px] items-center justify-center rounded-rfXl ${
            previewToneClasses[item.tone].iconShell
          }`}>
          <RfIcon className={previewToneClasses[item.tone].icon} name={item.iconName} size={34} />
        </View>

        <View className="min-w-0 flex-1 gap-1">
          <Text
            className="text-[17px] font-extrabold leading-[23px] text-rfTextPrimary"
            numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-[12px] font-semibold leading-4 text-rfTextSecondary">
            {item.subtitle} - {item.fileKind} - {item.receivedLabel}
          </Text>
          <Text className="text-[13px] font-medium leading-[19px] text-rfTextSecondary">
            {item.message}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <Pressable className="min-h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-rfXl border border-rfPrimary bg-rfSurface px-4 py-3">
          <RfIcon className="text-rfPrimary" name="download-outline" size={21} />
          <Text className="text-[14px] font-extrabold leading-5 text-rfPrimary">
            Download
          </Text>
        </Pressable>
        <Pressable
          className="min-h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-rfXl bg-rfPrimary px-4 py-3"
          onPress={onOpen}>
          <RfIcon className="text-rfTextInverse" name="open-in-new" size={21} />
          <Text className="text-[14px] font-extrabold leading-5 text-rfTextInverse">
            Oeffnen
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

