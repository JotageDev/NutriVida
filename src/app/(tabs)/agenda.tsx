
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import api from "../../services/api";
import colors from "../../constants/colors";

type Task = {
  id_tarefa: number;
  nome_tarefa: string;
  descricao_tarefa: string | null;
  data_tarefa: string;
  horario_tarefa: string | null;
  status_tarefa: "PENDENTE" | "CONCLUIDA" | "CANCELADA";
};

export default function Agenda() {
  const [tarefas, setTarefas] = useState<Task[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<Task | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(new Date());
  const [horario, setHorario] = useState(new Date());

  const [mostrarData, setMostrarData] = useState(false);
  const [mostrarHorario, setMostrarHorario] = useState(false);

  // Formata a data para YYYY-MM-DD
  function formatarData(valor: Date) {
    const ano = valor.getFullYear();
    const mes = String(valor.getMonth() + 1).padStart(2, "0");
    const dia = String(valor.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  // Formata o horário para HH:MM
  function formatarHorario(valor: Date) {
    const hora = String(valor.getHours()).padStart(2, "0");
    const minuto = String(valor.getMinutes()).padStart(2, "0");

    return `${hora}:${minuto}`;
  }

  // Converte YYYY-MM-DD para uma data local
  function converterData(valor: string) {
    const dataTexto = valor.substring(0, 10);
    const [ano, mes, dia] = dataTexto.split("-").map(Number);

    return new Date(ano, mes - 1, dia);
  }

  // Carrega as tarefas do usuário
  async function carregarTarefas() {
    try {
      const resposta = await api.get("/tarefas");
      setTarefas(resposta.data.tarefas || []);
    } catch (error: any) {
      console.log(
        "Erro ao carregar tarefas:",
        error.response?.data || error
      );

      Alert.alert(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível carregar suas tarefas."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTarefas();
  }, []);

  // Abre o formulário para cadastrar ou editar
  function abrirModal(tarefa?: Task) {
    setMostrarData(false);
    setMostrarHorario(false);
    setTarefaEditando(tarefa || null);

    if (tarefa) {
      setNome(tarefa.nome_tarefa);
      setDescricao(tarefa.descricao_tarefa || "");
      setData(converterData(tarefa.data_tarefa));

      const [hora, minuto] = (
        tarefa.horario_tarefa || "12:00"
      )
        .slice(0, 5)
        .split(":")
        .map(Number);

      const novoHorario = new Date();
      novoHorario.setHours(hora, minuto, 0, 0);
      setHorario(novoHorario);
    } else {
      setNome("");
      setDescricao("");
      setData(new Date());

      const novoHorario = new Date();
      novoHorario.setHours(12, 0, 0, 0);
      setHorario(novoHorario);
    }

    setModalVisivel(true);
  }

  // Fecha o formulário
  function fecharModal() {
    setModalVisivel(false);
    setTarefaEditando(null);
    setMostrarData(false);
    setMostrarHorario(false);
  }

  // Salva uma tarefa nova ou atualiza uma existente
  async function salvarTarefa() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome da tarefa.");
      return;
    }

    try {
      setSalvando(true);

      const dados = {
        nome_tarefa: nome.trim(),
        descricao_tarefa: descricao.trim(),
        data_tarefa: formatarData(data),
        horario_tarefa: formatarHorario(horario),
      };

      if (tarefaEditando) {
        await api.patch(
          `/tarefas/${tarefaEditando.id_tarefa}`,
          dados
        );
      } else {
        await api.post("/tarefas", dados);
      }

      fecharModal();
      await carregarTarefas();

      Alert.alert(
        "Sucesso",
        tarefaEditando
          ? "Tarefa atualizada com sucesso!"
          : "Tarefa cadastrada com sucesso!"
      );
    } catch (error: any) {
      console.log(
        "Erro ao salvar tarefa:",
        error.response?.data || error
      );

      Alert.alert(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível salvar a tarefa."
      );
    } finally {
      setSalvando(false);
    }
  }

  // Altera o status da tarefa
  async function alterarStatus(tarefa: Task) {
    const novoStatus =
      tarefa.status_tarefa === "CONCLUIDA"
        ? "PENDENTE"
        : "CONCLUIDA";

    try {
      await api.patch(`/tarefas/${tarefa.id_tarefa}/status`, {
        status_tarefa: novoStatus,
      });

      setTarefas((anteriores) =>
        anteriores.map((item) =>
          item.id_tarefa === tarefa.id_tarefa
            ? { ...item, status_tarefa: novoStatus }
            : item
        )
      );
    } catch (error: any) {
      console.log(
        "Erro ao alterar status:",
        error.response?.data || error
      );

      Alert.alert(
        "Erro",
        error.response?.data?.mensagem ||
          "Não foi possível atualizar a tarefa."
      );
    }
  }

  // Exclui uma tarefa após confirmação
  function confirmarExclusao(id: number) {
    Alert.alert(
      "Excluir tarefa",
      "Tem certeza de que deseja excluir esta tarefa?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/tarefas/${id}`);

              setTarefas((anteriores) =>
                anteriores.filter(
                  (tarefa) => tarefa.id_tarefa !== id
                )
              );

              Alert.alert(
                "Sucesso",
                "Tarefa excluída com sucesso!"
              );
            } catch (error: any) {
              console.log(
                "Erro ao excluir:",
                error.response?.data || error
              );

              Alert.alert(
                "Erro ao excluir",
                error.response?.data?.mensagem ||
                  "Não foi possível excluir a tarefa."
              );
            }
          },
        },
      ]
    );
  }

  // Formata a data para exibição
  function exibirData(valor: string) {
    const dataConvertida = converterData(valor);

    return dataConvertida.toLocaleDateString("pt-BR");
  }

  // Formata o horário para exibição
  function exibirHorario(valor: string | null) {
    if (!valor) return "Sem horário";

    return valor.slice(0, 5);
  }

  // Verifica se uma tarefa já foi concluída
  function tarefaConcluida(tarefa: Task) {
    return tarefa.status_tarefa === "CONCLUIDA";
  }

  const pendentes = tarefas.filter(
    (tarefa) => tarefa.status_tarefa === "PENDENTE"
  ).length;

  const concluidas = tarefas.filter(
    (tarefa) => tarefa.status_tarefa === "CONCLUIDA"
  ).length;

  // Renderiza cada tarefa
  function renderizarTarefa({ item }: { item: Task }) {
    const concluida = tarefaConcluida(item);

    return (
      <View style={styles.taskCard}>
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => alterarStatus(item)}
        >
          <Ionicons
            name={
              concluida
                ? "checkmark-circle"
                : "ellipse-outline"
            }
            size={25}
            color={
              concluida ? colors.primary : colors.textSecondary
            }
          />
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskName,
              concluida && styles.taskCompleted,
            ]}
          >
            {item.nome_tarefa}
          </Text>

          {item.descricao_tarefa ? (
            <Text style={styles.taskDescription}>
              {item.descricao_tarefa}
            </Text>
          ) : null}

          <View style={styles.taskInfo}>
            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>
                {exibirData(item.data_tarefa)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>
                {exibirHorario(item.horario_tarefa)}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.statusText,
              concluida
                ? styles.statusCompleted
                : styles.statusPending,
            ]}
          >
            {concluida ? "Concluída" : "Pendente"}
          </Text>
        </View>

        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => abrirModal(item)}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => confirmarExclusao(item.id_tarefa)}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={colors.danger}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Minha agenda</Text>
            <Text style={styles.headerSubtitle}>
              Organize suas tarefas e compromissos
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="calendar"
              size={26}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Resumo das tarefas */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconPending}>
              <Ionicons
                name="time-outline"
                size={22}
                color="#E69A27"
              />
            </View>

            <Text style={styles.summaryNumber}>
              {pendentes}
            </Text>
            <Text style={styles.summaryLabel}>Pendentes</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconCompleted}>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.summaryNumber}>
              {concluidas}
            </Text>
            <Text style={styles.summaryLabel}>Concluídas</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconTotal}>
              <Ionicons
                name="list-outline"
                size={22}
                color="#5686C5"
              />
            </View>

            <Text style={styles.summaryNumber}>
              {tarefas.length}
            </Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>

        {/* Título da lista */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Minhas tarefas</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => abrirModal()}
          >
            <Ionicons
              name="add"
              size={21}
              color={colors.white}
            />
            <Text style={styles.addButtonText}>Nova tarefa</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de tarefas */}
        {carregando ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loading}
          />
        ) : tarefas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={55}
              color={colors.textSecondary}
            />

            <Text style={styles.emptyTitle}>
              Nenhuma tarefa cadastrada
            </Text>

            <Text style={styles.emptyText}>
              Adicione sua primeira tarefa para começar a
              organizar sua rotina.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => abrirModal()}
            >
              <Text style={styles.emptyButtonText}>
                Adicionar tarefa
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={tarefas}
            renderItem={renderizarTarefa}
            keyExtractor={(item) => String(item.id_tarefa)}
            scrollEnabled={false}
            contentContainerStyle={styles.taskList}
          />
        )}
      </ScrollView>

      {/* Modal de cadastro e edição */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {tarefaEditando
                  ? "Editar tarefa"
                  : "Nova tarefa"}
              </Text>

              <TouchableOpacity onPress={fecharModal}>
                <Ionicons
                  name="close"
                  size={25}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>
                Nome da tarefa
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Ex: Estudar programação"
                placeholderTextColor={colors.textSecondary}
                value={nome}
                onChangeText={setNome}
                maxLength={100}
              />

              <Text style={styles.inputLabel}>
                Descrição (opcional)
              </Text>

              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Adicione uma descrição..."
                placeholderTextColor={colors.textSecondary}
                value={descricao}
                onChangeText={setDescricao}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />

              <Text style={styles.inputLabel}>Data</Text>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setMostrarHorario(false);
                  setMostrarData(true);
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />

                <Text style={styles.dateButtonText}>
                  {data.toLocaleDateString("pt-BR")}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {mostrarData && (
                <DateTimePicker
                  value={data}
                  mode="date"
                  display={
                    Platform.OS === "ios" ? "spinner" : "default"
                  }
                  minimumDate={new Date(2000, 0, 1)}
                  onChange={(
                    event: DateTimePickerEvent,
                    selectedDate?: Date
                  ) => {
                    if (Platform.OS === "android") {
                      setMostrarData(false);
                    }

                    if (selectedDate) {
                      setData(selectedDate);
                    }
                  }}
                />
              )}

              {mostrarData && Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.pickerDone}
                  onPress={() => setMostrarData(false)}
                >
                  <Text style={styles.pickerDoneText}>
                    Confirmar data
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.inputLabel}>Horário</Text>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setMostrarData(false);
                  setMostrarHorario(true);
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={colors.primary}
                />

                <Text style={styles.dateButtonText}>
                  {formatarHorario(horario)}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {mostrarHorario && (
                <DateTimePicker
                  value={horario}
                  mode="time"
                  is24Hour
                  display={
                    Platform.OS === "ios" ? "spinner" : "default"
                  }
                  onChange={(
                    event: DateTimePickerEvent,
                    selectedTime?: Date
                  ) => {
                    if (Platform.OS === "android") {
                      setMostrarHorario(false);
                    }

                    if (selectedTime) {
                      setHorario(selectedTime);
                    }
                  }}
                />
              )}

              {mostrarHorario && Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.pickerDone}
                  onPress={() => setMostrarHorario(false)}
                >
                  <Text style={styles.pickerDoneText}>
                    Confirmar horário
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={fecharModal}
                  disabled={salvando}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={salvarTarefa}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {tarefaEditando
                        ? "Salvar alterações"
                        : "Salvar tarefa"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
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
    alignItems: "center",
    justifyContent: "center",
  },

  summaryContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 13,
    alignItems: "center",
    elevation: 2,
  },

  summaryIconPending: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFF4E1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  summaryIconCompleted: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.subtleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  summaryIconTotal: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EAF1FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  summaryNumber: {
    fontSize: 21,
    fontWeight: "bold",
    color: colors.text,
  },

  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: colors.text,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
  },

  addButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },

  taskList: {
    gap: 12,
  },

  taskCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },

  checkButton: {
    paddingTop: 2,
    paddingRight: 10,
  },

  taskContent: {
    flex: 1,
  },

  taskName: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
  },

  taskCompleted: {
    textDecorationLine: "line-through",
    color: colors.textSecondary,
  },

  taskDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    lineHeight: 18,
  },

  taskInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13,
    marginTop: 10,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  infoText: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 9,
  },

  statusPending: {
    color: "#D18A1B",
  },

  statusCompleted: {
    color: colors.primary,
  },

  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },

  actionButton: {
    padding: 7,
  },

  loading: {
    marginTop: 50,
  },

  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    marginTop: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 15,
  },

  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },

  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 18,
  },

  emptyButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: 20,
  },

  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },

  descriptionInput: {
    height: 85,
    textAlignVertical: "top",
  },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 13,
    gap: 10,
  },

  dateButtonText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },

  pickerDone: {
    alignSelf: "flex-end",
    paddingVertical: 9,
    paddingHorizontal: 5,
  },

  pickerDoneText: {
    color: colors.primary,
    fontWeight: "bold",
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
    marginBottom: 5,
  },

  cancelButton: {
    flex: 1,
    padding: 14,
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
    padding: 14,
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
});
