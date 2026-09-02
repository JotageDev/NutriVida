import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* LOGO */}
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Ionicons name="leaf" size={34} color="#FFFFFF" />
        </View>

        <Text style={styles.logoText}>NutriVida</Text>
      </View>

      {/* TÍTULO */}
      <Text style={styles.title}>Entrar</Text>

      <Text style={styles.subtitle}>
        Acesse sua conta para continuar usando o banco de alimentos, IMC e
        agenda.
      </Text>

      {/* CARD */}
      <View style={styles.card}>
        {/* EMAIL */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={23}
            color="#43A047"
            style={styles.icon}
          />

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#7A858B"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* SENHA */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={23}
            color="#43A047"
            style={styles.icon}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#7A858B"
            secureTextEntry={!mostrarSenha}
          />

          <TouchableOpacity
            onPress={() => setMostrarSenha(!mostrarSenha)}
          >
            <Ionicons
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={25}
              color="#7A858B"
            />
          </TouchableOpacity>
        </View>

        {/* ESQUECEU SENHA */}
        <TouchableOpacity>
          <Text style={styles.forgot}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        {/* ENTRAR */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={styles.buttonText}>Entrar</Text>

          <Ionicons
            name="arrow-forward"
            size={25}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* CADASTRO */}
        <View style={styles.registerArea}>
          <Text style={styles.registerText}>
            Não tem uma conta?{" "}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/cadastro")}
          >
            <Text style={styles.registerLink}>
              Cadastrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#F1F8EE",

    justifyContent: "center",

    paddingHorizontal: 24,
  },

  logoArea: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginBottom: 35,
  },

  logoCircle: {
    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor: "#43A047",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,
  },

  logoText: {
    fontSize: 28,

    fontWeight: "700",

    color: "#2E7D32",
  },

  title: {
    fontSize: 40,

    fontWeight: "700",

    color: "#2E7D32",

    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,

    lineHeight: 24,

    textAlign: "center",

    color: "#37474F",

    marginTop: 10,

    marginBottom: 35,

    paddingHorizontal: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 26,

    padding: 22,

    shadowColor: "#000",

    shadowOpacity: 0.07,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  inputContainer: {
    height: 60,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: "#E2E7DF",

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 16,

    marginBottom: 15,
  },

  icon: {
    marginRight: 12,
  },

  input: {
    flex: 1,

    fontSize: 16,

    color: "#37474F",
  },

  forgot: {
    color: "#2E7D32",

    fontSize: 14,

    textAlign: "right",

    marginBottom: 25,
  },

  button: {
    height: 58,

    borderRadius: 29,

    backgroundColor: "#43A047",

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    gap: 12,
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 19,

    fontWeight: "600",
  },

  registerArea: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 25,
  },

  registerText: {
    color: "#37474F",

    fontSize: 15,
  },

  registerLink: {
    color: "#2E7D32",

    fontSize: 15,

    fontWeight: "700",
  },
});