import { Image, Pressable, Text, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";

type PhotoUploadCardState = "error" | "missing" | "uploaded";

type PhotoUploadCardProps = {
  helper: string;
  iconName?: RfIconName;
  isBusy?: boolean;
  label: string;
  onCapture?: () => void;
  onPick?: () => void;
  onRemove?: () => void;
  previewUri?: string;
  required?: boolean;
  state: PhotoUploadCardState;
  statusLabel?: string;
};

const stateClasses: Record<PhotoUploadCardState, { icon: string; shell: string; text: string }> = {
  error: {
    icon: "text-rfError",
    shell: "border-rfErrorLight bg-rfErrorLightest",
    text: "text-rfErrorForeground",
  },
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
  isBusy = false,
  label,
  onCapture,
  onPick,
  onRemove,
  previewUri,
  required = false,
  state,
  statusLabel,
}: PhotoUploadCardProps) {
  const classes = stateClasses[state];
  const statusIconName = state === "uploaded" ? "check" : state === "error" ? "alert-circle-outline" : "plus";
  const statusIconClassName =
    state === "uploaded"
      ? "text-rfSuccessForeground"
      : state === "error"
        ? "text-rfError"
        : "text-rfTextMuted";

  return (
    <View className={`min-h-[186px] flex-1 gap-3 rounded-rf2xl border p-3.5 ${classes.shell}`}>
      {previewUri ? (
        <View className="overflow-hidden rounded-rfXl border border-rfSuccessLight bg-rfSurface">
          <Image
            accessibilityLabel={`${label} Vorschau`}
            className="h-[92px] w-full"
            resizeMode="cover"
            source={{ uri: previewUri }}
          />
          {onRemove ? (
            <Pressable
              accessibilityLabel={`${label} entfernen`}
              accessibilityRole="button"
              className="absolute right-2 top-2 h-11 w-11 items-center justify-center rounded-full bg-rfSurface"
              onPress={onRemove}>
              <RfIcon className="text-rfTextPrimary" name="close" size={18} />
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View className="flex-row items-start justify-between gap-2">
          <View className="h-11 w-11 items-center justify-center rounded-rfLg bg-rfSurface">
            <RfIcon className={classes.icon} name={iconName} size={23} />
          </View>
          <View className="h-7 w-7 items-center justify-center rounded-full bg-rfSurface">
            <RfIcon className={statusIconClassName} name={statusIconName} size={17} />
          </View>
        </View>
      )}
      <View className="gap-1">
        <Text className={`text-[13px] font-extrabold leading-[18px] ${classes.text}`}>
          {label}
        </Text>
        <Text className="text-[11px] font-medium leading-[15px] text-rfTextMuted">
          {helper}
        </Text>
        {statusLabel ? (
          <Text className="text-[11px] font-bold leading-[15px] text-rfSuccessForeground">
            {statusLabel}
          </Text>
        ) : null}
        {required && state === "error" ? (
          <Text className="text-[11px] font-bold leading-[15px] text-rfErrorForeground">
            Erforderlich
          </Text>
        ) : null}
      </View>
      <View className="mt-auto flex-row gap-2">
        <Pressable
          accessibilityLabel={`${label} mit Kamera aufnehmen`}
          accessibilityRole="button"
          className="min-h-[44px] flex-1 flex-row items-center justify-center gap-1.5 rounded-rfLg bg-rfPrimary px-2.5 py-2"
          disabled={isBusy}
          onPress={onCapture}>
          <RfIcon className="text-rfTextInverse" name="camera-outline" size={17} />
          <Text className="text-[11px] font-extrabold leading-4 text-rfTextInverse">
            {isBusy ? "..." : previewUri ? "Neu" : "Kamera"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`${label} aus Galerie waehlen`}
          accessibilityRole="button"
          className="min-h-[44px] flex-1 flex-row items-center justify-center gap-1.5 rounded-rfLg border border-rfBorder bg-rfSurface px-2.5 py-2"
          disabled={isBusy}
          onPress={onPick}>
          <RfIcon className="text-rfTextPrimary" name="image-outline" size={17} />
          <Text className="text-[11px] font-extrabold leading-4 text-rfTextPrimary">
            {previewUri ? "Aendern" : "Galerie"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
