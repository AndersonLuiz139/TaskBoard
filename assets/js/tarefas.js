// Regras de domínio
import {
  LIMITE_TAGS,
  ORDEM_PRIORIDADE,
  PRIORIDADES,
  PRIORIDADE_PADRAO,
} from "./constantes.js";

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

export function criarTarefa({
  texto,
  prioridade,
  prazo,
  tags = [],
  ordem = 0,
  agora = new Date(),
}) {
  return {
    id: gerarId(),
    texto: texto.trim(),
    concluida: false,
    criadaEm: agora.toISOString(),
    prioridade: normalizarPrioridade(prioridade),
    prazo: normalizarPrazo(prazo),
    tags: normalizarTags(tags),
    ordem,
  };
}

export function proximaOrdem(tarefas) {
  return tarefas.reduce((maior, tarefa) => Math.max(maior, tarefa.ordem ?? 0), -1) + 1;
}

function renumerar(tarefas) {
  return tarefas.map((tarefa, indice) => ({ ...tarefa, ordem: indice }));
}

export function reordenar(tarefas, idArrastado, idDestino, posicao = "antes") {
  if (!idArrastado || !idDestino || idArrastado === idDestino) return tarefas;

  const ordenadas = ordenarTarefas(tarefas, "manual");
  const origem = ordenadas.findIndex((tarefa) => tarefa.id === idArrastado);
  const destinoOriginal = ordenadas.findIndex((tarefa) => tarefa.id === idDestino);

  if (origem === -1 || destinoOriginal === -1) return tarefas;

  const [movida] = ordenadas.splice(origem, 1);
  const destino = ordenadas.findIndex((tarefa) => tarefa.id === idDestino);

  ordenadas.splice(posicao === "depois" ? destino + 1 : destino, 0, movida);

  return renumerar(ordenadas);
}

export function mover(tarefas, id, passo) {
  const ordenadas = ordenarTarefas(tarefas, "manual");
  const atual = ordenadas.findIndex((tarefa) => tarefa.id === id);

  if (atual === -1) return tarefas;

  const novo = atual + passo;

  if (novo < 0 || novo >= ordenadas.length) return tarefas;

  const [movida] = ordenadas.splice(atual, 1);
  ordenadas.splice(novo, 0, movida);

  return renumerar(ordenadas);
}

export function estaAtrasada(tarefa, hoje = hojeISO()) {
  return !tarefa.concluida && Boolean(tarefa.prazo) && tarefa.prazo < hoje;
}

export function filtrarTarefas(tarefas, { filtro = "todas", busca = "", hoje = hojeISO() } = {}) {
  const termo = String(busca ?? "")
    .trim()
    .toLowerCase();

  return tarefas.filter((tarefa) => {
    if (filtro === "pendentes" && tarefa.concluida) return false;
    if (filtro === "concluidas" && !tarefa.concluida) return false;
    if (filtro === "atrasadas" && !estaAtrasada(tarefa, hoje)) return false;

    if (!termo) return true;

    const alvo = `${tarefa.texto} ${tarefa.tags.map((tag) => `#${tag}`).join(" ")}`;

    return alvo.toLowerCase().includes(termo);
  });
}

function compararPrazo(a, b) {
  if (!a.prazo && !b.prazo) return 0;
  if (!a.prazo) return 1;
  if (!b.prazo) return -1;

  return a.prazo.localeCompare(b.prazo);
}

export function ordenarTarefas(tarefas, ordenacao) {
  const copia = [...tarefas];
  const porOrdem = (a, b) => (a.ordem ?? 0) - (b.ordem ?? 0);

  switch (ordenacao) {
    case "prioridade":
      return copia.sort(
        (a, b) =>
          ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade] || porOrdem(a, b),
      );
    case "prazo":
      return copia.sort((a, b) => compararPrazo(a, b) || porOrdem(a, b));
    case "recentes":
      return copia.sort((a, b) => String(b.criadaEm).localeCompare(String(a.criadaEm)));
    case "antigas":
      return copia.sort((a, b) => String(a.criadaEm).localeCompare(String(b.criadaEm)));
    default:
      return copia.sort(porOrdem);
  }
}

export function contar(tarefas, hoje = hojeISO()) {
  const total = tarefas.length;
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
  const atrasadas = tarefas.filter((tarefa) => estaAtrasada(tarefa, hoje)).length;

  return {
    total,
    concluidas,
    pendentes: total - concluidas,
    atrasadas,
    percentual: total === 0 ? 0 : Math.round((concluidas / total) * 100),
  };
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
