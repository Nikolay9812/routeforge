import { Pressable, Text, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";

type ProfileShortcutCardProps = {
  badgeLabel: string;
  helperText: string;
  icon: RfIconName;
  onPress?: () => void;
  title: string;
};

export function ProfileShortcutCard({
  badgeLabel,
  helperText,
  icon,
  onPress,
  title,
}: ProfileShortcutCardProps) {
  const content = (
    <>
      <View className="h-[58px] w-[58px] items-center justify-center rounded-rf2xl bg-rfPrimaryLightest">
        <RfIcon className="text-rfPrimary" name={icon} size={29} />
      </View>
      <View className="min-w-0 flex-1 gap-2">
        <View className="gap-0.5">
          <Text className="text-[17px] font-extrabold leading-6 text-rfTextPrimary">
            {title}
          </Text>
          <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
            {helperText}
          </Text>
        </View>
        <View className="self-start rounded-rfLg bg-rfPrimaryLightest px-3 py-1">
          <Text className="text-xs font-extrabold leading-4 text-rfPrimaryDarker">
            {badgeLabel}
          </Text>
        </View>
      </View>
      {onPress ? <RfIcon className="text-rfPrimary" name="chevron-right" size={27} /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View className="min-h-[104px] flex-row items-center gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-4">
        {content}
      </View>
    );
  }

  return (
    <Pressable
      className="min-h-[104px] flex-row items-center gap-4 rounded-rf3xl border border-rfBorder bg-rfSurface p-4"
      onPress={onPress}>
      {content}
    </Pressable>
  );
}
