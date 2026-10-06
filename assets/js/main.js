// Ponto de entrada

import { elementos } from "./dom.js";
import {
  assinar,
  atualizarTarefas,
  definirUI,
  estado,
  iniciarEstado,
  obterTarefa,
} from "./estado.js";
import { renderizar } from "./render.js";
import {
  alternarConclusao,
  criarTarefa,
  editarTexto,
  limparConcluidas,
  removerTarefa,
} from "./tarefas.js";

const { listaTarefas } = elementos;

function limparInput() {
  elementos.inputTarefa.value = "";
  elementos.inputTarefa.focus();
}

function adicionarTarefa(texto) {
  const textoLimpo = texto.trim();

  if (!textoLimpo) return;

  atualizarTarefas((tarefas) => [...tarefas, criarTarefa(textoLimpo)]);

  limparInput();
}

elementos.btnTarefa.addEventListener("click", () => {
  adicionarTarefa(elementos.inputTarefa.value);
});

elementos.inputTarefa.addEventListener("keypress", (evento) => {
  if (evento.key === "Enter") {
    adicionarTarefa(elementos.inputTarefa.value);
  }
});

listaTarefas.addEventListener("click", (evento) => {
  const li = evento.target.closest(".tarefa");

  if (!li) return;
  const id = li.dataset.id;
  if (evento.target.classList.contains("btn-apagar")) {
    abrirModalApagar(id);
  }

  if (evento.target.classList.contains("btn-concluir")) {
    atualizarTarefas((tarefas) => alternarConclusao(tarefas, id));
  }

  if (evento.target.classList.contains("btn-editar")) {
    abrirModalEdicao(id);
  }
});

listaTarefas.addEventListener("change", (evento) => {
  const li = evento.target.closest(".tarefa");
  if (!li) return;

  const id = li.dataset.id;

  if (evento.target.classList.contains("check-tarefa")) {
    atualizarTarefas((tarefas) => alternarConclusao(tarefas, id));
  }
});

/* ------------------------------------------------------------------ *
 * Filtros e limpeza
 * ------------------------------------------------------------------ */

elementos.filtros.forEach((botao) => {
  botao.addEventListener("click", () => {
    elementos.filtros.forEach((filtro) => filtro.classList.remove("ativo"));
    botao.classList.add("ativo");

    definirUI({ filtro: botao.dataset.filtro });
  });
});

elementos.btnLimpar.addEventListener("click", () => {
  atualizarTarefas(limparConcluidas);
});

/* ------------------------------------------------------------------ *
 * Modal de edição
 * ------------------------------------------------------------------ */

function abrirModalEdicao(id) {
  const tarefa = obterTarefa(id);

  if (!tarefa) return;

  estado.tarefaEmEdicaoId = id;
  elementos.inputEditar.value = tarefa.texto;
  elementos.modalEditarOverlay.classList.remove("hidden");
  elementos.inputEditar.focus();
}

function fecharModalEdicao() {
  elementos.modalEditarOverlay.classList.add("hidden");
  elementos.inputEditar.value = "";
  estado.tarefaEmEdicaoId = null;
}

function salvarEdicao() {
  const textoEditado = elementos.inputEditar.value.trim();

  if (!textoEditado) {
    alert("A tarefa não pode ficar vazia.");
    return;
  }

  const id = estado.tarefaEmEdicaoId;

  atualizarTarefas((tarefas) => editarTexto(tarefas, id, textoEditado));

  fecharModalEdicao();
}

elementos.btnCancelar.addEventListener("click", fecharModalEdicao);
elementos.btnSalvar.addEventListener("click", salvarEdicao);

elementos.inputEditar.addEventListener("keypress", (evento) => {
  if (evento.key === "Enter") {
    salvarEdicao();
  }
});

elementos.modalEditarOverlay.addEventListener("click", (evento) => {
  if (evento.target === elementos.modalEditarOverlay) {
    fecharModalEdicao();
  }
});

/* ------------------------------------------------------------------ *
 * Modal de exclusão
 * ------------------------------------------------------------------ */

function abrirModalApagar(id) {
  estado.tarefaParaApagarId = id;
  elementos.modalApagarOverlay.classList.remove("hidden");
}

function fecharModalApagar() {
  elementos.modalApagarOverlay.classList.add("hidden");
  estado.tarefaParaApagarId = null;
}

function confirmarApagarTarefa() {
  if (estado.tarefaParaApagarId === null) return;

  const id = estado.tarefaParaApagarId;

  atualizarTarefas((tarefas) => removerTarefa(tarefas, id));

  fecharModalApagar();
}

elementos.btnCancelarApagar.addEventListener("click", fecharModalApagar);
elementos.btnConfirmarApagar.addEventListener("click", confirmarApagarTarefa);

elementos.modalApagarOverlay.addEventListener("click", (evento) => {
  if (evento.target === elementos.modalApagarOverlay) {
    fecharModalApagar();
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    fecharModalEdicao();
    fecharModalApagar();
  }
});

/* ------------------------------------------------------------------ *
 * Inicialização
 * ------------------------------------------------------------------ */

assinar(renderizar);
iniciarEstado();
