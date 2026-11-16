import React, {
  useEffect,
  useState,
} from "react";

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

type Categoria = {
  id_categoria: number;
  nome_categoria: string;
};

export default function CategoriasAdmin() {
  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [busca, setBusca] =
    useState("");

  const [modal, setModal] =
    useState(false);

  const [editando, setEditando] =
    useState<Categoria | null>(null);

  const [nome, setNome] =
    useState("");

  const [salvando, setSalvando] =
    useState(false);

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

  async function carregarCategorias() {
    try {
      setCarregando(true);

      const resposta =
        await api.get(
          "/categorias"
        );

      setCategorias(
        resposta.data
          .categorias || []
      );

    } catch (error: any) {
      console.log(
        "Erro ao carregar categorias:",
        error.response?.data ||
          error
      );

      mostrarAviso(
        "Erro",
        error.response?.data
          ?.mensagem ||
          "Não foi possível carregar as categorias."
      );

    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  const categoriasFiltradas =
    categorias.filter(
      (categoria) =>
        categoria.nome_categoria
          .toLowerCase()
          .includes(
            busca
              .trim()
              .toLowerCase()
          )
    );

  function abrirNova() {
    setEditando(null);
    setNome("");
    setModal(true);
  }

  function abrirEdicao(
    categoria: Categoria
  ) {
    setEditando(categoria);
    setNome(
      categoria.nome_categoria
    );
    setModal(true);
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModal(false);
    setEditando(null);
    setNome("");
  }

  async function salvarCategoria() {
    if (!nome.trim()) {
      mostrarAviso(
        "Campo obrigatório",
        "Informe o nome da categoria."
      );

      return;
    }

    try {
      setSalvando(true);

      if (editando) {
        await api.put(
          `/categorias/${editando.id_categoria}`,
          {
            nome_categoria:
              nome.trim()
          }
        );

        mostrarAviso(
          "Sucesso",
          "Categoria atualizada com sucesso."
        );

      } else {
        await api.post(
          "/categorias",
          {
            nome_categoria:
              nome.trim()
          }
        );

        mostrarAviso(
          "Sucesso",
          "Categoria criada com sucesso."
        );
      }

      fecharModal();

      await carregarCategorias();

    } catch (error: any) {
      console.log(
        "Erro ao salvar categoria:",
        error.response?.data ||
          error
      );

      mostrarAviso(
        "Erro",
        error.response?.data
          ?.mensagem ||
          "Não foi possível salvar a categoria."
      );

    } finally {
      setSalvando(false);
    }
  }

  async function excluirCategoria(
    categoria: Categoria
  ) {
    try {
      await api.delete(
        `/categorias/${categoria.id_categoria}`
      );

      setCategorias(
        (lista) =>
          lista.filter(
            (item) =>
              item.id_categoria !==
              categoria.id_categoria
          )
      );

      mostrarAviso(
        "Sucesso",
        "Categoria excluída com sucesso."
      );

    } catch (error: any) {
      console.log(
        "Erro ao excluir categoria:",
        error.response?.data ||
          error
      );

      mostrarAviso(
        "Não foi possível excluir",
        error.response?.data
          ?.mensagem ||
          "Ocorreu um erro ao excluir a categoria."
      );
    }
  }

  function confirmarExclusao(
    categoria: Categoria
  ) {
    const mensagem =
      `Deseja excluir a categoria "${categoria.nome_categoria}"?`;

    if (
      Platform.OS === "web"
    ) {
      if (
        window.confirm(
          mensagem
        )
      ) {
        excluirCategoria(
          categoria
        );
      }

      return;
    }

    Alert.alert(
      "Excluir categoria",
      mensagem,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () =>
            excluirCategoria(
              categoria
            )
        }
      ]
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
          Carregando categorias...
        </Text>
      </View>
    );
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
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.replace(
                "/admin" as any
              )
            }
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={
                colors.text
              }
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerContent
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Categorias
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Organize os alimentos do NutriVida
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.addButton
            }
            onPress={
              abrirNova
            }
          >
            <Ionicons
              name="add"
              size={23}
              color={
                colors.white
              }
            />
          </TouchableOpacity>
        </View>

        {/* PESQUISA */}

        <View
          style={
            styles.searchContainer
          }
        >
          <Ionicons
            name="search-outline"
            size={21}
            color={
              colors.textSecondary
            }
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Pesquisar categoria"
            placeholderTextColor={
              colors.textSecondary
            }
            value={busca}
            onChangeText={
              setBusca
            }
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

        <Text
          style={
            styles.resultText
          }
        >
          {categoriasFiltradas.length}{" "}
          {categoriasFiltradas.length === 1
            ? "categoria"
            : "categorias"}
        </Text>

        {/* LISTA */}

        {categoriasFiltradas.length === 0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Ionicons
              name="folder-open-outline"
              size={50}
              color={
                colors.textSecondary
              }
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Nenhuma categoria encontrada
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Cadastre uma nova categoria usando o botão +.
            </Text>
          </View>
        ) : (
          categoriasFiltradas.map(
            (categoria) => (
              <View
                key={
                  categoria.id_categoria
                }
                style={
                  styles.categoryCard
                }
              >

                <View
                  style={
                    styles.categoryIcon
                  }
                >
                  <Ionicons
                    name="folder-open-outline"
                    size={24}
                    color={
                      colors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.categoryContent
                  }
                >
                  <Text
                    style={
                      styles.categoryName
                    }
                  >
                    {
                      categoria.nome_categoria
                    }
                  </Text>

                  <Text
                    style={
                      styles.categoryId
                    }
                  >
                    ID:{" "}
                    {
                      categoria.id_categoria
                    }
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.editButton
                  }
                  onPress={() =>
                    abrirEdicao(
                      categoria
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
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.deleteButton
                  }
                  onPress={() =>
                    confirmarExclusao(
                      categoria
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
            )
          )
        )}

      </ScrollView>

      {/* MODAL */}

      <Modal
        visible={
          modal
        }
        transparent
        animationType="fade"
        onRequestClose={
          fecharModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalCard
            }
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
                  {editando
                    ? "Editar categoria"
                    : "Nova categoria"}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Informe o nome da categoria
                </Text>
              </View>

              <TouchableOpacity
                onPress={
                  fecharModal
                }
                disabled={
                  salvando
                }
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
              style={
                styles.label
              }
            >
              Nome
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={
                nome
              }
              onChangeText={
                setNome
              }
              placeholder="Ex.: Frutas"
              placeholderTextColor={
                colors.textSecondary
              }
              autoFocus
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
                  fecharModal
                }
                disabled={
                  salvando
                }
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
                  salvarCategoria
                }
                disabled={
                  salvando
                }
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
    alignItems:
      "center",
    marginTop: 10,
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      colors.surface,
    justifyContent:
      "center",
    alignItems:
      "center",
    borderWidth: 1,
    borderColor:
      colors.border,
    marginRight: 12,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  subtitle: {
    fontSize: 13,
    color:
      colors.textSecondary,
    marginTop: 3,
  },

  addButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      colors.primary,
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  searchContainer: {
    backgroundColor:
      colors.surface,
    borderRadius: 16,
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection:
      "row",
    alignItems:
      "center",
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color:
      colors.text,
    fontSize: 14,
    outlineStyle:
      "none",
  } as any,

  resultText: {
    fontSize: 13,
    color:
      colors.textSecondary,
    marginTop: 16,
    marginBottom: 10,
  },

  categoryCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 18,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor:
      colors.border,
    flexDirection:
      "row",
    alignItems:
      "center",
  },

  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      colors.subtleGreen,
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 12,
  },

  categoryContent: {
    flex: 1,
  },

  categoryName: {
    fontSize: 16,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  categoryId: {
    fontSize: 11,
    color:
      colors.textSecondary,
    marginTop: 3,
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      colors.subtleGreen,
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 7,
  },

  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      colors.dangerBackground,
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  emptyCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 18,
    padding: 35,
    alignItems:
      "center",
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  emptyTitle: {
    color:
      colors.text,
    fontSize: 16,
    fontWeight:
      "700",
    marginTop: 13,
  },

  emptyText: {
    color:
      colors.textSecondary,
    fontSize: 13,
    textAlign:
      "center",
    marginTop: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      colors.overlay,
    justifyContent:
      "center",
    alignItems:
      "center",
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
    flexDirection:
      "row",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  modalSubtitle: {
    fontSize: 13,
    color:
      colors.textSecondary,
    marginTop: 4,
  },

  label: {
    fontSize: 13,
    fontWeight:
      "700",
    color:
      colors.text,
    marginBottom: 6,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius: 13,
    paddingHorizontal: 13,
    color:
      colors.text,
    fontSize: 14,
    backgroundColor:
      colors.background,
    outlineStyle:
      "none",
  } as any,

  modalActions: {
    flexDirection:
      "row",
    justifyContent:
      "flex-end",
    gap: 10,
    marginTop: 24,
  },

  cancelButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor:
      colors.background,
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  cancelButtonText: {
    color:
      colors.text,
    fontSize: 13,
    fontWeight:
      "700",
  },

  saveButton: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 13,
    backgroundColor:
      colors.primary,
    flexDirection:
      "row",
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  saveButtonText: {
    color:
      colors.white,
    fontSize: 13,
    fontWeight:
      "700",
    marginLeft: 5,
  },
});
