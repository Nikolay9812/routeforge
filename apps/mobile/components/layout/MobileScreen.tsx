import type { ComponentType, ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView, type SafeAreaViewProps } from "react-native-safe-area-context";
import { cssInterop } from "nativewind";

cssInterop(SafeAreaView, { className: "style" });

const StyledSafeAreaView = SafeAreaView as ComponentType<
  SafeAreaViewProps & { className?: string }
>;

type MobileScreenProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function MobileScreen({ children, scroll = true }: MobileScreenProps) {
  if (!scroll) {
    return (
      <StyledSafeAreaView className="flex-1 bg-rfPrimaryDarker">
        <View className="flex-1 gap-4 bg-rfBackground p-4">{children}</View>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-rfPrimaryDarker">
      <ScrollView
        className="bg-rfBackground"
        contentContainerClassName="gap-4 p-4 pb-7"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </StyledSafeAreaView>
  );
}
