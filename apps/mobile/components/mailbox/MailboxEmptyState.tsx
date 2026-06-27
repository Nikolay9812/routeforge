import { Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";

type MailboxEmptyStateProps = {
  title: string;
};

export function MailboxEmptyState({ title }: MailboxEmptyStateProps) {
  return (
    <View className="items-center gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-6">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-rfPrimaryLightest">
        <RfIcon className="text-rfPrimary" name="email-open-outline" size={28} />
      </View>
      <View className="items-center gap-1">
        <Text className="text-center text-[16px] font-extrabold leading-6 text-rfTextPrimary">
          Keine Eintraege fuer {title}
        </Text>
        <Text className="text-center text-[13px] font-medium leading-[18px] text-rfTextSecondary">
          Neue Dokumente, Abrechnungen und Hinweise erscheinen automatisch hier.
        </Text>
      </View>
    </View>
  );
}
