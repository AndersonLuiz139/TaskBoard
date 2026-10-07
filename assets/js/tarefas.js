// Regras de domínio
import { LIMITE_TAGS, PRIORIDADES, PRIORIDADE_PADRAO } from "./constantes.js";

export function gerarId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function hojeISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function normalizarPrioridade(valor) {
  return PRIORIDADES.includes(valor) ? valor : PRIORIDADE_PADRAO;
}

export function normalizarPrazo(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;

  return Number.isNaN(new Date(`${valor}T00:00:00`).getTime()) ? null : valor;
}

export function normalizarTags(valor) {
  const bruta = Array.isArray(valor) ? valor : String(valor ?? "").split(/[,\s]+/);

  const limpas = bruta
    .map((tag) =>
      String(tag)
        .trim()
        .replace(/^#+/, "")
        .replace(/\s+/g, "-")
        .toLowerCase(),
    )
    .filter(Boolean);

  return [...new Set(limpas)].slice(0, LIMITE_TAGS);
}

export function separarTextoETags(entrada) {
  const tags = [];

  const texto = String(entrada ?? "")
    .replace(/(^|\s)#([\p{L}\p{N}_-]+)/gu, (_, espaco, tag) => {
      tags.push(tag);
      return espaco;
    })
    .replace(/\s+/g, " ")
    .trim();

  if (!texto) return { texto: String(entrada ?? "").trim(), tags: [] };

  return { texto, tags: normalizarTags(tags) };
}

export function criarTarefa({ texto, prioridade, prazo, tags = [], agora = new Date() }) {
  return {
    id: gerarId(),
    texto: texto.trim(),
    concluida: false,
    criadaEm: agora.toISOString(),
    prioridade: normalizarPrioridade(prioridade),
    prazo: normalizarPrazo(prazo),
    tags: normalizarTags(tags),
  };
}

export function estaAtrasada(tarefa, hoje = hojeISO()) {
  return !tarefa.concluida && Boolean(tarefa.prazo) && tarefa.prazo < hoje;
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

export function editarTarefa(tarefas, id, campos) {
  return tarefas.map((tarefa) => {
    if (tarefa.id !== id) return tarefa;

    const atualizada = { ...tarefa };

    if (campos.texto !== undefined) atualizada.texto = campos.texto.trim();
    if (campos.prioridade !== undefined) {
      atualizada.prioridade = normalizarPrioridade(campos.prioridade);
    }
    if (campos.prazo !== undefined) atualizada.prazo = normalizarPrazo(campos.prazo);
    if (campos.tags !== undefined) atualizada.tags = normalizarTags(campos.tags);

    return atualizada;
  });
}

export function removerTarefa(tarefas, id) {
  return tarefas.filter((tarefa) => tarefa.id !== id);
}

export function limparConcluidas(tarefas) {
  return tarefas.filter((tarefa) => !tarefa.concluida);
}
