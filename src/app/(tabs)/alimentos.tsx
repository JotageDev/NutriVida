
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import colors from "../../constants/colors";
import { listarAlimentos } from "../../services/foodService";
import { Food } from "../../types/Food";

export default function Alimentos() {
  const [busca, setBusca] = useState("");
  const [alimentos, setAlimentos] = useState<Food[]>([]);
  const [selecionado, setSelecionado] = useState<Food | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarAlimentos = useCallback(async (termo = "") => {
    try {
      setErro("");

      const resultado = await listarAlimentos(termo);
      setAlimentos(resultado);
    } catch (error: any) {
      console.error("Erro ao carregar alimentos:", error);

      setErro(
        error.response?.data?.mensagem ||
        "Não foi possível carregar os alimentos. Verifique sua conexão com o servidor."
      );

      setAlimentos([]);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    setCarregando(true);

    const temporizador = setTimeout(() => {
      carregarAlimentos(busca.trim());
    }, busca ? 350 : 0);

    return () => clearTimeout(temporizador);
  }, [busca, carregarAlimentos]);

  function atualizarLista() {
    setAtualizando(true);
    carregarAlimentos(busca.trim());
  }

  function formatarNumero(valor: number | string | null | undefined) {
    const numero = Number(valor ?? 0);

    if (!Number.isFinite(numero)) return "0";

    return numero.toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    });
  }

  function Nutriente({
    rotulo,
    valor,
    unidade,
  }: {
    rotulo: string;
    valor: number | string;
    unidade: string;
  }) {
    return (
      <View style={styles.nutriente}>
        <Text style={styles.nutrienteValor}>
          {formatarNumero(valor)}
          <Text style={styles.nutrienteUnidade}> {unidade}</Text>
        </Text>

        <Text style={styles.nutrienteRotulo}>
          {rotulo}
        </Text>
      </View>
    );
  }

  function renderItem({ item }: { item: Food }) {
    return (
      <Pressable
        style={styles.foodCard}
        onPress={() => setSelecionado(item)}
      >
        <View style={styles.foodIcon}>
          <Ionicons
            name="nutrition-outline"
            size={24}
            color={colors.primary}
          />
        </View>

        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>
            {item.nome_alimento}
          </Text>

          <Text style={styles.foodCategory}>
            {item.nome_categoria || "Sem categoria"}
          </Text>

          <Text style={styles.foodServing}>
            Porção de referência: {formatarNumero(item.porcao_referencia)}{" "}
            {item.unidade_medida}
          </Text>
        </View>

        <View style={styles.calories}>
          <Text style={styles.caloriesValue}>
            {formatarNumero(item.calorias_alimento)}
          </Text>

          <Text style={styles.caloriesLabel}>
            kcal
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={19}
          color="#9AA39D"
        />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alimentos</Text>

        <Text style={styles.subtitle}>
          Pesquise alimentos e consulte suas informações nutricionais.
        </Text>
      </View>

      {/* BARRA DE PESQUISA */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={21}
          color={colors.textSecondary}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar alimento..."
          placeholderTextColor={colors.textSecondary}
          value={busca}
          onChangeText={setBusca}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />

        {busca.length > 0 && (
          <Pressable onPress={() => setBusca("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color="#9AA39D"
            />
          </Pressable>
        )}
      </View>

      {/* CABEÇALHO DA LISTA */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          {busca.trim() ? "Resultado da pesquisa" : "Todos os alimentos"}
        </Text>

        {!carregando && (
          <Text style={styles.resultCount}>
            {alimentos.length} {alimentos.length === 1 ? "item" : "itens"}
          </Text>
        )}
      </View>

      {/* LISTAGEM */}
      {carregando ? (
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.stateText}>
            Carregando alimentos...
          </Text>
        </View>
      ) : erro ? (
        <View style={styles.centerState}>
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color="#9AA39D"
          />

          <Text style={styles.stateTitle}>
            Não foi possível carregar
          </Text>

          <Text style={styles.stateText}>
            {erro}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={atualizarLista}
          >
            <Text style={styles.retryText}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={alimentos}
          keyExtractor={(item) => String(item.id_alimento)}
          renderItem={renderItem}
          contentContainerStyle={
            alimentos.length === 0
              ? styles.emptyList
              : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizarLista}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Ionicons
                name="search-outline"
                size={42}
                color="#9AA39D"
              />

              <Text style={styles.stateTitle}>
                Nenhum alimento encontrado
              </Text>

              <Text style={styles.stateText}>
                {busca.trim()
                  ? "Tente pesquisar por outro nome."
                  : "Ainda não há alimentos cadastrados no banco de dados."}
              </Text>
            </View>
          }
        />
      )}

      {/* JANELA DE INFORMAÇÕES NUTRICIONAIS */}
      <Modal
        visible={selecionado !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelecionado(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelecionado(null)}
          />

          {selecionado && (
            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View style={styles.modalTitleArea}>
                  <Text style={styles.modalTitle}>
                    {selecionado.nome_alimento}
                  </Text>

                  <Text style={styles.modalCategory}>
                    {selecionado.nome_categoria || "Sem categoria"}
                  </Text>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setSelecionado(null)}
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color={colors.text}
                  />
                </Pressable>
              </View>

              {/* PORÇÃO */}
              <View style={styles.servingBox}>
                <Ionicons
                  name="scale-outline"
                  size={19}
                  color={colors.primary}
                />

                <Text style={styles.servingText}>
                  Valores por {formatarNumero(selecionado.porcao_referencia)}{" "}
                  {selecionado.unidade_medida}
                </Text>
              </View>

              {/* CALORIAS */}
              <View style={styles.calorieBox}>
                <Text style={styles.calorieNumber}>
                  {formatarNumero(selecionado.calorias_alimento)}
                </Text>

                <Text style={styles.calorieUnit}>
                  kcal
                </Text>

                <Text style={styles.calorieCaption}>
                  Valor energético
                </Text>
              </View>

              {/* NUTRIENTES */}
              <Text style={styles.nutritionTitle}>
                Informações nutricionais
              </Text>

              <View style={styles.nutritionGrid}>
                <Nutriente
                  rotulo="Proteínas"
                  valor={selecionado.proteinas_alimento}
                  unidade="g"
                />

                <Nutriente
                  rotulo="Carboidratos"
                  valor={selecionado.carboidratos_alimento}
                  unidade="g"
                />

                <Nutriente
                  rotulo="Gorduras"
                  valor={selecionado.gorduras_alimento}
                  unidade="g"
                />

                <Nutriente
                  rotulo="Fibras"
                  valor={selecionado.fibras_alimento}
                  unidade="g"
                />

                <Nutriente
                  rotulo="Sódio"
                  valor={selecionado.sodio_alimento}
                  unidade="mg"
                />
              </View>

              <Pressable
                style={styles.doneButton}
                onPress={() => setSelecionado(null)}
              >
                <Text style={styles.doneButtonText}>
                  Fechar
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#26352B",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  searchContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    marginBottom: 23,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#26352B",
  },

  resultCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  listContent: {
    paddingBottom: 30,
  },

  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 13,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#EDF0EA",
  },

  foodIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: colors.subtleGreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  foodInfo: {
    flex: 1,
  },

  foodName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#26352B",
  },

  foodCategory: {
    marginTop: 3,
    fontSize: 12,
    color: colors.primaryDark,
  },

  foodServing: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textSecondary,
  },

  calories: {
    alignItems: "flex-end",
    marginRight: 9,
  },

  caloriesValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  caloriesLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingBottom: 50,
  },

  stateTitle: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  stateText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 17,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },

  retryText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },

  emptyList: {
    flexGrow: 1,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(22, 35, 25, 0.48)",
  },

  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,
  },

  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9DED8",
    alignSelf: "center",
    marginBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  modalTitleArea: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#26352B",
  },

  modalCategory: {
    marginTop: 4,
    fontSize: 13,
    color: colors.primaryDark,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#F1F4F0",
    alignItems: "center",
    justifyContent: "center",
  },

  servingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.subtleGreen,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  servingText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: colors.primaryDark,
  },

  calorieBox: {
    backgroundColor: "#F7FAF5",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 17,
    marginBottom: 21,
  },

  calorieNumber: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  calorieUnit: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  calorieCaption: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textSecondary,
  },

  nutritionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },

  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },

  nutriente: {
    width: "50%",
    minHeight: 72,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  nutrienteValor: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  nutrienteUnidade: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  nutrienteRotulo: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },

  doneButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },

  doneButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
