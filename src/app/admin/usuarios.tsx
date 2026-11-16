import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import api from "../../services/api";
import colors from "../../constants/colors";

type Usuario = {
  id_usuario: number;
  nome_usuario: string;
  email_usuario: string;
  ultimo_acesso: string | null;
  status_usuario: string;
  data_cadastro: string;
};

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] =
    useState<Usuario | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const [salvando, setSalvando] = useState(false);

  function mostrarAviso(
    titulo: string,
    mensagem: string
  ) {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  async function carregarUsuarios() {
    try {
      setCarregando(true);

      const resposta = await api.get("/usuarios");

      const lista =
        Array.isArray(resposta.data)
          ? resposta.data
          : resposta.data.usuarios || [];

      setUsuarios(lista);
      setUsuariosFiltrados(lista);

    } catch (error: any) {
      console.log(
        "Erro ao carregar usuários:",
        error.response?.data || error
      );

      mostrarAviso(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível carregar os usuários."
      );

    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    const texto = busca.trim().toLowerCase();

    if (!texto) {
      setUsuariosFiltrados(usuarios);
      return;
    }

    const resultado = usuarios.filter(
      (usuario) =>
        usuario.nome_usuario
          .toLowerCase()
          .includes(texto) ||
        usuario.email_usuario
          .toLowerCase()
          .includes(texto)
    );

    setUsuariosFiltrados(resultado);
  }, [busca, usuarios]);

  function abrirEdicao(usuario: Usuario) {
    setUsuarioSelecionado(usuario);
    setNome(usuario.nome_usuario);
    setEmail(usuario.email_usuario);
    setModalEditar(true);
  }

  function fecharEdicao() {
    if (salvando) {
      return;
    }

    setModalEditar(false);
    setUsuarioSelecionado(null);
    setNome("");
    setEmail("");
  }

  async function salvarEdicao() {
    if (!usuarioSelecionado) {
      return;
    }

    if (!nome.trim() || !email.trim()) {
      mostrarAviso(
        "Campos obrigatórios",
        "Nome e e-mail são obrigatórios."
      );
      return;
    }

    try {
      setSalvando(true);

      const resposta = await api.put(
        `/usuarios/${usuarioSelecionado.id_usuario}`,
        {
          nome_usuario: nome.trim(),
          email_usuario: email.trim(),
        }
      );

      const atualizado =
        resposta.data.usuario ||
        resposta.data;

      setUsuarios((lista) =>
        lista.map((usuario) =>
          usuario.id_usuario ===
          usuarioSelecionado.id_usuario
            ? {
                ...usuario,
                ...atualizado,
                nome_usuario:
                  atualizado.nome_usuario ||
                  nome.trim(),
                email_usuario:
                  atualizado.email_usuario ||
                  email.trim(),
              }
            : usuario
        )
      );

      fecharEdicao();

      mostrarAviso(
        "Sucesso",
        "Usuário atualizado com sucesso."
      );

    } catch (error: any) {
      console.log(
        "Erro ao editar usuário:",
        error.response?.data || error
      );

      mostrarAviso(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível atualizar o usuário."
      );

    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(
    usuario: Usuario,
    novoStatus: string
  ) {
    try {
      const resposta = await api.patch(
        `/usuarios/${usuario.id_usuario}/status`,
        {
          status_usuario: novoStatus,
        }
      );

      const atualizado =
        resposta.data.usuario ||
        resposta.data;

      setUsuarios((lista) =>
        lista.map((item) =>
          item.id_usuario === usuario.id_usuario
            ? {
                ...item,
                ...atualizado,
                status_usuario:
                  atualizado.status_usuario ||
                  novoStatus,
              }
            : item
        )
      );

      mostrarAviso(
        "Status atualizado",
        `O usuário foi definido como ${novoStatus.toLowerCase()}.`
      );

    } catch (error: any) {
      console.log(
        "Erro ao alterar status:",
        error.response?.data || error
      );

      mostrarAviso(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível alterar o status."
      );
    }
  }

  function confirmarStatus(
    usuario: Usuario,
    novoStatus: string
  ) {
    let mensagem = "";

    if (novoStatus === "ATIVO") {
      mensagem =
        "Deseja ativar este usuário?";
    } else if (novoStatus === "INATIVO") {
      mensagem =
        "Deseja inativar este usuário?";
    } else {
      mensagem =
        "Deseja bloquear este usuário?";
    }

    if (Platform.OS === "web") {
      if (window.confirm(mensagem)) {
        alterarStatus(
          usuario,
          novoStatus
        );
      }

      return;
    }

    Alert.alert(
      "Alterar status",
      mensagem,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () =>
            alterarStatus(
              usuario,
              novoStatus
            ),
        },
      ]
    );
  }

  async function excluirUsuario(
    usuario: Usuario
  ) {
    try {
      await api.delete(
        `/usuarios/${usuario.id_usuario}`
      );

      setUsuarios((lista) =>
        lista.filter(
          (item) =>
            item.id_usuario !==
            usuario.id_usuario
        )
      );

      mostrarAviso(
        "Usuário excluído",
        "O usuário foi excluído com sucesso."
      );

    } catch (error: any) {
      console.log(
        "Erro ao excluir usuário:",
        error.response?.data || error
      );

      mostrarAviso(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível excluir o usuário."
      );
    }
  }

  function confirmarExclusao(
    usuario: Usuario
  ) {
    const mensagem =
      `Tem certeza que deseja excluir o usuário "${usuario.nome_usuario}"?` +
      "\n\nEssa ação não pode ser desfeita.";

    if (Platform.OS === "web") {
      if (window.confirm(mensagem)) {
        excluirUsuario(usuario);
      }

      return;
    }

    Alert.alert(
      "Excluir usuário",
      mensagem,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () =>
            excluirUsuario(usuario),
        },
      ]
    );
  }

  function obterCorStatus(
    status: string
  ) {
    switch (status) {
      case "ATIVO":
        return colors.primary;

      case "INATIVO":
        return "#F57C00";

      case "BLOQUEADO":
        return colors.danger;

      default:
        return colors.textSecondary;
    }
  }

  function obterTextoStatus(
    status: string
  ) {
    switch (status) {
      case "ATIVO":
        return "Ativo";

      case "INATIVO":
        return "Inativo";

      case "BLOQUEADO":
        return "Bloqueado";

      default:
        return status;
    }
  }

  function formatarData(
    data: string | null
  ) {
    if (!data) {
      return "Nunca acessou";
    }

    try {
      return new Date(
        data
      ).toLocaleString("pt-BR");
    } catch {
      return "Não informado";
    }
  }

  if (carregando) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Carregando usuários...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* CABEÇALHO */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={colors.text}
            />
          </TouchableOpacity>

          <View
            style={styles.headerContent}
          >
            <Text style={styles.title}>
              Usuários
            </Text>

            <Text style={styles.subtitle}>
              Gerencie as contas do NutriVida
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {usuarios.length}
            </Text>
          </View>
        </View>

        {/* PESQUISA */}

        <View
          style={styles.searchContainer}
        >
          <Ionicons
            name="search-outline"
            size={21}
            color={colors.textSecondary}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome ou e-mail"
            placeholderTextColor={
              colors.textSecondary
            }
            value={busca}
            onChangeText={setBusca}
          />

          {busca.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setBusca("")
              }
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={
                  colors.textSecondary
                }
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.resultText}>
          {usuariosFiltrados.length}{" "}
          {usuariosFiltrados.length === 1
            ? "usuário encontrado"
            : "usuários encontrados"}
        </Text>

        {/* LISTA */}

        {usuariosFiltrados.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="people-outline"
              size={50}
              color={
                colors.textSecondary
              }
            />

            <Text
              style={styles.emptyTitle}
            >
              Nenhum usuário encontrado
            </Text>

            <Text
              style={styles.emptyText}
            >
              Tente pesquisar por outro nome ou e-mail.
            </Text>
          </View>
        ) : (
          usuariosFiltrados.map(
            (usuario) => (
              <View
                key={
                  usuario.id_usuario
                }
                style={styles.userCard}
              >
                <View
                  style={styles.userHeader}
                >
                  <View
                    style={styles.avatar}
                  >
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {usuario.nome_usuario
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View
                    style={styles.userMain}
                  >
                    <Text
                      style={
                        styles.userName
                      }
                      numberOfLines={1}
                    >
                      {
                        usuario.nome_usuario
                      }
                    </Text>

                    <Text
                      style={
                        styles.userEmail
                      }
                      numberOfLines={1}
                    >
                      {
                        usuario.email_usuario
                      }
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        borderColor:
                          obterCorStatus(
                            usuario.status_usuario
                          ),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            obterCorStatus(
                              usuario.status_usuario
                            ),
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            obterCorStatus(
                              usuario.status_usuario
                            ),
                        },
                      ]}
                    >
                      {obterTextoStatus(
                        usuario.status_usuario
                      )}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.infoContainer
                  }
                >
                  <View
                    style={
                      styles.infoItem
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={17}
                      color={
                        colors.textSecondary
                      }
                    />

                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      Cadastro:{" "}
                      {formatarData(
                        usuario.data_cadastro
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.infoItem
                    }
                  >
                    <Ionicons
                      name="time-outline"
                      size={17}
                      color={
                        colors.textSecondary
                      }
                    />

                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      Último acesso:{" "}
                      {formatarData(
                        usuario.ultimo_acesso
                      )}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.actionsContainer
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.editButton
                    }
                    onPress={() =>
                      abrirEdicao(
                        usuario
                      )
                    }
                  >
                    <Ionicons
                      name="create-outline"
                      size={19}
                      color={
                        colors.primary
                      }
                    />

                    <Text
                      style={
                        styles.editButtonText
                      }
                    >
                      Editar
                    </Text>
                  </TouchableOpacity>

                  {usuario.status_usuario !==
                    "ATIVO" && (
                    <TouchableOpacity
                      style={
                        styles.actionButton
                      }
                      onPress={() =>
                        confirmarStatus(
                          usuario,
                          "ATIVO"
                        )
                      }
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={19}
                        color={
                          colors.primary
                        }
                      />

                      <Text
                        style={[
                          styles.actionButtonText,
                          {
                            color:
                              colors.primary,
                          },
                        ]}
                      >
                        Ativar
                      </Text>
                    </TouchableOpacity>
                  )}

                  {usuario.status_usuario ===
                    "ATIVO" && (
                    <TouchableOpacity
                      style={
                        styles.actionButton
                      }
                      onPress={() =>
                        confirmarStatus(
                          usuario,
                          "INATIVO"
                        )
                      }
                    >
                      <Ionicons
                        name="pause-circle-outline"
                        size={19}
                        color="#F57C00"
                      />

                      <Text
                        style={[
                          styles.actionButtonText,
                          {
                            color:
                              "#F57C00",
                          },
                        ]}
                      >
                        Inativar
                      </Text>
                    </TouchableOpacity>
                  )}

                  {usuario.status_usuario !==
                    "BLOQUEADO" && (
                    <TouchableOpacity
                      style={
                        styles.actionButton
                      }
                      onPress={() =>
                        confirmarStatus(
                          usuario,
                          "BLOQUEADO"
                        )
                      }
                    >
                      <Ionicons
                        name="ban-outline"
                        size={19}
                        color={
                          colors.danger
                        }
                      />

                      <Text
                        style={[
                          styles.actionButtonText,
                          {
                            color:
                              colors.danger,
                          },
                        ]}
                      >
                        Bloquear
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      confirmarExclusao(
                        usuario
                      )
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color={
                        colors.danger
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )
          )
        )}
      </ScrollView>

      {/* MODAL DE EDIÇÃO */}

      <Modal
        visible={modalEditar}
        transparent
        animationType="fade"
        onRequestClose={
          fecharEdicao
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalCard}
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Editar usuário
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Atualize os dados da conta
                </Text>
              </View>

              <TouchableOpacity
                onPress={
                  fecharEdicao
                }
                disabled={salvando}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color={
                    colors.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.inputLabel}
            >
              Nome
            </Text>

            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome do usuário"
              placeholderTextColor={
                colors.textSecondary
              }
            />

            <Text
              style={styles.inputLabel}
            >
              E-mail
            </Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail do usuário"
              placeholderTextColor={
                colors.textSecondary
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View
              style={
                styles.modalActions
              }
            >
              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={
                  fecharEdicao
                }
                disabled={salvando}
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.saveButton
                }
                onPress={
                  salvarEdicao
                }
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      colors.white
                    }
                  />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={
                        colors.white
                      }
                    />

                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      Salvar
                    </Text>
                  </>
                )}
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
    backgroundColor:
      colors.background,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor:
      colors.background,
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
    alignItems: "center",
    marginTop: 10,
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  countText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },

  searchContainer: {
    backgroundColor:
      colors.surface,
    borderRadius: 16,
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.text,
    fontSize: 14,
    outlineStyle: "none",
  } as any,

  resultText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 10,
  },

  userCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },

  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor:
      colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.primary,
  },

  userMain: {
    flex: 1,
    marginRight: 8,
  },

  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  infoContainer: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 7,
  },

  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  editButton: {
    minHeight: 38,
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      colors.subtleGreen,
  },

  editButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },

  actionButton: {
    minHeight: 38,
    borderRadius: 11,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      colors.background,
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor:
      colors.dangerBackground,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 18,
    padding: 35,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 5,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 13,
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor:
      colors.surface,
    borderRadius: 22,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 13,
    color: colors.text,
    fontSize: 14,
    backgroundColor:
      colors.background,
    outlineStyle: "none",
  } as any,

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 25,
  },

  cancelButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor:
      colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },

  saveButton: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 13,
    backgroundColor:
      colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 5,
  },
});