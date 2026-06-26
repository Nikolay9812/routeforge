import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { RfIcon, type RfIconName } from "@/components/ui/RfIcon";
import { rfColors } from "@/constants/routeforgeTheme";

type AuthTextFieldProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  iconName: RfIconName;
  keyboardType?: "default" | "email-address";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  textContentType?: "emailAddress" | "password";
  value: string;
};

export function AuthTextField({
  autoCapitalize = "none",
  iconName,
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  textContentType,
  value,
}: AuthTextFieldProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View className="gap-2">
      <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
        {label}
      </Text>
      <View className="min-h-[48px] flex-row items-center rounded-rfLg border border-rfBorder bg-rfSurface px-3">
        <RfIcon className="text-rfTextMuted" name={iconName} size={20} />
        <TextInput
          autoCapitalize={autoCapitalize}
          className="min-h-[46px] flex-1 px-3 text-[14px] font-medium text-rfTextPrimary"
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={rfColors.textMuted}
          secureTextEntry={isSecure}
          textContentType={textContentType}
          value={value}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={isSecure ? "Passwort anzeigen" : "Passwort verbergen"}
            className="h-11 w-11 items-center justify-center rounded-full"
            onPress={() => setIsSecure((current) => !current)}>
            <RfIcon className="text-rfTextMuted" name={isSecure ? "eye-outline" : "eye-off-outline"} size={20} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
