import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { rfColors } from "@/constants/routeforgeTheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

const routeForgeNavigationTheme = {
  dark: false,
  colors: {
    primary: rfColors.primary,
    background: rfColors.background,
    card: rfColors.surface,
    text: rfColors.textPrimary,
    border: rfColors.border,
    notification: rfColors.primary,
  },
  fonts: {
    regular: {
      fontFamily: "Inter",
      fontWeight: "400" as const,
    },
    medium: {
      fontFamily: "Inter",
      fontWeight: "500" as const,
    },
    bold: {
      fontFamily: "Inter",
      fontWeight: "700" as const,
    },
    heavy: {
      fontFamily: "Inter",
      fontWeight: "800" as const,
    },
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={routeForgeNavigationTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
