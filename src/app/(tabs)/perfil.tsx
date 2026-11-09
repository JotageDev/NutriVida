import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Modal,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import api from "../../services/api";
import colors from "../../constants/colors";

type Usuario = {
  id_usuario: number;
  nome_usuario: string;
  email_usuario: string;
};

type Cliente = {
  peso_cliente: number | null;
  altura_cliente: number | null;
  data_nascimento_cliente: string;
};

export default function Perfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  const [foto, setFoto] = useState<string | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [modalEditar, setModalEditar] = useState(false);
  const [modalSair, setModalSair] = useState(false);

  function mostrarAviso(titulo: string, mensagem: string) {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  async function carregarPerfil() {
    try {
      setCarregando(true);

      const [respostaUsuario, respostaCliente] = await Promise.all([
        api.get("/auth/me"),
        api.get("/clientes/me"),
      ]);

      const dadosUsuario = respostaUsuario.data.usuario;
      const dadosCliente = respostaCliente.data.cliente;

      setUsuario(dadosUsuario);
      setCliente(dadosCliente);

      setPeso(
        dadosCliente.peso_cliente != null
          ? String(dadosCliente.peso_cliente).replace(".", ",")
          : ""
      );

      setAltura(
        dadosCliente.altura_cliente != null
          ? String(dadosCliente.altura_cliente).replace(".", ",")
          : ""
      );

      const fotoSalva = await AsyncStorage.getItem(
        `foto_perfil_${dadosUsuario.id_usuario}`
      );

      setFoto(fotoSalva);
    } catch (error: any) {
      console.log(
        "Erro ao carregar perfil:",
        error.response?.data || error
      );

      mostrarAviso(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível carregar os dados do perfil."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function selecionarFoto() {
    try {
      const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        mostrarAviso(
          "Permissão necessária",
          "Permita o acesso à galeria para escolher uma foto."
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (resultado.canceled || !resultado.assets?.length) {
        return;
      }

      const novaFoto = resultado.assets[0].uri;

      setFoto(novaFoto);

      if (usuario) {
        await AsyncStorage.setItem(
          `foto_perfil_${usuario.id_usuario}`,
          novaFoto
        );
      }
    } catch (error) {
      console.log("Erro ao selecionar foto:", error);
      mostrarAviso("Erro", "Não foi possível selecionar a foto.");
    }
  }

  async function removerFoto() {
    if (usuario) {
      await AsyncStorage.removeItem(
        `foto_perfil_${usuario.id_usuario}`
      );
    }

    setFoto(null);
  }

  async function salvarAlteracoes() {
    const pesoConvertido = Number(peso.replace(",", "."));
    const alturaConvertida = Number(altura.replace(",", "."));

    if (
      !peso.trim() ||
      !Number.isFinite(pesoConvertido) ||
      pesoConvertido <= 0 ||
      pesoConvertido > 500
    ) {
      mostrarAviso("Peso inválido", "Informe um peso válido em quilogramas.");
      return;
    }

    if (
      !altura.trim() ||
      !Number.isFinite(alturaConvertida) ||
      alturaConvertida <= 0 ||
      alturaConvertida > 3
    ) {
      mostrarAviso(
        "Altura inválida",
        "Informe uma altura válida em metros. Exemplo: 1,75."
      );
      return;
    }

    try {
      setSalvando(true);

      const resposta = await api.patch("/clientes/me", {
        peso_cliente: pesoConvertido,
        altura_cliente: alturaConvertida,
      });

      setCliente((anterior) => ({
        ...(anterior as Cliente),
        ...resposta.data.cliente,
      }));

      setModalEditar(false);

      mostrarAviso("Sucesso", "Seus dados foram atualizados!");
    } catch (error: any) {
      console.log(
        "Erro ao atualizar perfil:",
        error.response?.data || error
      );

      mostrarAviso(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível atualizar seus dados."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function sairDaConta() {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("usuario");

      setModalSair(false);

      router.replace("/login");
    } catch (error) {
      console.log("Erro ao sair:", error);
      mostrarAviso("Erro", "Não foi possível sair da conta.");
    }
  }

  const pesoNumerico = Number(peso.replace(",", "."));
  const alturaNumerica = Number(altura.replace(",", "."));

  const imc =
    pesoNumerico > 0 && alturaNumerica > 0
      ? pesoNumerico / (alturaNumerica * alturaNumerica)
      : null;

  function classificacaoIMC(valor: number) {
    if (valor < 18.5) return "Abaixo do peso";
    if (valor < 25) return "Peso normal";
    if (valor < 30) return "Sobrepeso";
    if (valor < 35) return "Obesidade grau I";
    if (valor < 40) return "Obesidade grau II";
    return "Obesidade grau III";
  }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Meu perfil</Text>
            <Text style={styles.headerSubtitle}>
              Suas informações pessoais
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="person-outline"
              size={25}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Cartão do usuário */}
        <View style={styles.profileCard}>
          <View style={styles.photoContainer}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons
                  name="person"
                  size={48}
                  color={colors.primary}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={selecionarFoto}
            >
              <Ionicons name="camera" size={17} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {usuario?.nome_usuario || "Usuário"}
          </Text>

          <Text style={styles.userEmail}>
            {usuario?.email_usuario || ""}
          </Text>

          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={selecionarFoto}
          >
            <Text style={styles.changePhotoText}>
              {foto ? "Alterar foto" : "Adicionar foto"}
            </Text>
          </TouchableOpacity>

          {foto && (
            <TouchableOpacity onPress={removerFoto}>
              <Text style={styles.removePhotoText}>Remover foto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dados pessoais */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dados pessoais</Text>
            <Ionicons
              name="person-circle-outline"
              size={21}
              color={colors.primary}
            />
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nome completo</Text>
                <Text style={styles.infoValue}>
                  {usuario?.nome_usuario || "Não informado"}
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>E-mail</Text>
                <Text style={styles.infoValue}>
                  {usuario?.email_usuario || "Não informado"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Informações físicas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informações físicas</Text>
            <Ionicons
              name="fitness-outline"
              size={21}
              color={colors.primary}
            />
          </View>

          <View style={styles.physicalCard}>
            <View style={styles.physicalItem}>
              <View style={styles.physicalIcon}>
                <Ionicons
                  name="barbell-outline"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.physicalLabel}>Peso</Text>

              <Text style={styles.physicalValue}>
                {cliente?.peso_cliente != null
                  ? `${Number(cliente.peso_cliente).toLocaleString("pt-BR")} kg`
                  : "--"}
              </Text>
            </View>

            <View style={styles.physicalDivider} />

            <View style={styles.physicalItem}>
              <View style={styles.physicalIcon}>
                <Ionicons
                  name="resize-outline"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.physicalLabel}>Altura</Text>

              <Text style={styles.physicalValue}>
                {cliente?.altura_cliente != null
                  ? `${Number(cliente.altura_cliente).toLocaleString("pt-BR")} m`
                  : "--"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setModalEditar(true)}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.editButtonText}>
              Editar informações
            </Text>
          </TouchableOpacity>
        </View>

        {/* IMC */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meu IMC</Text>
            <Ionicons
              name="analytics-outline"
              size={21}
              color={colors.primary}
            />
          </View>

          <View style={styles.imcCard}>
            <View style={styles.imcIcon}>
              <Ionicons
                name="heart-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            {imc !== null ? (
              <>
                <Text style={styles.imcValue}>
                  {imc.toFixed(1).replace(".", ",")}
                </Text>

                <Text style={styles.imcClassification}>
                  {classificacaoIMC(imc)}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.imcValue}>--</Text>
                <Text style={styles.imcClassification}>
                  Informe seu peso e altura
                </Text>
              </>
            )}

            <Text style={styles.imcDescription}>
              O IMC é um indicador geral e não substitui uma avaliação
              profissional.
            </Text>
          </View>
        </View>

        {/* Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setModalSair(true)}
          >
            <View style={styles.logoutIcon}>
              <Ionicons
                name="log-out-outline"
                size={21}
                color={colors.danger}
              />
            </View>

            <Text style={styles.logoutText}>Sair da conta</Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>NutriVida • Cuidando de você</Text>
      </ScrollView>

      {/* Modal de edição */}
      <Modal
        visible={modalEditar}
        transparent
        animationType="slide"
        onRequestClose={() => setModalEditar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar informações</Text>

              <TouchableOpacity onPress={() => setModalEditar(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              value={peso}
              onChangeText={setPeso}
              placeholder="Ex: 70,5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Altura (metros)</Text>
            <TextInput
              style={styles.input}
              value={altura}
              onChangeText={setAltura}
              placeholder="Ex: 1,75"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalEditar(false)}
                disabled={salvando}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={salvarAlteracoes}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de saída */}
      <Modal
        visible={modalSair}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSair(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModal}>
            <View style={styles.logoutModalIcon}>
              <Ionicons
                name="log-out-outline"
                size={27}
                color={colors.danger}
              />
            </View>

            <Text style={styles.modalTitle}>Sair da conta?</Text>

            <Text style={styles.logoutDescription}>
              Você precisará entrar novamente para acessar seu perfil.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalSair(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, styles.logoutConfirmButton]}
                onPress={sairDaConta}
              >
                <Text style={styles.saveButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 23,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 5,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 23,
    alignItems: "center",
    elevation: 2,
    marginBottom: 25,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 13,
  },
  profilePhoto: {
    width: 105,
    height: 105,
    borderRadius: 53,
    borderWidth: 3,
    borderColor: colors.subtleGreen,
  },
  photoPlaceholder: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 5,
  },
  changePhotoButton: {
    backgroundColor: colors.subtleGreen,
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 9,
    marginTop: 15,
  },
  changePhotoText: {
    color: colors.primaryDark,
    fontWeight: "bold",
    fontSize: 12,
  },
  removePhotoText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 12,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 13,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  physicalCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 15,
    paddingVertical: 18,
    elevation: 2,
  },
  physicalItem: {
    flex: 1,
    alignItems: "center",
  },
  physicalIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 9,
  },
  physicalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  physicalValue: {
    fontSize: 19,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 5,
  },
  physicalDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  editButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.subtleGreen,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  editButtonText: {
    color: colors.primaryDark,
    fontWeight: "bold",
    fontSize: 13,
  },
  imcCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 2,
  },
  imcIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imcValue: {
    fontSize: 31,
    fontWeight: "bold",
    color: colors.primaryDark,
  },
  imcClassification: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginTop: 4,
  },
  imcDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 13,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dangerBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoutText: {
    flex: 1,
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 21,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: colors.text,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 13,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: "bold",
    fontSize: 13,
  },
  saveButton: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  logoutModal: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  logoutModalIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: colors.dangerBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  logoutDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 9,
  },
  logoutConfirmButton: {
    backgroundColor: colors.danger,
  },
});