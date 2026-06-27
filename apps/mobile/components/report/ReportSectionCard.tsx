import type { ReactNode } from "react";
import { Text, View } from "react-native";

type ReportSectionCardProps = {
  children: ReactNode;
  helper?: string;
  index: number;
  title: string;
};

export function ReportSectionCard({
  children,
  helper,
  index,
  title,
}: ReportSectionCardProps) {
  return (
    <View className="gap-3.5">
      <View className="gap-0.5">
        <Text className="text-lg font-extrabold leading-6 text-rfTextPrimary">
          {index}. {title}
        </Text>
        {helper ? (
          <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
            {helper}
          </Text>
        ) : null}
      </View>
      <View className="gap-3.5 rounded-rf3xl border border-rfBorder bg-rfSurface p-5">
        {children}
      </View>
    </View>
  );
}
