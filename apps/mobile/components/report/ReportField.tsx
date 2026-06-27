import { Text, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";

type ReportFieldProps = {
  helper?: string;
  iconName: RfIconName;
  label: string;
  required?: boolean;
  value: string;
};

export function ReportField({
  helper,
  iconName,
  label,
  required = false,
  value,
}: ReportFieldProps) {
  return (
    <View className="min-h-[76px] flex-1 gap-2 rounded-rf2xl border border-rfBorderLight bg-rfSurfaceSecondary p-3.5">
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
        <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
          {value}
        </Text>
        {helper ? (
          <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
            {helper}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
