import { Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SignaturePlaceholderCardProps = {
  error?: string | null;
  helper: string;
  label: string;
  statusLabel: string;
};

export function SignaturePlaceholderCard({
  error,
  helper,
  label,
  statusLabel,
}: SignaturePlaceholderCardProps) {
  const hasError = Boolean(error);
  const containerClassName = hasError
    ? "border-rfErrorLight bg-rfErrorLightest"
    : "border-rfBorderMuted bg-rfSurfaceSecondary";

  return (
    <View className={`gap-3 rounded-rf2xl border border-dashed p-4 ${containerClassName}`}>
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
      {error ? (
        <View className="flex-row items-center gap-2 rounded-rfLg bg-rfSurface px-3 py-2">
          <RfIcon className="text-rfError" name="alert-circle-outline" size={18} />
          <Text className="flex-1 text-[12px] font-bold leading-4 text-rfErrorForeground">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
