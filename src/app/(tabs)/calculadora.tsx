
import React, { useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import colors from "../../constants/colors";

type Alimento = {
  id_alimento: number;
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

type LinhaAlimento = {
  id: number;
  alimento: Alimento | null;
  busca: string;
  quantidade: string;
  resultados: Alimento[];
  buscando: boolean;
};

type Nutrientes = {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
  sodio: number;
};

const TIPOS_REFEICAO = [
  { label: "Café da manhã", value: "CAFE_DA_MANHA" },
  { label: "Almoço", value: "ALMOCO" },
  { label: "Lanche", value: "LANCHE" },
  { label: "Jantar", value: "JANTAR" },
  { label: "Ceia", value: "CEIA" },
  { label: "Outro", value: "OUTRO" },
];

function criarLinha(): LinhaAlimento {
  return {
    id: Date.now() + Math.random(),
    alimento: null,
    busca: "",
    quantidade: "",
    resultados: [],
    buscando: false,
  };
}

function numero(valor: any): number {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : 0;
}

function calcularNutrientes(
  alimento: Alimento,
  quantidade: number
): Nutrientes {
  const porcao = numero(alimento.porcao_referencia);

  if (porcao <= 0 || quantidade <= 0) {
    return {
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
      fibras: 0,
      sodio: 0,
    };
  }

  const fator = quantidade / porcao;

  return {
    calorias: numero(alimento.calorias_alimento) * fator,
    proteinas: numero(alimento.proteinas_alimento) * fator,
    carboidratos: numero(alimento.carboidratos_alimento) * fator,
    gorduras: numero(alimento.gorduras_alimento) * fator,
    fibras: numero(alimento.fibras_alimento) * fator,
    sodio: numero(alimento.sodio_alimento) * fator,
  };
}

function formatar(valor: number, casas = 1) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export default function Calculadora() {
  const [tipoRefeicao, setTipoRefeicao] = useState("");
  const [mostrarTipos, setMostrarTipos] = useState(false);

  const [linhas, setLinhas] = useState<LinhaAlimento[]>([
    criarLinha(),
  ]);

  const [salvando, setSalvando] = useState(false);

  function atualizarLinha(
    id: number,
    alteracoes: Partial<LinhaAlimento>
  ) {
    setLinhas((atuais) =>
      atuais.map((linha) =>
        linha.id === id
          ? { ...linha, ...alteracoes }
          : linha
      )
    );
  }

  useEffect(() => {
    const linhaAtiva = linhas.find(
      (linha) =>
        !linha.alimento &&
        linha.busca.trim().length >= 2
    );

    if (!linhaAtiva) return;

    let cancelado = false;

    const timer = setTimeout(async () => {
      try {
        atualizarLinha(linhaAtiva.id, {
          buscando: true,
        });

        const resposta = await api.get("/alimentos", {
          params: {
            busca: linhaAtiva.busca.trim(),
          },
        });

        if (cancelado) return;

        const lista: Alimento[] = Array.isArray(
          resposta.data
        )
          ? resposta.data
          : resposta.data.alimentos || [];

        const selecionados = linhas
          .filter((linha) => linha.alimento)
          .map((linha) => linha.alimento!.id_alimento);

        const filtrados = lista.filter(
          (alimento) =>
            alimento.unidade_medida === "g" &&
            !selecionados.includes(alimento.id_alimento)
        );

        atualizarLinha(linhaAtiva.id, {
          resultados: filtrados,
          buscando: false,
        });
      } catch (error) {
        if (!cancelado) {
          atualizarLinha(linhaAtiva.id, {
            resultados: [],
            buscando: false,
          });
        }
      }
    }, 350);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [
    linhas.map((linha) =>
      `${linha.id}:${linha.busca}:${linha.alimento?.id_alimento || ""}`
    ).join("|"),
  ]);

  function selecionarAlimento(
    id: number,
    alimento: Alimento
  ) {
    atualizarLinha(id, {
      alimento,
      busca: alimento.nome_alimento,
      resultados: [],
      buscando: false,
    });

    Keyboard.dismiss();
  }

  function adicionarLinha() {
    setLinhas((atuais) => [
      ...atuais,
      criarLinha(),
    ]);
  }

  function removerLinha(id: number) {
    setLinhas((atuais) =>
      atuais.filter((linha) => linha.id !== id)
    );
  }

  const totais = useMemo(() => {
    const resultado: Nutrientes = {
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
      fibras: 0,
      sodio: 0,
    };

    linhas.forEach((linha) => {
      if (!linha.alimento) return;

      const quantidade = Number(
        linha.quantidade.replace(",", ".")
      );

      if (!Number.isFinite(quantidade)) return;

      const nutrientes = calcularNutrientes(
        linha.alimento,
        quantidade
      );

      resultado.calorias += nutrientes.calorias;
      resultado.proteinas += nutrientes.proteinas;
      resultado.carboidratos += nutrientes.carboidratos;
      resultado.gorduras += nutrientes.gorduras;
      resultado.fibras += nutrientes.fibras;
      resultado.sodio += nutrientes.sodio;
    });

    return resultado;
  }, [linhas]);

  async function registrarRefeicao() {
    if (!tipoRefeicao) {
      Alert.alert(
        "Tipo de refeição",
        "Selecione o tipo da refeição."
      );
      return;
    }

    if (
      linhas.length === 0 ||
      linhas.some((linha) => !linha.alimento)
    ) {
      Alert.alert(
        "Alimentos",
        "Selecione um alimento em cada linha."
      );
      return;
    }

    const invalidas = linhas.some((linha) => {
      const quantidade = Number(
        linha.quantidade.replace(",", ".")
      );

      return (
        !Number.isFinite(quantidade) ||
        quantidade <= 0
      );
    });

    if (invalidas) {
      Alert.alert(
        "Quantidade inválida",
        "Informe uma quantidade em gramas maior que zero para cada alimento."
      );
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        tipo_refeicao: tipoRefeicao,
        itens: linhas.map((linha) => ({
          id_alimento: linha.alimento!.id_alimento,
          quantidade_consumo: Number(
            linha.quantidade.replace(",", ".")
          ),
        })),
      };

      await api.post("/refeicoes", payload);

      Alert.alert(
        "Refeição registrada!",
        "Sua refeição foi salva com sucesso no NutriVida."
      );

      setTipoRefeicao("");
      setLinhas([criarLinha()]);
      setMostrarTipos(false);
    } catch (error: any) {
      Alert.alert(
        "Erro ao registrar",
        error.response?.data?.mensagem ||
          "Não foi possível salvar sua refeição."
      );
    } finally {
      setSalvando(false);
    }
  }

  function CardNutriente({
    titulo,
    valor,
    unidade,
    icone,
  }: {
    titulo: string;
    valor: number;
    unidade: string;
    icone: keyof typeof Ionicons.glyphMap;
  }) {
    return (
      <View style={styles.nutrientCard}>
        <Ionicons
          name={icone}
          size={21}
          color={colors.primary}
        />

        <Text style={styles.nutrientValue}>
          {formatar(valor)} {unidade}
        </Text>

        <Text style={styles.nutrientLabel}>
          {titulo}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Calculadora de refeição
        </Text>

        <Text style={styles.subtitle}>
          Monte sua refeição e acompanhe seus nutrientes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Tipo de refeição
        </Text>

        <TouchableOpacity
          style={styles.select}
          onPress={() => setMostrarTipos(!mostrarTipos)}
        >
          <Text
            style={[
              styles.selectText,
              !tipoRefeicao && styles.placeholder,
            ]}
          >
            {TIPOS_REFEICAO.find(
              (tipo) => tipo.value === tipoRefeicao
            )?.label || "Selecione uma refeição"}
          </Text>

          <Ionicons
            name={mostrarTipos ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {mostrarTipos && (
          <View style={styles.options}>
            {TIPOS_REFEICAO.map((tipo) => (
              <TouchableOpacity
                key={tipo.value}
                style={styles.option}
                onPress={() => {
                  setTipoRefeicao(tipo.value);
                  setMostrarTipos(false);
                }}
              >
                <Text style={styles.optionText}>
                  {tipo.label}
                </Text>

                {tipoRefeicao === tipo.value && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            Alimentos
          </Text>

          <Text style={styles.hint}>
            Quantidade em gramas
          </Text>
        </View>

        {linhas.map((linha, index) => (
          <View
            key={linha.id}
            style={styles.foodCard}
          >
            <View style={styles.foodCardHeader}>
              <Text style={styles.foodNumber}>
                Alimento {index + 1}
              </Text>

              {linhas.length > 1 && (
                <TouchableOpacity
                  onPress={() => removerLinha(linha.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar alimento do banco"
                placeholderTextColor={colors.textSecondary}
                value={linha.busca}
                onChangeText={(texto) =>
                  atualizarLinha(linha.id, {
                    busca: texto,
                    alimento: null,
                    resultados: [],
                  })
                }
              />

              {linha.buscando && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                />
              )}

              {linha.alimento && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </View>

            {linha.resultados.length > 0 && (
              <View style={styles.results}>
                {linha.resultados.map((alimento) => (
                  <TouchableOpacity
                    key={alimento.id_alimento}
                    style={styles.resultItem}
                    onPress={() =>
                      selecionarAlimento(linha.id, alimento)
                    }
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName}>
                        {alimento.nome_alimento}
                      </Text>

                      <Text style={styles.resultInfo}>
                        {formatar(
                          numero(alimento.calorias_alimento),
                          0
                        )} kcal por {alimento.porcao_referencia} g
                      </Text>
                    </View>

                    <Ionicons
                      name="add-circle-outline"
                      size={23}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {linha.alimento && (
              <View style={styles.selectedFood}>
                <Text style={styles.selectedFoodName}>
                  {linha.alimento.nome_alimento}
                </Text>

                <Text style={styles.selectedFoodInfo}>
                  Referência nutricional:{" "}
                  {linha.alimento.porcao_referencia} g
                </Text>
              </View>
            )}

            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>
                Quantidade consumida
              </Text>

              <View style={styles.quantityBox}>
                <TextInput
                  style={styles.quantityInput}
                  placeholder="Digite os gramas"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  inputMode="decimal"
                  value={linha.quantidade}
                  editable={true}
                  selectTextOnFocus={true}
                  onChangeText={(texto) =>
                    atualizarLinha(linha.id, {
                      quantidade: texto.replace(/[^0-9,.]/g, ""),
                    })
                  }
                />

                <Text style={styles.unit}>g</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={adicionarLinha}
        >
          <Ionicons
            name="add-circle"
            size={24}
            color={colors.primary}
          />

          <Text style={styles.addButtonText}>
            Adicionar outro alimento
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Resultado nutricional
        </Text>

        <View style={styles.caloriesCard}>
          <Ionicons
            name="flame-outline"
            size={28}
            color={colors.primary}
          />

          <View>
            <Text style={styles.caloriesLabel}>
              Calorias totais
            </Text>

            <Text style={styles.caloriesValue}>
              {formatar(totais.calorias, 0)} kcal
            </Text>
          </View>
        </View>

        <View style={styles.nutrientsGrid}>
          <CardNutriente
            titulo="Proteínas"
            valor={totais.proteinas}
            unidade="g"
            icone="fitness-outline"
          />

          <CardNutriente
            titulo="Carboidratos"
            valor={totais.carboidratos}
            unidade="g"
            icone="leaf-outline"
          />

          <CardNutriente
            titulo="Gorduras"
            valor={totais.gorduras}
            unidade="g"
            icone="water-outline"
          />

          <CardNutriente
            titulo="Fibras"
            valor={totais.fibras}
            unidade="g"
            icone="nutrition-outline"
          />

          <CardNutriente
            titulo="Sódio"
            valor={totais.sodio}
            unidade="mg"
            icone="alert-circle-outline"
          />
        </View>

        <Text style={styles.calculationNote}>
          Os valores são calculados proporcionalmente à porção
          de referência cadastrada para cada alimento.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.registerButton,
          salvando && styles.disabledButton,
        ]}
        onPress={registrarRefeicao}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.registerButtonText}>
              Registrar refeição
            </Text>

            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#FFFFFF"
            />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 7,
    lineHeight: 20,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },

  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },

  select: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectText: {
    color: colors.text,
    fontSize: 14,
  },

  placeholder: {
    color: colors.textSecondary,
  },

  options: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 7,
    overflow: "hidden",
  },

  option: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  optionText: {
    color: colors.text,
    fontSize: 14,
  },

  foodCard: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 13,
  },

  foodCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  foodNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  searchBox: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    paddingVertical: 10,
  },

  results: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 7,
    overflow: "hidden",
  },

  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  resultName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  resultInfo: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },

  selectedFood: {
    marginTop: 9,
    padding: 10,
    backgroundColor: colors.subtleGreen,
    borderRadius: 10,
  },

  selectedFoodName: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
  },

  selectedFoodInfo: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  quantityRow: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  quantityLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    flexShrink: 1,
  },

  quantityBox: {
    width: 145,
    height: 48,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 11,
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  quantityInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    color: colors.text,
    textAlign: "right",
    fontSize: 16,
    paddingHorizontal: 4,
    paddingVertical: 0,
  },

  unit: {
    color: colors.textSecondary,
    marginLeft: 5,
    fontSize: 13,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 4,
  },

  addButtonText: {
    color: colors.primaryDark,
    fontWeight: "700",
    fontSize: 14,
  },

  caloriesCard: {
    backgroundColor: colors.subtleGreen,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },

  caloriesLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  caloriesValue: {
    color: colors.primaryDark,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 3,
  },

  nutrientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  nutrientCard: {
    width: "48%",
    minHeight: 91,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },

  nutrientValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 7,
  },

  nutrientLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  calculationNote: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
  },

  registerButton: {
    minHeight: 55,
    backgroundColor: colors.primary,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },
});
