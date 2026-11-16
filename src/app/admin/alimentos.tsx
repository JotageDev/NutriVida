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


type Alimento = {
  id_alimento: number;
  id_categoria: number;
  nome_categoria: string;
  nome_alimento: string;
  porcao_referencia: number;
  unidade_medida: string;
  calorias_alimento: number;
  proteinas_alimento: number;
  carboidratos_alimento: number;
  gorduras_alimento: number;
  fibras_alimento: number;
  sodio_alimento: number;
};


export default function AlimentosAdmin() {
  const [alimentos, setAlimentos] =
    useState<Alimento[]>([]);

  const [
    alimentosFiltrados,
    setAlimentosFiltrados
  ] = useState<Alimento[]>([]);

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [busca, setBusca] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [modalForm, setModalForm] =
    useState(false);

  const [editando, setEditando] =
    useState<Alimento | null>(null);

  const [salvando, setSalvando] =
    useState(false);


  const [nome, setNome] =
    useState("");

  const [categoria, setCategoria] =
    useState("");

  const [porcao, setPorcao] =
    useState("100");

  const [unidade, setUnidade] =
    useState("g");

  const [calorias, setCalorias] =
    useState("");

  const [proteinas, setProteinas] =
    useState("");

  const [carboidratos, setCarboidratos] =
    useState("");

  const [gorduras, setGorduras] =
    useState("");

  const [fibras, setFibras] =
    useState("");

  const [sodio, setSodio] =
    useState("");


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


  async function carregarDados() {
    try {
      setCarregando(true);

      const [
        respostaAlimentos,
        respostaCategorias
      ] = await Promise.all([
        api.get("/alimentos"),
        api.get("/categorias")
      ]);

      const listaAlimentos =
        respostaAlimentos.data
          .alimentos || [];

      const listaCategorias =
        respostaCategorias.data
          .categorias || [];

      setAlimentos(
        listaAlimentos
      );

      setAlimentosFiltrados(
        listaAlimentos
      );

      setCategorias(
        listaCategorias
      );

    } catch (error: any) {
      console.log(
        "Erro ao carregar alimentos:",
        error.response?.data ||
          error
      );

      mostrarAviso(
        "Erro",
        error.response?.data
          ?.mensagem ||
          "Não foi possível carregar os alimentos."
      );

    } finally {
      setCarregando(false);
    }
  }


  useEffect(() => {
    carregarDados();
  }, []);


  useEffect(() => {
    const texto =
      busca
        .trim()
        .toLowerCase();

    if (!texto) {
      setAlimentosFiltrados(
        alimentos
      );
      return;
    }

    const filtrados =
      alimentos.filter(
        (alimento) =>
          alimento.nome_alimento
            .toLowerCase()
            .includes(texto) ||
          alimento.nome_categoria
            .toLowerCase()
            .includes(texto)
      );

    setAlimentosFiltrados(
      filtrados
    );
  }, [
    busca,
    alimentos
  ]);


  function limparFormulario() {
    setNome("");
    setCategoria("");
    setPorcao("100");
    setUnidade("g");
    setCalorias("");
    setProteinas("");
    setCarboidratos("");
    setGorduras("");
    setFibras("");
    setSodio("");
  }


  function abrirNovo() {
    setEditando(null);
    limparFormulario();
    setModalForm(true);
  }


  function abrirEdicao(
    alimento: Alimento
  ) {
    setEditando(alimento);

    setNome(
      alimento.nome_alimento
    );

    setCategoria(
      String(
        alimento.id_categoria
      )
    );

    setPorcao(
      String(
        alimento.porcao_referencia
      )
    );

    setUnidade(
      alimento.unidade_medida
    );

    setCalorias(
      String(
        alimento.calorias_alimento
      )
    );

    setProteinas(
      String(
        alimento.proteinas_alimento
      )
    );

    setCarboidratos(
      String(
        alimento.carboidratos_alimento
      )
    );

    setGorduras(
      String(
        alimento.gorduras_alimento
      )
    );

    setFibras(
      String(
        alimento.fibras_alimento
      )
    );

    setSodio(
      String(
        alimento.sodio_alimento
      )
    );

    setModalForm(true);
  }


  function fecharFormulario() {
    if (salvando) {
      return;
    }

    setModalForm(false);
    setEditando(null);
    limparFormulario();
  }


  function converterNumero(
    valor: string
  ) {
    if (!valor.trim()) {
      return 0;
    }

    return Number(
      valor.replace(",", ".")
    );
  }


  async function salvarAlimento() {
    if (
      !nome.trim() ||
      !categoria ||
      !porcao.trim() ||
      !unidade.trim()
    ) {
      mostrarAviso(
        "Campos obrigatórios",
        "Preencha nome, categoria, porção e unidade de medida."
      );

      return;
    }

    const dados = {
      id_categoria:
        Number(categoria),

      nome_alimento:
        nome.trim(),

      porcao_referencia:
        converterNumero(
          porcao
        ),

      unidade_medida:
        unidade.trim(),

      calorias_alimento:
        converterNumero(
          calorias
        ),

      proteinas_alimento:
        converterNumero(
          proteinas
        ),

      carboidratos_alimento:
        converterNumero(
          carboidratos
        ),

      gorduras_alimento:
        converterNumero(
          gorduras
        ),

      fibras_alimento:
        converterNumero(
          fibras
        ),

      sodio_alimento:
        converterNumero(
          sodio
        )
    };


    try {
      setSalvando(true);

      if (editando) {
        await api.put(
          `/alimentos/${editando.id_alimento}`,
          dados
        );

        mostrarAviso(
          "Sucesso",
          "Alimento atualizado com sucesso."
        );

      } else {
        await api.post(
          "/alimentos",
          dados
        );

        mostrarAviso(
          "Sucesso",
          "Alimento criado com sucesso."
        );
      }

      fecharFormulario();

      await carregarDados();

    } catch (error: any) {
      console.log(
        "Erro ao salvar alimento:",
        error.response?.data ||
          error
      );

      mostrarAviso(
        "Erro",
        error.response?.data
          ?.mensagem ||
          "Não foi possível salvar o alimento."
      );

    } finally {
      setSalvando(false);
    }
  }


  async function excluirAlimento(
    alimento: Alimento
  ) {
    try {
      await api.delete(
        `/alimentos/${alimento.id_alimento}`
      );

      setAlimentos(
        (lista) =>
          lista.filter(
            (item) =>
              item.id_alimento !==
              alimento.id_alimento
          )
      );

      mostrarAviso(
        "Sucesso",
        "Alimento excluído com sucesso."
      );

    } catch (error: any) {
      console.log(
        "Erro ao excluir alimento:",
        error.response?.data ||
          error
      );

      mostrarAviso(
        "Erro",
        error.response?.data
          ?.mensagem ||
          "Não foi possível excluir o alimento."
      );
    }
  }


  function confirmarExclusao(
    alimento: Alimento
  ) {
    const mensagem =
      `Deseja excluir o alimento "${alimento.nome_alimento}"?`;

    if (
      Platform.OS === "web"
    ) {
      if (
        window.confirm(
          mensagem
        )
      ) {
        excluirAlimento(
          alimento
        );
      }

      return;
    }

    Alert.alert(
      "Excluir alimento",
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
            excluirAlimento(
              alimento
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
          Carregando alimentos...
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
            onPress={
              () => router.replace("/admin" as any)
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
              Alimentos
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Gerencie os alimentos e informações nutricionais
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.addButton
            }
            onPress={
              abrirNovo
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
            placeholder="Pesquisar alimento ou categoria"
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


        <View
          style={
            styles.categoryButtonContainer
          }
        >
          <TouchableOpacity
            style={
              styles.categoryButton
            }
            onPress={() =>
             router.push("./categorias")
            }
          >
            <Ionicons
              name="folder-open-outline"
              size={19}
              color={
                colors.primary
              }
            />

            <Text
              style={
                styles.categoryButtonText
              }
            >
              Gerenciar categorias
            </Text>
          </TouchableOpacity>
        </View>


        <Text
          style={
            styles.resultText
          }
        >
          {alimentosFiltrados.length}{" "}
          {alimentosFiltrados.length === 1
            ? "alimento encontrado"
            : "alimentos encontrados"}
        </Text>


        {/* LISTA */}

        {alimentosFiltrados.length === 0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Ionicons
              name="nutrition-outline"
              size={52}
              color={
                colors.textSecondary
              }
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Nenhum alimento encontrado
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Tente outra pesquisa ou cadastre um novo alimento.
            </Text>
          </View>
        ) : (
          alimentosFiltrados.map(
            (alimento) => (
              <View
                key={
                  alimento.id_alimento
                }
                style={
                  styles.foodCard
                }
              >

                <View
                  style={
                    styles.foodHeader
                  }
                >
                  <View
                    style={
                      styles.foodIcon
                    }
                  >
                    <Ionicons
                      name="nutrition-outline"
                      size={25}
                      color={
                        colors.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.foodInfo
                    }
                  >
                    <Text
                      style={
                        styles.foodName
                      }
                    >
                      {
                        alimento.nome_alimento
                      }
                    </Text>

                    <Text
                      style={
                        styles.categoryText
                      }
                    >
                      {
                        alimento.nome_categoria
                      }
                    </Text>
                  </View>
                </View>


                {/* NUTRIENTES */}

                <View
                  style={
                    styles.nutrientsGrid
                  }
                >
                  <View
                    style={
                      styles.nutrient
                    }
                  >
                    <Text
                      style={
                        styles.nutrientValue
                      }
                    >
                      {
                        alimento.calorias_alimento
                      }
                    </Text>

                    <Text
                      style={
                        styles.nutrientLabel
                      }
                    >
                      kcal
                    </Text>
                  </View>

                  <View
                    style={
                      styles.nutrient
                    }
                  >
                    <Text
                      style={
                        styles.nutrientValue
                      }
                    >
                      {
                        alimento.proteinas_alimento
                      }g
                    </Text>

                    <Text
                      style={
                        styles.nutrientLabel
                      }
                    >
                      proteínas
                    </Text>
                  </View>

                  <View
                    style={
                      styles.nutrient
                    }
                  >
                    <Text
                      style={
                        styles.nutrientValue
                      }
                    >
                      {
                        alimento.carboidratos_alimento
                      }g
                    </Text>

                    <Text
                      style={
                        styles.nutrientLabel
                      }
                    >
                      carboidratos
                    </Text>
                  </View>

                  <View
                    style={
                      styles.nutrient
                    }
                  >
                    <Text
                      style={
                        styles.nutrientValue
                      }
                    >
                      {
                        alimento.gorduras_alimento
                      }g
                    </Text>

                    <Text
                      style={
                        styles.nutrientLabel
                      }
                    >
                      gorduras
                    </Text>
                  </View>
                </View>


                <View
                  style={
                    styles.portion
                  }
                >
                  <Text
                    style={
                      styles.portionText
                    }
                  >
                    Porção de referência:{" "}
                    {
                      alimento.porcao_referencia
                    }{" "}
                    {
                      alimento.unidade_medida
                    }
                  </Text>
                </View>


                {/* AÇÕES */}

                <View
                  style={
                    styles.actions
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.editButton
                    }
                    onPress={() =>
                      abrirEdicao(
                        alimento
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


                  <TouchableOpacity
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      confirmarExclusao(
                        alimento
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

                    <Text
                      style={
                        styles.deleteButtonText
                      }
                    >
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            )
          )
        )}

      </ScrollView>


      {/* MODAL DO FORMULÁRIO */}

      <Modal
        visible={
          modalForm
        }
        transparent
        animationType="fade"
        onRequestClose={
          fecharFormulario
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
                    ? "Editar alimento"
                    : "Novo alimento"}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Informe os dados nutricionais
                </Text>
              </View>

              <TouchableOpacity
                onPress={
                  fecharFormulario
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


            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              style={
                styles.formScroll
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                Nome do alimento *
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
                placeholder="Ex.: Frango grelhado"
                placeholderTextColor={
                  colors.textSecondary
                }
              />


              <Text
                style={
                  styles.label
                }
              >
                Categoria *
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                style={
                  styles.categoryScroll
                }
              >
                {categorias.map(
                  (item) => (
                    <TouchableOpacity
                      key={
                        item.id_categoria
                      }
                      style={[
                        styles.categoryOption,
                        categoria ===
                          String(
                            item.id_categoria
                          ) &&
                          styles.categoryOptionSelected
                      ]}
                      onPress={() =>
                        setCategoria(
                          String(
                            item.id_categoria
                          )
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          categoria ===
                            String(
                              item.id_categoria
                            ) &&
                            styles.categoryOptionTextSelected
                        ]}
                      >
                        {
                          item.nome_categoria
                        }
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>


              <View
                style={
                  styles.row
                }
              >
                <View
                  style={
                    styles.half
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Porção *
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      porcao
                    }
                    onChangeText={
                      setPorcao
                    }
                    keyboardType="decimal-pad"
                    placeholder="100"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.half
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Unidade *
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      unidade
                    }
                    onChangeText={
                      setUnidade
                    }
                    placeholder="g"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                  />
                </View>
              </View>


              <Text
                style={
                  styles.sectionLabel
                }
              >
                Informações nutricionais
              </Text>


              <View
                style={
                  styles.row
                }
              >
                <View
                  style={
                    styles.half
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Calorias (kcal)
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      calorias
                    }
                    onChangeText={
                      setCalorias
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.half
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Proteínas (g)
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      proteinas
                    }
                    onChangeText={
                      setProteinas
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                  />
                </View>
              </View>


              <View
                style={
                  styles.row
                }
              >
                <View
                  style={
                    styles.half
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Carboidratos (g)
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      carboidratos
                    }
                    onChangeText={
                      setCarboidratos
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.half
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Gorduras (g)
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      gorduras
                    }
                    onChangeText={
                      setGorduras
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                  />
                </View>
              </View>


              <View
                style={
                  styles.row
                }
              >
                <View
                  style={
                    styles.half
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Fibras (g)
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      fibras
                    }
                    onChangeText={
                      setFibras
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.half
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Sódio (mg)
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    value={
                      sodio
                    }
                    onChangeText={
                      setSodio
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={
                      colors.textSecondary
                    }
                  />
                </View>
              </View>

            </ScrollView>


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
                  fecharFormulario
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
                  salvarAlimento
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

  categoryButtonContainer: {
    marginTop: 12,
  },

  categoryButton: {
    minHeight: 44,
    borderRadius: 13,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    flexDirection:
      "row",
    alignItems:
      "center",
    justifyContent:
      "center",
  },

  categoryButtonText: {
    color:
      colors.primary,
    fontSize: 13,
    fontWeight:
      "700",
    marginLeft: 7,
  },

  resultText: {
    fontSize: 13,
    color:
      colors.textSecondary,
    marginTop: 16,
    marginBottom: 10,
  },

  foodCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  foodHeader: {
    flexDirection:
      "row",
    alignItems:
      "center",
  },

  foodIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor:
      colors.subtleGreen,
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 12,
  },

  foodInfo: {
    flex: 1,
  },

  foodName: {
    fontSize: 17,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  categoryText: {
    fontSize: 12,
    color:
      colors.primary,
    marginTop: 4,
  },

  nutrientsGrid: {
    flexDirection:
      "row",
    flexWrap:
      "wrap",
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor:
      colors.border,
  },

  nutrient: {
    width: "25%",
    alignItems:
      "center",
  },

  nutrientValue: {
    fontSize: 14,
    fontWeight:
      "700",
    color:
      colors.text,
  },

  nutrientLabel: {
    fontSize: 10,
    color:
      colors.textSecondary,
    marginTop: 3,
    textAlign:
      "center",
  },

  portion: {
    marginTop: 12,
  },

  portionText: {
    fontSize: 11,
    color:
      colors.textSecondary,
  },

  actions: {
    flexDirection:
      "row",
    marginTop: 13,
    gap: 8,
  },

  editButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 11,
    backgroundColor:
      colors.subtleGreen,
    flexDirection:
      "row",
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  editButtonText: {
    color:
      colors.primary,
    fontSize: 12,
    fontWeight:
      "700",
    marginLeft: 5,
  },

  deleteButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 11,
    backgroundColor:
      colors.dangerBackground,
    flexDirection:
      "row",
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  deleteButtonText: {
    color:
      colors.danger,
    fontSize: 12,
    fontWeight:
      "700",
    marginLeft: 5,
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
    maxWidth: 600,
    maxHeight: "92%",
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
    marginBottom: 15,
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

  formScroll: {
    maxHeight: 560,
  },

  label: {
    fontSize: 12,
    fontWeight:
      "700",
    color:
      colors.text,
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color:
      colors.text,
    fontSize: 14,
    backgroundColor:
      colors.background,
    outlineStyle:
      "none",
  } as any,

  categoryScroll: {
    marginBottom: 5,
  },

  categoryOption: {
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginRight: 7,
    backgroundColor:
      colors.background,
  },

  categoryOptionSelected: {
    backgroundColor:
      colors.primary,
    borderColor:
      colors.primary,
  },

  categoryOptionText: {
    fontSize: 12,
    color:
      colors.text,
  },

  categoryOptionTextSelected: {
    color:
      colors.white,
    fontWeight:
      "700",
  },

  row: {
    flexDirection:
      "row",
    gap: 10,
  },

  half: {
    flex: 1,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight:
      "700",
    color:
      colors.text,
    marginTop: 20,
    marginBottom: 4,
  },

  modalActions: {
    flexDirection:
      "row",
    justifyContent:
      "flex-end",
    gap: 10,
    marginTop: 18,
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