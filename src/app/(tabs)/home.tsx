import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../constants/colors";

export default function Home() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá!</Text>

          <Text style={styles.title}>
            Bem-vindo ao NutriVida
          </Text>

          <Text style={styles.subtitle}>
            Cuide da sua alimentação e organize sua rotina.
          </Text>
        </View>

        <View style={styles.profileIcon}>
          <Ionicons
            name="person-outline"
            size={25}
            color="#43A047"
          />
        </View>
      </View>

      {/* CARD PRINCIPAL */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardIcon}>
          <Ionicons
            name="nutrition-outline"
            size={32}
            color="#43A047"
          />
        </View>

        <View style={styles.mainCardContent}>
          <Text style={styles.mainCardTitle}>
            NutriVida
          </Text>

          <Text style={styles.mainCardText}>
            Acompanhe seus alimentos, calcule suas refeições
            e organize suas tarefas.
          </Text>
        </View>
      </View>

      {/* TÍTULO */}
      <Text style={styles.sectionTitle}>
        Acesso rápido
      </Text>

      {/* CALCULADORA */}
      <TouchableOpacity
        style={styles.optionCard}
        activeOpacity={0.8}
        
      >
        <View style={styles.optionIcon}>
          <Ionicons
            name="calculator-outline"
            size={28}
            color="#43A047"
          />
        </View>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>
            Calculadora de refeição
          </Text>

          <Text style={styles.optionText}>
            Calcule calorias e nutrientes de acordo com
            os alimentos e suas quantidades.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#9AA39D"
        />
      </TouchableOpacity>

      {/* ALIMENTOS */}
      <TouchableOpacity
        style={styles.optionCard}
        activeOpacity={0.8}
        onPress={() => router.push("/(tabs)/alimentos")}
      >
        <View style={styles.optionIcon}>
          <Ionicons
            name="nutrition-outline"
            size={28}
            color="#43A047"
          />
        </View>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>
            Alimentos
          </Text>

          <Text style={styles.optionText}>
            Consulte os alimentos cadastrados e veja
            seus valores nutricionais.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#9AA39D"
        />
      </TouchableOpacity>

      {/* AGENDA */}
      <TouchableOpacity
        style={styles.optionCard}
        activeOpacity={0.8}
        onPress={() => router.push("/(tabs)/agenda")}
      >
        <View style={styles.optionIcon}>
          <Ionicons
            name="calendar-outline"
            size={28}
            color="#43A047"
          />
        </View>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>
            Agenda
          </Text>

          <Text style={styles.optionText}>
            Organize suas tarefas, datas e horários.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#9AA39D"
        />
      </TouchableOpacity>

      {/* RODAPÉ */}
      <View style={styles.footer}>
        <Ionicons
          name="heart-outline"
          size={18}
          color="#8A938D"
        />

        <Text style={styles.footerText}>
          Sua saúde começa pelos seus hábitos.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F8EE",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },

  greeting: {
    fontSize: 16,
    color: "#66716A",
    marginBottom: 4,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#26352B",
  },

  subtitle: {
    fontSize: 14,
    color: "#66716A",
    marginTop: 7,
    lineHeight: 20,
    maxWidth: 310,
  },

  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  mainCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  mainCardContent: {
    flex: 1,
  },

  mainCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#26352B",
    marginBottom: 5,
  },

  mainCardText: {
    fontSize: 13,
    color: "#66716A",
    lineHeight: 19,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#26352B",
    marginBottom: 13,
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#26352B",
    marginBottom: 4,
  },

  optionText: {
    fontSize: 13,
    color: "#66716A",
    lineHeight: 18,
  },

  footer: {
    marginTop: 25,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  footerText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#8A938D",
  },
});