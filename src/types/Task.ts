
export type TaskStatus = "PENDENTE" | "CONCLUIDA" | "CANCELADA";

export interface Task {
  id_tarefa: number;
  nome_tarefa: string;
  descricao_tarefa: string | null;
  data_tarefa: string;
  horario_tarefa: string | null;
  status_tarefa: TaskStatus;
}

export interface CreateTaskData {
  nome_tarefa: string;
  descricao_tarefa?: string;
  data_tarefa: string;
  horario_tarefa?: string;
}
