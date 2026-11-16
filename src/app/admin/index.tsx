
import React, { useEffect, useState } from "react";

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

type Estatisticas = {
  usuarios: number;
  administradores: number;
  alimentos: number;
  categorias: number;
};

export default function Admin() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoEstatisticas, setCarregandoEstatisticas] = useState(false);

  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    usuarios: 0,
    administradores: 0,
    alimentos: 0,
    categorias: 0,
  });

  function mostrarAviso(titulo: string, mensagem: string) {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  async function carregarEstatisticas() {
    try {
      setCarregandoEstatisticas(true);

      const resposta = await api.get("/admin/estatisticas");

      setEstatisticas({
        usuarios: Number(resposta.data.usuarios) || 0,
        administradores: Number(resposta.data.administradores) || 0,
        alimentos: Number(resposta.data.alimentos) || 0,
        categorias: Number(resposta.data.categorias) || 0,
      });
    } catch (error: any) {
      console.log(
        "Erro ao carregar estatísticas:",
        error.response?.data || error
      );

      mostrarAviso(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível carregar as estatísticas."
      );
    } finally {
      setCarregandoEstatisticas(false);
    }
  }

  async function verificarAdministrador() {
    try {
      setCarregando(true);

      const resposta = await api.get("/auth/me");
      const usuarioLogado = resposta.data.usuario;

      if (usuarioLogado.is_admin !== true) {
        router.replace("/(tabs)/home");
        return;
      }

      setUsuario(usuarioLogado);

      // Carrega os números somente depois de confirmar o acesso.
      await carregarEstatisticas();
    } catch (error: any) {
      console.log(
        "Erro ao verificar administrador:",
        error.response?.data || error
      );

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("usuario");

      router.replace("/login");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    verificarAdministrador();
  }, []);

  async function sair() {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");

    router.replace("/login");
  }

  function abrirTela(caminho: string) {
    router.push(caminho as any);
  }

  function CardGerenciamento({
    titulo,
    descricao,
    icone,
    destino,
  }: {
    titulo: string;
    descricao: string;
    icone: keyof typeof Ionicons.glyphMap;
    destino: string;
  }) {
    return (
      <TouchableOpacity
        style={styles.managementCard}
        onPress={() => abrirTela(destino)}
        activeOpacity={0.85}
      >
        <View style={styles.managementIcon}>
          <Ionicons
            name={icone}
            size={29}
            color={colors.primary}
          />
        </View>

        <View style={styles.managementContent}>
          <Text style={styles.managementTitle}>{titulo}</Text>

          <Text style={styles.managementDescription}>
            {descricao}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    );
  }

  function CardEstatistica({
    titulo,
    valor,
    icone,
  }: {
    titulo: string;
    valor: number;
    icone: keyof typeof Ionicons.glyphMap;
  }) {
    return (
      <View style={styles.statCard}>
        <View style={styles.statIcon}>
          <Ionicons
            name={icone}
            size={25}
            color={colors.primary}
          />
        </View>

        <Text style={styles.statValue}>
          {valor.toLocaleString("pt-BR")}
        </Text>

        <Text style={styles.statTitle}>{titulo}</Text>
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Verificando acesso...
        </Text>
      </View>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* CABEÇALHO */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Ionicons
                name="shield-checkmark"
                size={26}
                color={colors.white}
              />
            </View>

            <View>
              <Text style={styles.headerTitle}>
                Painel Admin
              </Text>

              <Text style={styles.headerSubtitle}>
                NutriVida
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={sair}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={colors.danger}
            />
          </TouchableOpacity>
        </View>

        {/* BOAS-VINDAS */}

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Ionicons
              name="person-circle-outline"
              size={42}
              color={colors.primary}
            />
          </View>

          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              Olá, {usuario.nome_usuario}
            </Text>

            <Text style={styles.welcomeText}>
              Você está acessando a área administrativa do NutriVida.
            </Text>
          </View>
        </View>

        {/* ESTATÍSTICAS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Visão geral
            </Text>

            <Text style={styles.sectionSubtitle}>
              Informações atuais do sistema
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={carregarEstatisticas}
            disabled={carregandoEstatisticas}
          >
            {carregandoEstatisticas ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />
            ) : (
              <Ionicons
                name="refresh-outline"
                size={22}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <CardEstatistica
            titulo="Usuários"
            valor={estatisticas.usuarios}
            icone="people-outline"
          />

          <CardEstatistica
            titulo="Administradores"
            valor={estatisticas.administradores}
            icone="shield-checkmark-outline"
          />

          <CardEstatistica
            titulo="Alimentos"
            valor={estatisticas.alimentos}
            icone="nutrition-outline"
          />

          <CardEstatistica
            titulo="Categorias"
            valor={estatisticas.categorias}
            icone="folder-open-outline"
          />
        </View>

        {carregandoEstatisticas && (
          <Text style={styles.updatingText}>
            Atualizando informações...
          </Text>
        )}

        {/* GERENCIAMENTO */}

        <View style={[styles.sectionHeader, styles.managementHeader]}>
          <View>
            <Text style={styles.sectionTitle}>
              Gerenciamento
            </Text>

            <Text style={styles.sectionSubtitle}>
              Administre os dados do sistema
            </Text>
          </View>

          <Ionicons
            name="settings-outline"
            size={23}
            color={colors.primary}
          />
        </View>

        <CardGerenciamento
          titulo="Usuários"
          descricao="Gerencie contas, status, dados e acessos."
          icone="people-outline"
          destino="/admin/usuarios"
        />

        <CardGerenciamento
          titulo="Alimentos"
          descricao="Cadastre, edite e exclua alimentos e informações nutricionais."
          icone="nutrition-outline"
          destino="/admin/alimentos"
        />

        <CardGerenciamento
          titulo="Categorias"
          descricao="Crie, edite e exclua categorias de alimentos."
          icone="folder-open-outline"
          destino="/admin/categorias"
        />

        {/* INFORMAÇÃO */}

        <View style={styles.quickCard}>
          <View style={styles.quickIcon}>
            <Ionicons
              name="information-circle-outline"
              size={25}
              color={colors.primary}
            />
          </View>

          <View style={styles.quickContent}>
            <Text style={styles.quickTitle}>
              Área administrativa
            </Text>

            <Text style={styles.quickText}>
              O gerenciamento de usuários, alimentos e categorias
              está disponível.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          NutriVida • Painel Administrativo
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textSecondary,
  },

  logoutButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.dangerBackground,
    justifyContent: "center",
    alignItems: "center",
  },

  welcomeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },

  welcomeIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  welcomeContent: {
    flex: 1,
  },

  welcomeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  welcomeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 19,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },

  statCard: {
    width: "48%",
    minHeight: 132,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  statValue: {
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
  },

  statTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },

  updatingText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },

  managementHeader: {
    marginTop: 28,
  },

  managementCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    minHeight: 88,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  managementIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  managementContent: {
    flex: 1,
  },

  managementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  managementDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },

  quickCard: {
    marginTop: 10,
    backgroundColor: colors.subtleGreen,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  quickIcon: {
    marginRight: 12,
  },

  quickContent: {
    flex: 1,
  },

  quickTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  quickText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },

  footer: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 30,
  },
});
