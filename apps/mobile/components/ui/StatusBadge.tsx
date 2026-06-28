import { Text, View } from "react-native";

type StatusTone = "success" | "info" | "warning" | "neutral" | "error";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

const toneClasses: Record<StatusTone, { badge: string; text: string }> = {
  success: {
    badge: "bg-rfSuccessLightest",
    text: "text-rfSuccessForeground",
  },
  info: {
    badge: "bg-rfPrimaryLightest",
    text: "text-rfPrimaryDarker",
  },
  warning: {
    badge: "bg-rfWarningLightest",
    text: "text-rfWarningForeground",
  },
  neutral: {
    badge: "bg-rfNeutralLight",
    text: "text-rfNeutralForeground",
  },
  error: {
    badge: "bg-rfErrorLightest",
    text: "text-rfErrorForeground",
  },
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${toneClasses[tone].badge}`}>
      <Text className={`text-xs font-extrabold leading-4 ${toneClasses[tone].text}`}>
        {label}
      </Text>
    </View>
  );
}
