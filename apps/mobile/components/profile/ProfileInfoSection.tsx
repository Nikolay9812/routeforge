import { Text, View } from "react-native";

import { RouteForgeCard } from "@/components/layout/RouteForgeCard";
import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";

export type ProfileInfoRow = {
  helperText?: string;
  icon: RfIconName;
  label: string;
  value: string;
};

type ProfileInfoSectionProps = {
  rows: ProfileInfoRow[];
  title: string;
};

export function ProfileInfoSection({ rows, title }: ProfileInfoSectionProps) {
  return (
    <RouteForgeCard compact className="gap-0">
      <View className="pb-2">
        <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">{title}</Text>
      </View>

      {rows.map((row, index) => (
        <View
          className={`min-h-[58px] flex-row items-center gap-3 py-3 ${
            index > 0 ? "border-t border-rfBorderLight" : ""
          }`}
          key={row.label}>
          <View className="h-10 w-10 items-center justify-center rounded-rfLg bg-rfSurfaceSecondary">
            <RfIcon className="text-rfTextSubtle" name={row.icon} size={21} />
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-[13px] font-semibold leading-[18px] text-rfTextSecondary">
              {row.label}
            </Text>
            <Text className="text-[15px] font-extrabold leading-5 text-rfTextPrimary">
              {row.value}
            </Text>
            {row.helperText ? (
              <Text className="text-xs font-medium leading-4 text-rfTextMuted">
                {row.helperText}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </RouteForgeCard>
  );
}
