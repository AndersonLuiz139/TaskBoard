// Estado central
import { FILTRO_PADRAO } from "./constantes.js";
import * as storage from "./storage.js";

export const estado = {
  tarefas: [],
  filtro: FILTRO_PADRAO,
  tarefaEmEdicaoId: null,
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
  estado.tarefas = storage.carregarTarefas();
  notificar();
}

export function atualizarTarefas(transformacao) {
  estado.tarefas =
    typeof transformacao === "function"
      ? transformacao(estado.tarefas)
      : transformacao;

  storage.salvarTarefas(estado.tarefas);
  notificar();
}

export function definirUI(parcial) {
  Object.assign(estado, parcial);
  notificar();
}

export function obterTarefa(id) {
  return estado.tarefas.find((tarefa) => tarefa.id === id) ?? null;
}
