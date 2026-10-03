// Regras de domínio

export function gerarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function criarTarefa(texto) {
  return {
    id: gerarId(),
    texto: texto.trim(),
    concluida: false,
  };
}

export function filtrarTarefas(tarefas, filtro) {
  if (filtro === "pendentes") {
    return tarefas.filter((tarefa) => !tarefa.concluida);
  }

  if (filtro === "concluidas") {
    return tarefas.filter((tarefa) => tarefa.concluida);
  }

  return tarefas;
}

export function alternarConclusao(tarefas, id) {
  return tarefas.map((tarefa) =>
    tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa,
  );
}

export function editarTexto(tarefas, id, texto) {
  return tarefas.map((tarefa) =>
    tarefa.id === id ? { ...tarefa, texto: texto.trim() } : tarefa,
  );
}

export function removerTarefa(tarefas, id) {
  return tarefas.filter((tarefa) => tarefa.id !== id);
}

export function limparConcluidas(tarefas) {
  return tarefas.filter((tarefa) => !tarefa.concluida);
}
