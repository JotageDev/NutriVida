import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#43A047",

        tabBarInactiveTintColor: "#7A858B",

        tabBarStyle: {
          backgroundColor: "#FFFFFF",

          borderTopColor: "#E2E7DF",

          borderTopWidth: 1,

          height: 68,

          paddingTop: 7,

          paddingBottom: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* ALIMENTOS */}
      <Tabs.Screen
        name="alimentos"
        options={{
          title: "Alimentos",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="nutrition-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* AGENDA */}
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* PERFIL */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}