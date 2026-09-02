import { View, Text } from "react-native";

export default function Alimentos() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F8EE",
      }}
    >
      <Text
        style={{
          fontSize: 28,
          color: "#2E7D32",
          fontWeight: "bold",
        }}
      >
        Perfil
      </Text>
    </View>
  );
}