// Persistência

import { CHAVE_TAREFAS } from "./constantes.js";

export function carregarTarefas() {
  const tarefasSalvas = localStorage.getItem(CHAVE_TAREFAS);

  if (!tarefasSalvas) return [];

  return JSON.parse(tarefasSalvas).map((tarefa) => ({
    ...tarefa,
    id: String(tarefa.id),
  }));
}

export function salvarTarefas(tarefas) {
  localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
}
