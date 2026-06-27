import { Text, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";

type PhotoUploadCardState = "missing" | "uploaded";

type PhotoUploadCardProps = {
  helper: string;
  iconName?: RfIconName;
  label: string;
  state: PhotoUploadCardState;
};

const stateClasses: Record<PhotoUploadCardState, { icon: string; shell: string; text: string }> = {
  missing: {
    icon: "text-rfPrimary",
    shell: "border-dashed border-rfBorderMuted bg-rfSurfaceSecondary",
    text: "text-rfTextSecondary",
  },
  uploaded: {
    icon: "text-rfSuccessForeground",
    shell: "border-rfSuccessLight bg-rfSuccessLightest",
    text: "text-rfSuccessForeground",
  },
};

export function PhotoUploadCard({
  helper,
  iconName = "camera-outline",
  label,
  state,
}: PhotoUploadCardProps) {
  const classes = stateClasses[state];

  return (
    <View className={`min-h-[132px] flex-1 gap-3 rounded-rf2xl border p-3.5 ${classes.shell}`}>
      <View className="flex-row items-start justify-between gap-2">
        <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfSurface">
          <RfIcon className={classes.icon} name={iconName} size={23} />
        </View>
        <View className="h-7 w-7 items-center justify-center rounded-full bg-rfSurface">
          <RfIcon
            className={state === "uploaded" ? "text-rfSuccessForeground" : "text-rfTextMuted"}
            name={state === "uploaded" ? "check" : "plus"}
            size={17}
          />
        </View>
      </View>
      <View className="gap-1">
        <Text className={`text-[13px] font-extrabold leading-[18px] ${classes.text}`}>
          {label}
        </Text>
        <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
          {helper}
        </Text>
      </View>
    </View>
  );
}
