// Estado central
import {
  CHAVE_FILTRO,
  CHAVE_ORDENACAO,
  FILTROS,
  FILTRO_PADRAO,
  ORDENACOES,
  ORDENACAO_PADRAO,
} from "./constantes.js";
import * as storage from "./storage.js";

export const estado = {
  tarefas: [],
  filtro: FILTRO_PADRAO,
  busca: "",
  ordenacao: ORDENACAO_PADRAO,
  tarefaEmEdicaoId: null,
  edicaoInlineId: null,
  idArrastado: null,
  tarefaParaApagarId: null,
};

const ouvintes = new Set();

export function assinar(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

function notificar() {
  ouvintes.forEach((ouvinte) => ouvinte(estado));
}

export function iniciarEstado() {
  const { tarefas, aviso } = storage.carregarTarefas();

  estado.tarefas = tarefas;
  estado.filtro = storage.lerPreferencia(CHAVE_FILTRO, FILTRO_PADRAO, FILTROS);
  estado.ordenacao = storage.lerPreferencia(CHAVE_ORDENACAO, ORDENACAO_PADRAO, ORDENACOES);

  notificar();
  return aviso;
}

export function atualizarTarefas(transformacao) {
  estado.tarefas =
    typeof transformacao === "function"
      ? transformacao(estado.tarefas)
      : transformacao;

  const { aviso } = storage.salvarTarefas(estado.tarefas);

  notificar();
  return aviso;
}

export function definirUI(parcial) {
  Object.assign(estado, parcial);

  if (parcial.filtro !== undefined) {
    storage.salvarPreferencia(CHAVE_FILTRO, parcial.filtro);
  }

  if (parcial.ordenacao !== undefined) {
    storage.salvarPreferencia(CHAVE_ORDENACAO, parcial.ordenacao);
  }

  notificar();
}

export function obterTarefa(id) {
  return estado.tarefas.find((tarefa) => tarefa.id === id) ?? null;
}
