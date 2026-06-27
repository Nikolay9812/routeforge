import { Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SignaturePlaceholderCardProps = {
  helper: string;
  label: string;
  statusLabel: string;
};

export function SignaturePlaceholderCard({
  helper,
  label,
  statusLabel,
}: SignaturePlaceholderCardProps) {
  return (
    <View className="gap-3 rounded-rf2xl border border-dashed border-rfBorderMuted bg-rfSurfaceSecondary p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
          <RfIcon className="text-rfPrimary" name="draw-pen" size={25} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
            {label}
          </Text>
          <Text className="text-[12px] font-medium leading-4 text-rfTextSecondary">
            {helper}
          </Text>
        </View>
        <StatusBadge label={statusLabel} tone="warning" />
      </View>
    </View>
  );
}
