import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { rfColors } from "@/constants/routeforgeTheme";

type TabIconName =
  | "home-variant"
  | "calendar-month-outline"
  | "clipboard-text-outline"
  | "email-outline"
  | "account-circle-outline";

function TabIcon({ color, name }: { color: string; name: TabIconName }) {
  return <MaterialCommunityIcons color={color} name={name} size={24} />;
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: rfColors.primary,
        tabBarInactiveTintColor: rfColors.textMuted,
        tabBarStyle: {
          minHeight: 72,
          borderTopColor: rfColors.border,
          backgroundColor: rfColors.surface,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon color={color} name="home-variant" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historie",
          tabBarIcon: ({ color }) => <TabIcon color={color} name="calendar-month-outline" />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Bericht",
          tabBarIcon: ({ color }) => <TabIcon color={color} name="clipboard-text-outline" />,
        }}
      />
      <Tabs.Screen
        name="mailbox"
        options={{
          title: "Postfach",
          tabBarIcon: ({ color }) => <TabIcon color={color} name="email-outline" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabIcon color={color} name="account-circle-outline" />,
        }}
      />
    </Tabs>
  );
}
