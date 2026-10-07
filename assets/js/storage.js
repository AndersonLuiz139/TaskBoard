// Persistência
import {
  CHAVE_BACKUP,
  CHAVE_LEGADA,
  CHAVE_TAREFAS,
  VERSAO_SCHEMA,
} from "./constantes.js";
import {
  gerarId,
  normalizarPrazo,
  normalizarPrioridade,
  normalizarTags,
} from "./tarefas.js";

export function criarDepositoMemoria() {
  const mapa = new Map();

  return {
    getItem: (chave) => (mapa.has(chave) ? mapa.get(chave) : null),
    setItem: (chave, valor) => void mapa.set(chave, String(valor)),
    removeItem: (chave) => void mapa.delete(chave),
  };
}

function detectarDeposito() {
  try {
    const sonda = "taskboard:sonda";

    globalThis.localStorage.setItem(sonda, "1");
    globalThis.localStorage.removeItem(sonda);

    return globalThis.localStorage;
  } catch {
    return criarDepositoMemoria();
  }
}

export const deposito = detectarDeposito();
export const usandoMemoria = deposito !== globalThis.localStorage;

export function normalizarTarefa(bruta, indice = 0) {
  if (!bruta || typeof bruta !== "object") return null;

  const texto = typeof bruta.texto === "string" ? bruta.texto.trim() : "";

  if (!texto) return null;

  const criadaEm =
    typeof bruta.criadaEm === "string" && !Number.isNaN(Date.parse(bruta.criadaEm))
      ? bruta.criadaEm
      : new Date().toISOString();

  return {
    id: typeof bruta.id === "string" && bruta.id.trim() ? bruta.id : gerarId(),
    texto,
    concluida: Boolean(bruta.concluida),
    criadaEm,
    prioridade: normalizarPrioridade(bruta.prioridade),
    prazo: normalizarPrazo(bruta.prazo),
    tags: normalizarTags(bruta.tags ?? []),
    ordem: Number.isFinite(bruta.ordem) ? Number(bruta.ordem) : indice,
  };
}

function migrar(dados) {
  const versaoOrigem = Array.isArray(dados) ? 1 : Number(dados?.versao) || 1;
  const lista = Array.isArray(dados) ? dados : (dados?.tarefas ?? []);

  if (!Array.isArray(lista)) return { tarefas: [], versaoOrigem, descartadas: 0 };

  const idsVistos = new Set();
  const tarefas = [];
  let descartadas = 0;

  lista.forEach((bruta, indice) => {
    const tarefa = normalizarTarefa(bruta, indice);

    if (!tarefa) {
      descartadas += 1;
      return;
    }

    if (idsVistos.has(tarefa.id)) tarefa.id = gerarId();

    idsVistos.add(tarefa.id);
    tarefas.push(tarefa);
  });

  return { tarefas, versaoOrigem, descartadas };
}

export function carregarTarefas(alvo = deposito) {
  let bruto = null;
  let veioDoLegado = false;

  try {
    bruto = alvo.getItem(CHAVE_TAREFAS);

    if (bruto === null) {
      bruto = alvo.getItem(CHAVE_LEGADA);
      veioDoLegado = bruto !== null;
    }
  } catch {
    return { tarefas: [], aviso: "Não foi possível ler os dados salvos." };
  }

  if (!bruto) return { tarefas: [], aviso: null };

  let dados;

  try {
    dados = JSON.parse(bruto);
  } catch {
    try {
      alvo.setItem(CHAVE_BACKUP, bruto);
    } catch {
      /* sem backup */
    }

    return {
      tarefas: [],
      aviso: "Os dados salvos estavam corrompidos e foram isolados. A lista começou vazia.",
    };
  }

  const { tarefas, versaoOrigem, descartadas } = migrar(dados);

  if (versaoOrigem < VERSAO_SCHEMA || veioDoLegado) {
    salvarTarefas(tarefas, alvo);

    try {
      alvo.removeItem(CHAVE_LEGADA);
    } catch {
      /* chave antiga só ocupa espaço */
    }
  }

  const avisos = [];

  if (versaoOrigem < VERSAO_SCHEMA) {
    avisos.push(`Tarefas migradas do formato v${versaoOrigem} para v${VERSAO_SCHEMA}.`);
  }

  if (descartadas > 0) {
    avisos.push(`${descartadas} registro(s) inválido(s) foram descartados.`);
  }

  return { tarefas, aviso: avisos.join(" ") || null };
}

export function salvarTarefas(tarefas, alvo = deposito) {
  try {
    alvo.setItem(CHAVE_TAREFAS, JSON.stringify({ versao: VERSAO_SCHEMA, tarefas }));

    return { ok: true, aviso: null };
  } catch (erro) {
    const cheio = erro?.name === "QuotaExceededError";

    return {
      ok: false,
      aviso: cheio
        ? "O armazenamento do navegador está cheio. Apague algumas tarefas para continuar."
        : "Não foi possível salvar as alterações neste navegador.",
    };
  }
}

export function lerPreferencia(chave, padrao, permitidos = null, alvo = deposito) {
  try {
    const valor = alvo.getItem(chave);

    if (valor === null) return padrao;
    if (permitidos && !permitidos.includes(valor)) return padrao;

    return valor;
  } catch {
    return padrao;
  }
}

export function salvarPreferencia(chave, valor, alvo = deposito) {
  try {
    alvo.setItem(chave, String(valor));
  } catch {
    /* preferência é descartável */
  }
}
