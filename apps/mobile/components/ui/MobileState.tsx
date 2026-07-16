import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { rfColors } from "@/constants/routeforgeTheme";
import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";

type MobileStateTone = "empty" | "error" | "loading" | "offline";

type MobileStateCardProps = {
  actionLabel?: string;
  compact?: boolean;
  iconName?: RfIconName;
  message: string;
  onAction?: () => void;
  title: string;
  tone: MobileStateTone;
};

const stateToneClasses: Record<
  Exclude<MobileStateTone, "loading">,
  {
    border: string;
    icon: string;
    iconShell: string;
  }
> = {
  empty: {
    border: "border-rfBorder bg-rfSurface",
    icon: "text-rfPrimary",
    iconShell: "bg-rfPrimaryLightest",
  },
  error: {
    border: "border-rfErrorLight bg-rfErrorLightest",
    icon: "text-rfError",
    iconShell: "bg-rfSurface",
  },
  offline: {
    border: "border-rfWarningLight bg-rfWarningLightest",
    icon: "text-rfWarningForeground",
    iconShell: "bg-rfSurface",
  },
};

export function MobileStateCard({
  actionLabel,
  compact = false,
  iconName,
  message,
  onAction,
  title,
  tone,
}: MobileStateCardProps) {
  const isLoading = tone === "loading";
  const toneClass = isLoading ? stateToneClasses.empty : stateToneClasses[tone];

  return (
    <View
      className={`items-center gap-3 rounded-rf3xl border px-5 ${
        compact ? "py-4" : "py-6"
      } ${toneClass.border}`}>
      <View className={`h-14 w-14 items-center justify-center rounded-full ${toneClass.iconShell}`}>
        {isLoading ? (
          <ActivityIndicator color={rfColors.primary} />
        ) : (
          <RfIcon
            className={toneClass.icon}
            name={iconName ?? getDefaultIconName(tone)}
            size={28}
          />
        )}
      </View>
      <View className="items-center gap-1">
        <Text className="text-center text-[16px] font-extrabold leading-6 text-rfTextPrimary">
          {title}
        </Text>
        <Text className="text-center text-[13px] font-medium leading-[18px] text-rfTextSecondary">
          {message}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          className="min-h-[46px] flex-row items-center justify-center gap-2 rounded-rfXl bg-rfPrimary px-4 py-2.5"
          onPress={onAction}>
          <RfIcon className="text-rfTextInverse" name="reload" size={20} />
          <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextInverse">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MobileSkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-3" accessibilityLabel="Inhalt wird geladen" accessibilityRole="progressbar">
      {Array.from({ length: rows }, (_, index) => (
        <View
          className="gap-3 rounded-rf3xl border border-rfBorder bg-rfSurface p-4"
          key={`mobile-skeleton-${index}`}>
          <View className="h-4 w-2/3 rounded-full bg-rfSurfaceTertiary" />
          <View className="h-3 w-full rounded-full bg-rfSurfaceTertiary" />
          <View className="h-3 w-3/4 rounded-full bg-rfSurfaceTertiary" />
        </View>
      ))}
    </View>
  );
}

function getDefaultIconName(tone: Exclude<MobileStateTone, "loading">): RfIconName {
  if (tone === "error") {
    return "alert-circle-outline";
  }

  if (tone === "offline") {
    return "wifi-off";
  }

  return "tray";
}
