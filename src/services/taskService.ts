
import api from "./api";
import { Task, CreateTaskData } from "../types/Task";

export async function listarTarefas(): Promise<Task[]> {
  const resposta = await api.get("/tarefas");
  return resposta.data.tarefas;
}

export async function criarTarefa(
  dados: CreateTaskData
): Promise<Task> {
  const resposta = await api.post("/tarefas", dados);
  return resposta.data.tarefa;
}

export async function atualizarStatusTarefa(
  id: number,
  status: "PENDENTE" | "CONCLUIDA" | "CANCELADA"
): Promise<Task> {
  const resposta = await api.patch(`/tarefas/${id}/status`, {
    status_tarefa: status,
  });

  return resposta.data.tarefa;
}

export async function excluirTarefa(id: number): Promise<void> {
  await api.delete(`/tarefas/${id}`);
}



export async function editarTarefa(
  id: number,
  dados: CreateTaskData
): Promise<Task> {
  const resposta = await api.patch(`/tarefas/${id}`, dados);
  return resposta.data.tarefa;
}
