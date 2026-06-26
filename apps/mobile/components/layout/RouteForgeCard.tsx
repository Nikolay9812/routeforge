import type { ReactNode } from "react";
import { View } from "react-native";

type RouteForgeCardProps = {
  children: ReactNode;
  className?: string;
  compact?: boolean;
  highlighted?: boolean;
};

export function RouteForgeCard({
  children,
  className = "",
  compact = false,
  highlighted = false,
}: RouteForgeCardProps) {
  const paddingClass = compact ? "p-4" : "p-5";
  const toneClass = highlighted
    ? "border-rfPrimaryLight bg-rfPrimaryLightest"
    : "border-rfBorder bg-rfSurface";

  return (
    <View className={`gap-3.5 rounded-rf3xl border ${toneClass} ${paddingClass} ${className}`}>
      {children}
    </View>
  );
}
