import api from "./api";
import { Food } from "../types/Food";

export async function listarAlimentos(
  busca = ""
): Promise<Food[]> {
  const resposta = await api.get("/alimentos", {
    params: {
      busca
    }
  });

  return resposta.data.alimentos;
}