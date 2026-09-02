import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState(false);

  const [aceitouTermos, setAceitouTermos] = useState(false);

  function cadastrar() {
    // Validação básica para o protótipo
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert(
        "Campos incompletos",
        "Preencha todos os campos para continuar."
      );

      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(
        "Senhas diferentes",
        "A senha e a confirmação precisam ser iguais."
      );

      return;
    }

    if (!aceitouTermos) {
      Alert.alert(
        "Termos de uso",
        "Você precisa aceitar os termos de uso."
      );

      return;
    }

    // FUTURAMENTE:
    // aqui ficará o cadastro no banco de dados

    router.replace("/(tabs)/home");
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* BOTÃO VOLTAR */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={30}
            color="#2E7D32"
          />
        </TouchableOpacity>

        {/* LOGO */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Ionicons
              name="leaf"
              size={34}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.logoText}>
            NutriVida
          </Text>
        </View>

        {/* TÍTULO */}
        <Text style={styles.title}>
          Crie sua conta
        </Text>

        <Text style={styles.subtitle}>
          Cadastre-se para acessar seu banco de alimentos, IMC e agenda.
        </Text>

        {/* CARD */}
        <View style={styles.card}>
          {/* NOME */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={23}
              color="#43A047"
              style={styles.icon}
            />

            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#7A858B"
              value={nome}
              onChangeText={setNome}
            />
          </View>

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
              value={email}
              onChangeText={setEmail}
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
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
            />

            <TouchableOpacity
              onPress={() =>
                setMostrarSenha(!mostrarSenha)
              }
            >
              <Ionicons
                name={
                  mostrarSenha
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={25}
                color="#7A858B"
              />
            </TouchableOpacity>
          </View>

          {/* CONFIRMAR SENHA */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={23}
              color="#43A047"
              style={styles.icon}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              placeholderTextColor="#7A858B"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!mostrarConfirmarSenha}
            />

            <TouchableOpacity
              onPress={() =>
                setMostrarConfirmarSenha(
                  !mostrarConfirmarSenha
                )
              }
            >
              <Ionicons
                name={
                  mostrarConfirmarSenha
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={25}
                color="#7A858B"
              />
            </TouchableOpacity>
          </View>

          {/* TERMOS */}
          <TouchableOpacity
            style={styles.termsArea}
            onPress={() =>
              setAceitouTermos(!aceitouTermos)
            }
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                aceitouTermos &&
                  styles.checkboxChecked,
              ]}
            >
              {aceitouTermos && (
                <Ionicons
                  name="checkmark"
                  size={19}
                  color="#FFFFFF"
                />
              )}
            </View>

            <Text style={styles.termsText}>
              Li e aceito os{" "}
              <Text style={styles.termsLink}>
                termos de uso
              </Text>
            </Text>
          </TouchableOpacity>

          {/* BOTÃO CADASTRAR */}
          <TouchableOpacity
            style={styles.button}
            onPress={cadastrar}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              Cadastrar
            </Text>

            <Ionicons
              name="arrow-forward"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* VOLTAR AO LOGIN */}
          <View style={styles.loginArea}>
            <Text style={styles.loginText}>
              Já tem uma conta?{" "}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.replace("/login")
              }
            >
              <Text style={styles.loginLink}>
                Entrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: "#F1F8EE",
  },

  scroll: {
    flex: 1,
    backgroundColor: "#F1F8EE",
  },

  container: {
    flexGrow: 1,
    backgroundColor: "#F1F8EE",
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 40,
  },

  backButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
  },

  logoArea: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 25,
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
    fontSize: 38,
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
    marginBottom: 30,
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

  termsArea: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    marginBottom: 24,
  },

  checkbox: {
    width: 27,
    height: 27,

    borderWidth: 2,
    borderColor: "#66BB6A",

    borderRadius: 6,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 11,
  },

  checkboxChecked: {
    backgroundColor: "#43A047",
    borderColor: "#43A047",
  },

  termsText: {
    flex: 1,
    fontSize: 15,
    color: "#37474F",
  },

  termsLink: {
    color: "#2E7D32",
    fontWeight: "600",
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

  loginArea: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  loginText: {
    color: "#37474F",
    fontSize: 15,
  },

  loginLink: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "700",
  },
});