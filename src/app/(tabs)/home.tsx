import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NutriVida</Text>
      <Text style={styles.text}>
        Tela inicial funcionando!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#F1F8EE",
  },

  title: {
    fontSize: 32,

    fontWeight: "700",

    color: "#2E7D32",
  },

  text: {
    marginTop: 10,

    fontSize: 16,

    color: "#37474F",
  },
});