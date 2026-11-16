import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import api from "../../services/api";
import colors from "../../constants/colors";


type Usuario = {
  id_usuario: number;
  nome_usuario: string;
  email_usuario: string;
  status_usuario: string;
  is_admin: boolean;
};


export default function Admin() {
  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [carregando, setCarregando] =
    useState(true);


  function mostrarAviso(
    titulo: string,
    mensagem: string
  ) {
    if (Platform.OS === "web") {
      window.alert(
        `${titulo}\n\n${mensagem}`
      );
    } else {
      Alert.alert(
        titulo,
        mensagem
      );
    }
  }


  async function verificarAdministrador() {
    try {
      setCarregando(true);

      const resposta =
        await api.get(
          "/auth/me"
        );

      const usuarioLogado =
        resposta.data.usuario;

      if (
        usuarioLogado.is_admin !== true
      ) {
        router.replace(
          "/(tabs)/home"
        );

        return;
      }

      setUsuario(
        usuarioLogado
      );

    } catch (error: any) {
      console.log(
        "Erro ao verificar administrador:",
        error.response?.data ||
          error
      );

      await AsyncStorage.removeItem(
        "token"
      );

      await AsyncStorage.removeItem(
        "usuario"
      );

      router.replace(
        "/login"
      );

    } finally {
      setCarregando(false);
    }
  }


  useEffect(() => {
    verificarAdministrador();
  }, []);


  async function sair() {
    await AsyncStorage.removeItem(
      "token"
    );

    await AsyncStorage.removeItem(
      "usuario"
    );

    router.replace(
      "/login"
    );
  }


  if (carregando) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Verificando acesso...
        </Text>
      </View>
    );
  }


  if (!usuario) {
    return null;
  }


  return (
    <View
      style={
        styles.container
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* CABEÇALHO */}

        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerLeft
            }
          >
            <View
              style={
                styles.logo
              }
            >
              <Ionicons
                name="shield-checkmark"
                size={26}
                color={
                  colors.white
                }
              />
            </View>

            <View>
              <Text
                style={
                  styles.headerTitle
                }
              >
                Painel Admin
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                NutriVida
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={
              styles.logoutButton
            }
            onPress={
              sair
            }
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={
                colors.danger
              }
            />
          </TouchableOpacity>
        </View>


        {/* BOAS-VINDAS */}

        <View
          style={
            styles.welcomeCard
          }
        >
          <View
            style={
              styles.welcomeIcon
            }
          >
            <Ionicons
              name="person-circle-outline"
              size={42}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.welcomeContent
            }
          >
            <Text
              style={
                styles.welcomeTitle
              }
            >
              Olá,{" "}
              {
                usuario.nome_usuario
              }
            </Text>

            <Text
              style={
                styles.welcomeText
              }
            >
              Você está acessando a área administrativa do NutriVida.
            </Text>
          </View>
        </View>


        {/* GERENCIAMENTO */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Gerenciamento
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Administre os dados do sistema
            </Text>
          </View>

          <Ionicons
            name="settings-outline"
            size={23}
            color={
              colors.primary
            }
          />
        </View>


        {/* USUÁRIOS */}

        <TouchableOpacity
          style={
            styles.managementCard
          }
          onPress={() =>
            router.push(
              "/admin/usuarios"
            )
          }
          activeOpacity={
            0.85
          }
        >
          <View
            style={
              styles.managementIcon
            }
          >
            <Ionicons
              name="people-outline"
              size={29}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.managementContent
            }
          >
            <Text
              style={
                styles.managementTitle
              }
            >
              Usuários
            </Text>

            <Text
              style={
                styles.managementDescription
              }
            >
              Gerencie contas, status, dados e acessos.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={
              colors.textSecondary
            }
          />
        </TouchableOpacity>


        {/* ALIMENTOS */}

        <TouchableOpacity
          style={
            styles.managementCard
          }
          onPress={() => router.push("/admin/alimentos" as any)}
          activeOpacity={
            0.85
          }
        >
          <View
            style={
              styles.managementIcon
            }
          >
            <Ionicons
              name="nutrition-outline"
              size={29}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.managementContent
            }
          >
            <Text
              style={
                styles.managementTitle
              }
            >
              Alimentos
            </Text>

            <Text
              style={
                styles.managementDescription
              }
            >
              Cadastre, edite e exclua alimentos e informações nutricionais.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={
              colors.textSecondary
            }
          />
        </TouchableOpacity>


        {/* CATEGORIAS */}

        <TouchableOpacity
          style={
            styles.managementCard
          }
          onPress={() => router.push("/admin/categorias" as any)}
          activeOpacity={
            0.85
          }
        >
          <View
            style={
              styles.managementIcon
            }
          >
            <Ionicons
              name="folder-open-outline"
              size={29}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.managementContent
            }
          >
            <Text
              style={
                styles.managementTitle
              }
            >
              Categorias
            </Text>

            <Text
              style={
                styles.managementDescription
              }
            >
              Crie, edite e exclua categorias de alimentos.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={
              colors.textSecondary
            }
          />
        </TouchableOpacity>


        {/* ESTATÍSTICAS */}

        <TouchableOpacity
          style={
            styles.managementCard
          }
          onPress={() =>
            mostrarAviso(
              "Em breve",
              "As estatísticas serão implementadas em uma próxima etapa."
            )
          }
          activeOpacity={
            0.85
          }
        >
          <View
            style={
              styles.managementIcon
            }
          >
            <Ionicons
              name="stats-chart-outline"
              size={29}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.managementContent
            }
          >
            <Text
              style={
                styles.managementTitle
              }
            >
              Estatísticas
            </Text>

            <Text
              style={
                styles.managementDescription
              }
            >
              Visualize informações gerais do sistema.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={
              colors.textSecondary
            }
          />
        </TouchableOpacity>


        {/* INFORMAÇÃO */}

        <View
          style={
            styles.quickCard
          }
        >
          <View
            style={
              styles.quickIcon
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={25}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.quickContent
            }
          >
            <Text
              style={
                styles.quickTitle
              }
            >
              Área administrativa
            </Text>

            <Text
              style={
                styles.quickText
              }
            >
              O gerenciamento de usuários, alimentos e categorias já está disponível.
            </Text>
          </View>
        </View>


        <Text
          style={
            styles.footer
          }
        >
          NutriVida • Painel Administrativo
        </Text>

      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor:
      colors.background,
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  loadingText: {
    marginTop: 12,
    color:
      colors.textSecondary,
    fontSize: 14,
  },

  header: {
    flexDirection:
      "row",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    marginTop: 10,
    marginBottom: 24,
  },

  headerLeft: {
    flexDirection:
      "row",
    alignItems:
      "center",
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor:
      colors.primary,
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color:
      colors.textSecondary,
  },

  logoutButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor:
      colors.dangerBackground,
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  welcomeCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 20,
    padding: 18,
    flexDirection:
      "row",
    alignItems:
      "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  welcomeIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor:
      colors.subtleGreen,
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 14,
  },

  welcomeContent: {
    flex: 1,
  },

  welcomeTitle: {
    fontSize: 18,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  welcomeText: {
    fontSize: 13,
    color:
      colors.textSecondary,
    marginTop: 4,
    lineHeight: 19,
  },

  sectionHeader: {
    flexDirection:
      "row",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  sectionSubtitle: {
    fontSize: 13,
    color:
      colors.textSecondary,
    marginTop: 3,
  },

  managementCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 18,
    minHeight: 88,
    padding: 16,
    flexDirection:
      "row",
    alignItems:
      "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  managementIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor:
      colors.subtleGreen,
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 14,
  },

  managementContent: {
    flex: 1,
  },

  managementTitle: {
    fontSize: 16,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  managementDescription: {
    fontSize: 13,
    color:
      colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },

  quickCard: {
    marginTop: 10,
    backgroundColor:
      colors.subtleGreen,
    borderRadius: 18,
    padding: 16,
    flexDirection:
      "row",
    alignItems:
      "center",
  },

  quickIcon: {
    marginRight: 12,
  },

  quickContent: {
    flex: 1,
  },

  quickTitle: {
    fontSize: 15,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  quickText: {
    fontSize: 13,
    color:
      colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },

  footer: {
    textAlign:
      "center",
    color:
      colors.textSecondary,
    fontSize: 12,
    marginTop: 30,
  },
});