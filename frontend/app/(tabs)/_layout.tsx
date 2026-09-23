import { NativeTabs, Tabs } from "expo-router";
import { Platform } from "react-native";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";

import { usesNativeTabs } from "@/src/navigation";
import { useTheme } from "@/src/theme";

export default function TabsLayout() {
  const { colors } = useTheme();

  if (usesNativeTabs) {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="flame.fill" />
          <NativeTabs.Trigger.Label>Arena</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="online">
          <NativeTabs.Trigger.Icon sf="globe" />
          <NativeTabs.Trigger.Label>Online</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="galleria">
          <NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" />
          <NativeTabs.Trigger.Label>Galleria</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="storico">
          <NativeTabs.Trigger.Icon sf="scroll.fill" />
          <NativeTabs.Trigger.Label>Storico</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          ...(Platform.OS === "web" ? { height: 64 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Arena",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="sword-cross" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="online"
        options={{
          title: "Online",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="earth" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="galleria"
        options={{
          title: "Galleria",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="view-gallery" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="storico"
        options={{
          title: "Storico",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="history" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
