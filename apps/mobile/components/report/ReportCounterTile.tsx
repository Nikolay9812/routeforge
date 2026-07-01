import { Text, TextInput, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";
import { rfColors } from "@/constants/routeforgeTheme";

type ReportCounterTileProps = {
  editable?: boolean;
  error?: string;
  helper?: string;
  iconName: RfIconName;
  label: string;
  onChangeText?: (value: string) => void;
  showDivider?: boolean;
  value: string;
};

export function ReportCounterTile({
  editable = false,
  error,
  helper,
  iconName,
  label,
  onChangeText,
  showDivider = true,
  value,
}: ReportCounterTileProps) {
  const hasError = Boolean(error);

  return (
    <View
      className={`min-h-[132px] flex-1 items-center justify-center gap-2.5 px-2 ${
        showDivider ? "border-r border-rfBorderLight" : ""
      }`}>
      <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
        <RfIcon className="text-rfPrimary" name={iconName} size={23} />
      </View>
      <View className="items-center gap-0.5">
        <Text className="text-xs font-bold leading-4 text-rfTextSecondary">{label}</Text>
        {editable && onChangeText ? (
          <TextInput
            className={`min-h-[42px] w-full rounded-rfLg border bg-rfSurface px-2 text-center text-[22px] font-extrabold text-rfTextPrimary ${
              hasError ? "border-rfErrorLight" : "border-rfBorder"
            }`}
            keyboardType="number-pad"
            onChangeText={onChangeText}
            placeholder="0"
            placeholderTextColor={rfColors.textMuted}
            value={value}
          />
        ) : (
          <Text className="text-[24px] font-extrabold leading-8 text-rfTextPrimary">
            {value}
          </Text>
        )}
        {helper ? (
          <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
            {helper}
          </Text>
        ) : null}
        {error ? (
          <Text className="text-center text-[10px] font-bold leading-[14px] text-rfErrorForeground">
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
