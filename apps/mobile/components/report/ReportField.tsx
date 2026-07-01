import { Text, TextInput, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";
import { rfColors } from "@/constants/routeforgeTheme";

type ReportFieldProps = {
  editable?: boolean;
  error?: string;
  helper?: string;
  iconName: RfIconName;
  keyboardType?: "default" | "number-pad";
  label: string;
  onChangeText?: (value: string) => void;
  required?: boolean;
  value: string;
};

export function ReportField({
  editable = false,
  error,
  helper,
  iconName,
  keyboardType = "default",
  label,
  onChangeText,
  required = false,
  value,
}: ReportFieldProps) {
  const hasError = Boolean(error);
  const containerClassName = hasError
    ? "border-rfErrorLight bg-rfErrorLightest"
    : "border-rfBorderLight bg-rfSurfaceSecondary";

  return (
    <View className={`min-h-[76px] flex-1 gap-2 rounded-rf2xl border p-3.5 ${containerClassName}`}>
      <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
          <RfIcon className="text-rfPrimary" name={iconName} size={19} />
        </View>
        <Text className="flex-1 text-xs font-extrabold leading-4 text-rfTextSecondary">
          {label}
          {required ? " *" : ""}
        </Text>
      </View>
      <View className="gap-0.5">
        {editable && onChangeText ? (
          <TextInput
            className="min-h-[40px] rounded-rfLg border border-rfBorder bg-rfSurface px-3 py-2 text-[16px] font-extrabold text-rfTextPrimary"
            editable={editable}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            placeholder={label}
            placeholderTextColor={rfColors.textMuted}
            value={value}
          />
        ) : (
          <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
            {value}
          </Text>
        )}
        {helper ? (
          <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
            {helper}
          </Text>
        ) : null}
        {error ? (
          <Text className="text-[11px] font-bold leading-[15px] text-rfErrorForeground">
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
