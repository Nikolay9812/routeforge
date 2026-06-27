import { Text, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";

type ReportCounterTileProps = {
  helper?: string;
  iconName: RfIconName;
  label: string;
  showDivider?: boolean;
  value: string;
};

export function ReportCounterTile({
  helper,
  iconName,
  label,
  showDivider = true,
  value,
}: ReportCounterTileProps) {
  return (
    <View
      className={`min-h-[122px] flex-1 items-center justify-center gap-2.5 px-2 ${
        showDivider ? "border-r border-rfBorderLight" : ""
      }`}>
      <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
        <RfIcon className="text-rfPrimary" name={iconName} size={23} />
      </View>
      <View className="items-center gap-0.5">
        <Text className="text-xs font-bold leading-4 text-rfTextSecondary">{label}</Text>
        <Text className="text-[24px] font-extrabold leading-8 text-rfTextPrimary">
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
