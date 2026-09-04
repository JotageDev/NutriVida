import React, { useMemo, useState } from "react";

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
  ActivityIndicator,
  Modal,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

import api from "../../src/services/api";

export default function Login() {
  // ==========================================
  // LOGIN
  // ==========================================

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [carregando, setCarregando] =
    useState(false);

  // ==========================================
  // PERFIL DE CLIENTE
  // ==========================================

  const [modalCliente, setModalCliente] =
    useState(false);

  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  const [dia, setDia] = useState("1");
  const [mes, setMes] = useState("1");
  const [ano, setAno] = useState("2008");

  const [salvandoCliente, setSalvandoCliente] =
    useState(false);

  const [tokenAtual, setTokenAtual] =
    useState("");

  // ==========================================
  // LISTAS DA DATA
  // ==========================================

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const anoAtual = new Date().getFullYear();

  const anos = useMemo(() => {
    const lista = [];

    for (let anoItem = anoAtual; anoItem >= 1920; anoItem--) {
      lista.push(anoItem);
    }

    return lista;
  }, [anoAtual]);

  const quantidadeDias = useMemo(() => {
    return new Date(
      Number(ano),
      Number(mes),
      0
    ).getDate();
  }, [mes, ano]);

  const dias = useMemo(() => {
    return Array.from(
      { length: quantidadeDias },
      (_, index) => index + 1
    );
  }, [quantidadeDias]);

  // ==========================================
  // FORMATA DATA PARA POSTGRESQL
  // ==========================================

  function formatarDataNascimento() {
    const diaFormatado = String(dia).padStart(
      2,
      "0"
    );

    const mesFormatado = String(mes).padStart(
      2,
      "0"
    );

    return `${ano}-${mesFormatado}-${diaFormatado}`;
  }

  // ==========================================
  // LOGIN
  // ==========================================

  async function entrar() {
    const emailLimpo =
      email.trim().toLowerCase();

    if (!emailLimpo || !senha) {
      Alert.alert(
        "Campos incompletos",
        "Digite seu e-mail e sua senha."
      );

      return;
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(emailLimpo)) {
      Alert.alert(
        "E-mail inválido",
        "Digite um endereço de e-mail válido."
      );

      return;
    }

    try {
      setCarregando(true);

      // ======================================
      // FAZ LOGIN
      // ======================================

      const resposta = await api.post(
        "/auth/login",
        {
          email_usuario: emailLimpo,
          senha_usuario: senha,
        }
      );

      const { token, usuario } =
        resposta.data;

      // ======================================
      // SALVA TOKEN E USUÁRIO
      // ======================================

      await AsyncStorage.setItem(
        "token",
        token
      );

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(usuario)
      );

      setTokenAtual(token);

      // ======================================
      // DESCOBRE SE JÁ É CLIENTE
      // ======================================

      try {
        await api.get(
          "/clientes/me",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        // Já possui cadastro de cliente
        router.replace(
          "/(tabs)/home"
        );
      } catch (clienteError: any) {
        // 404 significa que existe como usuário,
        // mas ainda não possui perfil de cliente.

        if (
          clienteError.response?.status ===
          404
        ) {
          setModalCliente(true);

          return;
        }

        throw clienteError;
      }
    } catch (error: any) {
      console.error(
        "Erro ao realizar login:",
        error
      );

      if (error.response) {
        Alert.alert(
          "Não foi possível entrar",
          error.response.data?.mensagem ||
            "E-mail ou senha inválidos."
        );

        return;
      }

      if (error.request) {
        Alert.alert(
          "Erro de conexão",
          "Não foi possível conectar ao servidor. Verifique se o Back-End está ligado."
        );

        return;
      }

      Alert.alert(
        "Erro",
        "Ocorreu um erro inesperado ao realizar o login."
      );
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================
  // CRIAR PERFIL CLIENTE
  // ==========================================

  async function criarCliente() {
    const pesoConvertido = Number(
      peso.replace(",", ".")
    );

    const alturaConvertida = Number(
      altura.replace(",", ".")
    );

    // ======================================
    // PESO
    // ======================================

    if (!peso.trim()) {
      Alert.alert(
        "Peso não informado",
        "Informe seu peso para continuar."
      );

      return;
    }

    if (
      isNaN(pesoConvertido) ||
      pesoConvertido <= 0 ||
      pesoConvertido > 500
    ) {
      Alert.alert(
        "Peso inválido",
        "Digite um peso válido em quilogramas."
      );

      return;
    }

    // ======================================
    // ALTURA
    // ======================================

    if (!altura.trim()) {
      Alert.alert(
        "Altura não informada",
        "Informe sua altura para continuar."
      );

      return;
    }

    if (
      isNaN(alturaConvertida) ||
      alturaConvertida <= 0 ||
      alturaConvertida > 3
    ) {
      Alert.alert(
        "Altura inválida",
        "Digite sua altura em metros. Exemplo: 1,75."
      );

      return;
    }

    // ======================================
    // DATA
    // ======================================

    const dataNascimento =
      formatarDataNascimento();

    const dataEscolhida = new Date(
      Number(ano),
      Number(mes) - 1,
      Number(dia)
    );

    const hoje = new Date();

    if (dataEscolhida > hoje) {
      Alert.alert(
        "Data inválida",
        "A data de nascimento não pode estar no futuro."
      );

      return;
    }

    // ======================================
    // ENVIA PARA O BACK-END
    // ======================================

    try {
      setSalvandoCliente(true);

      await api.post(
        "/clientes/me",
        {
          peso_cliente:
            pesoConvertido,

          altura_cliente:
            alturaConvertida,

          data_nascimento_cliente:
            dataNascimento,
        },
        {
          headers: {
            Authorization:
              `Bearer ${tokenAtual}`,
          },
        }
      );

      setModalCliente(false);

      Alert.alert(
        "Perfil concluído!",
        "Seus dados foram cadastrados com sucesso.",
        [
          {
            text: "Continuar",

            onPress: () => {
              router.replace(
                "/(tabs)/home"
              );
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "Erro ao criar cliente:",
        error
      );

      if (error.response) {
        Alert.alert(
          "Não foi possível salvar",
          error.response.data?.mensagem ||
            "Não foi possível criar seu perfil."
        );

        return;
      }

      Alert.alert(
        "Erro de conexão",
        "Não foi possível conectar ao servidor."
      );
    } finally {
      setSalvandoCliente(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* ================================ */}
        {/* VOLTAR */}
        {/* ================================ */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
          disabled={carregando}
        >
          <Ionicons
            name="arrow-back"
            size={30}
            color="#2E7D32"
          />
        </TouchableOpacity>

        {/* ================================ */}
        {/* LOGO */}
        {/* ================================ */}

        <View style={styles.logoArea}>
          <View
            style={styles.logoCircle}
          >
            <Ionicons
              name="leaf"
              size={34}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={styles.logoText}
          >
            NutriVida
          </Text>
        </View>

        {/* ================================ */}
        {/* TÍTULO */}
        {/* ================================ */}

        <Text style={styles.title}>
          Bem-vindo!
        </Text>

        <Text
          style={styles.subtitle}
        >
          Entre na sua conta para
          continuar cuidando da sua
          alimentação e rotina.
        </Text>

        {/* ================================ */}
        {/* CARD */}
        {/* ================================ */}

        <View style={styles.card}>
          {/* EMAIL */}

          <View
            style={
              styles.inputContainer
            }
          >
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
              autoCorrect={false}
              editable={!carregando}
            />
          </View>

          {/* SENHA */}

          <View
            style={
              styles.inputContainer
            }
          >
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
              secureTextEntry={
                !mostrarSenha
              }
              autoCapitalize="none"
              editable={!carregando}
              onSubmitEditing={
                entrar
              }
            />

            <TouchableOpacity
              onPress={() =>
                setMostrarSenha(
                  !mostrarSenha
                )
              }
              disabled={carregando}
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

          {/* ESQUECI SENHA */}

          <TouchableOpacity
            style={
              styles.forgotPasswordArea
            }
            disabled={carregando}
          >
            <Text
              style={
                styles.forgotPassword
              }
            >
              Esqueceu sua senha?
            </Text>
          </TouchableOpacity>

          {/* BOTÃO ENTRAR */}

          <TouchableOpacity
            style={[
              styles.button,

              carregando &&
                styles.buttonDisabled,
            ]}
            onPress={entrar}
            disabled={carregando}
            activeOpacity={0.85}
          >
            {carregando ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Entrando...
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Entrar
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={25}
                  color="#FFFFFF"
                />
              </>
            )}
          </TouchableOpacity>

          {/* CADASTRO */}

          <View
            style={
              styles.registerArea
            }
          >
            <Text
              style={
                styles.registerText
              }
            >
              Ainda não tem uma conta?{" "}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.replace(
                  "/cadastro"
                )
              }
              disabled={carregando}
            >
              <Text
                style={
                  styles.registerLink
                }
              >
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ================================= */}
      {/* MODAL - COMPLETAR PERFIL */}
      {/* ================================= */}

      <Modal
        visible={modalCliente}
        transparent
        animationType="fade"

        // Não deixamos fechar sem
        // preencher porque o usuário
        // precisa virar cliente.
        onRequestClose={() => {}}
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <KeyboardAvoidingView
            style={
              styles.modalKeyboard
            }
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
          >
            <ScrollView
              contentContainerStyle={
                styles.modalScroll
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                style={
                  styles.modalCard
                }
              >
                {/* ÍCONE */}

                <View
                  style={
                    styles.modalIcon
                  }
                >
                  <Ionicons
                    name="person-add-outline"
                    size={32}
                    color="#FFFFFF"
                  />
                </View>

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Complete seu perfil
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Só precisamos de algumas
                  informações para preparar
                  seu perfil no NutriVida.
                </Text>

                {/* ======================= */}
                {/* DATA DE NASCIMENTO */}
                {/* ======================= */}

                <View
                  style={
                    styles.sectionTitleArea
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#43A047"
                  />

                  <Text
                    style={
                      styles.modalLabelTitle
                    }
                  >
                    Data de nascimento
                  </Text>
                </View>

                <View
                  style={
                    styles.dateContainer
                  }
                >
                  {/* DIA */}

                  <View
                    style={
                      styles.dateColumn
                    }
                  >
                    <Text
                      style={
                        styles.dateLabel
                      }
                    >
                      Dia
                    </Text>

                    <View
                      style={
                        styles.pickerBox
                      }
                    >
                      <Picker
                        selectedValue={
                          dia
                        }
                        onValueChange={(
                          valor
                        ) =>
                          setDia(
                            String(valor)
                          )
                        }
                        style={
                          styles.picker
                        }
                      >
                        {dias.map(
                          (diaItem) => (
                            <Picker.Item
                              key={
                                diaItem
                              }
                              label={String(
                                diaItem
                              ).padStart(
                                2,
                                "0"
                              )}
                              value={String(
                                diaItem
                              )}
                            />
                          )
                        )}
                      </Picker>
                    </View>
                  </View>

                  {/* MÊS */}

                  <View
                    style={[
                      styles.dateColumn,
                      styles.monthColumn,
                    ]}
                  >
                    <Text
                      style={
                        styles.dateLabel
                      }
                    >
                      Mês
                    </Text>

                    <View
                      style={
                        styles.pickerBox
                      }
                    >
                      <Picker
                        selectedValue={
                          mes
                        }
                        onValueChange={(
                          valor
                        ) =>
                          setMes(
                            String(valor)
                          )
                        }
                        style={
                          styles.picker
                        }
                      >
                        {meses.map(
                          (
                            nomeMes,
                            indice
                          ) => (
                            <Picker.Item
                              key={
                                indice
                              }
                              label={
                                nomeMes
                              }
                              value={String(
                                indice +
                                  1
                              )}
                            />
                          )
                        )}
                      </Picker>
                    </View>
                  </View>

                  {/* ANO */}

                  <View
                    style={
                      styles.dateColumn
                    }
                  >
                    <Text
                      style={
                        styles.dateLabel
                      }
                    >
                      Ano
                    </Text>

                    <View
                      style={
                        styles.pickerBox
                      }
                    >
                      <Picker
                        selectedValue={
                          ano
                        }
                        onValueChange={(
                          valor
                        ) =>
                          setAno(
                            String(valor)
                          )
                        }
                        style={
                          styles.picker
                        }
                      >
                        {anos.map(
                          (anoItem) => (
                            <Picker.Item
                              key={
                                anoItem
                              }
                              label={String(
                                anoItem
                              )}
                              value={String(
                                anoItem
                              )}
                            />
                          )
                        )}
                      </Picker>
                    </View>
                  </View>
                </View>

                {/* DATA ESCOLHIDA */}

                <Text
                  style={
                    styles.selectedDate
                  }
                >
                  {String(dia).padStart(
                    2,
                    "0"
                  )}
                  /
                  {String(mes).padStart(
                    2,
                    "0"
                  )}
                  /{ano}
                </Text>

                {/* ======================= */}
                {/* PESO */}
                {/* ======================= */}

                <Text
                  style={
                    styles.modalLabel
                  }
                >
                  Peso (kg)
                </Text>

                <View
                  style={
                    styles.profileInputContainer
                  }
                >
                  <Ionicons
                    name="fitness-outline"
                    size={22}
                    color="#43A047"
                  />

                  <TextInput
                    style={
                      styles.profileInput
                    }
                    placeholder="Ex: 70,5"
                    placeholderTextColor="#7A858B"
                    value={peso}
                    onChangeText={setPeso}
                    keyboardType="decimal-pad"
                    editable={
                      !salvandoCliente
                    }
                  />

                  <Text
                    style={
                      styles.unitText
                    }
                  >
                    kg
                  </Text>
                </View>

                {/* ======================= */}
                {/* ALTURA */}
                {/* ======================= */}

                <Text
                  style={
                    styles.modalLabel
                  }
                >
                  Altura
                </Text>

                <View
                  style={
                    styles.profileInputContainer
                  }
                >
                  <Ionicons
                    name="resize-outline"
                    size={22}
                    color="#43A047"
                  />

                  <TextInput
                    style={
                      styles.profileInput
                    }
                    placeholder="Ex: 1,75"
                    placeholderTextColor="#7A858B"
                    value={altura}
                    onChangeText={
                      setAltura
                    }
                    keyboardType="decimal-pad"
                    editable={
                      !salvandoCliente
                    }
                  />

                  <Text
                    style={
                      styles.unitText
                    }
                  >
                    m
                  </Text>
                </View>

                {/* BOTÃO */}

                <TouchableOpacity
                  style={[
                    styles.modalButton,

                    salvandoCliente &&
                      styles.buttonDisabled,
                  ]}
                  onPress={
                    criarCliente
                  }
                  disabled={
                    salvandoCliente
                  }
                  activeOpacity={0.85}
                >
                  {salvandoCliente ? (
                    <>
                      <ActivityIndicator
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.modalButtonText
                        }
                      >
                        Salvando...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        style={
                          styles.modalButtonText
                        }
                      >
                        Continuar
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={22}
                        color="#FFFFFF"
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// ESTILOS
// ==========================================

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

    marginTop: 25,
    marginBottom: 30,
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

  forgotPasswordArea: {
    alignItems: "flex-end",

    marginTop: 1,
    marginBottom: 24,
  },

  forgotPassword: {
    color: "#2E7D32",

    fontSize: 14,

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

  buttonDisabled: {
    opacity: 0.65,
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

  // ========================================
  // MODAL
  // ========================================

  modalOverlay: {
    flex: 1,

    backgroundColor:
      "rgba(0, 0, 0, 0.45)",

    justifyContent: "center",
  },

  modalKeyboard: {
    flex: 1,
  },

  modalScroll: {
    flexGrow: 1,

    justifyContent: "center",

    padding: 22,
  },

  modalCard: {
    width: "100%",

    maxWidth: 520,

    alignSelf: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 26,

    padding: 25,

    shadowColor: "#000",

    shadowOpacity: 0.15,

    shadowRadius: 15,

    elevation: 10,
  },

  modalIcon: {
    width: 60,
    height: 60,

    borderRadius: 30,

    backgroundColor: "#43A047",

    alignSelf: "center",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 26,

    fontWeight: "700",

    color: "#2E7D32",

    textAlign: "center",
  },

  modalSubtitle: {
    fontSize: 15,

    lineHeight: 21,

    color: "#7A858B",

    textAlign: "center",

    marginTop: 8,
    marginBottom: 25,
  },

  sectionTitleArea: {
    flexDirection: "row",

    alignItems: "center",

    gap: 8,

    marginBottom: 10,
  },

  modalLabelTitle: {
    fontSize: 15,

    fontWeight: "700",

    color: "#37474F",
  },

  modalLabel: {
    fontSize: 14,

    fontWeight: "600",

    color: "#37474F",

    marginBottom: 7,

    marginTop: 3,
  },

  // DATA

  dateContainer: {
    flexDirection: "row",

    gap: 7,

    marginBottom: 8,
  },

  dateColumn: {
    flex: 1,
  },

  monthColumn: {
    flex: 1.5,
  },

  dateLabel: {
    fontSize: 12,

    color: "#7A858B",

    marginBottom: 5,

    textAlign: "center",
  },

  pickerBox: {
    height: 52,

    borderWidth: 1,

    borderColor: "#E2E7DF",

    borderRadius: 12,

    justifyContent: "center",

    overflow: "hidden",

    backgroundColor: "#FFFFFF",
  },

  picker: {
    width: "100%",
    height: 52,

    color: "#37474F",
  },

  selectedDate: {
    textAlign: "center",

    fontSize: 14,

    color: "#2E7D32",

    fontWeight: "600",

    marginBottom: 20,
  },

  // PESO / ALTURA

  profileInputContainer: {
    height: 55,

    borderWidth: 1,

    borderColor: "#E2E7DF",

    borderRadius: 14,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,

    marginBottom: 16,
  },

  profileInput: {
    flex: 1,

    marginLeft: 10,

    fontSize: 16,

    color: "#37474F",
  },

  unitText: {
    color: "#7A858B",

    fontSize: 15,

    fontWeight: "600",
  },

  modalButton: {
    height: 56,

    borderRadius: 28,

    backgroundColor: "#43A047",

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    gap: 10,

    marginTop: 7,
  },

  modalButtonText: {
    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "700",
  },
});