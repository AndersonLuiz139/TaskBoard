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
import { abrirModal, confirmar, fecharModal, iniciarModais } from "./modais.js";
import { renderizar } from "./render.js";
import { usandoMemoria } from "./storage.js";
import {
  alternarConclusao,
  criarTarefa,
  editarTexto,
  limparConcluidas,
  removerTarefa,
} from "./tarefas.js";

const { listaTarefas } = elementos;

function aplicar(transformacao) {
  const aviso = atualizarTarefas(transformacao);

  if (aviso) console.warn(aviso);
}

function limparInput() {
  elementos.inputTarefa.value = "";
  elementos.inputTarefa.focus();
}

function adicionarTarefa(texto) {
  const textoLimpo = texto.trim();

  if (!textoLimpo) return;

  aplicar((tarefas) => [...tarefas, criarTarefa(textoLimpo)]);

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
    aplicar((tarefas) => alternarConclusao(tarefas, id));
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
    aplicar((tarefas) => alternarConclusao(tarefas, id));
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
  aplicar(limparConcluidas);
});

/* ------------------------------------------------------------------ *
 * Modal de edição
 * ------------------------------------------------------------------ */

function focarAcaoDaTarefa(id, seletor) {
  setTimeout(() => {
    listaTarefas.querySelector(`[data-id="${CSS.escape(id)}"] ${seletor}`)?.focus();
  }, 0);
}

function abrirModalEdicao(id) {
  const tarefa = obterTarefa(id);

  if (!tarefa) return;

  estado.tarefaEmEdicaoId = id;
  elementos.inputEditar.value = tarefa.texto;

  abrirModal(elementos.modalEditar, {
    focar: elementos.inputEditar,
    selecionar: true,
    aoFechar: () => {
      elementos.inputEditar.value = "";
      estado.tarefaEmEdicaoId = null;
    },
  });
}

function salvarEdicao() {
  const textoEditado = elementos.inputEditar.value.trim();

  if (!textoEditado) {
    alert("A tarefa não pode ficar vazia.");
    return;
  }

  const id = estado.tarefaEmEdicaoId;

  aplicar((tarefas) => editarTexto(tarefas, id, textoEditado));

  fecharModal();
  focarAcaoDaTarefa(id, ".btn-editar");
}

elementos.btnSalvar.addEventListener("click", salvarEdicao);

elementos.inputEditar.addEventListener("keypress", (evento) => {
  if (evento.key === "Enter") {
    salvarEdicao();
  }
});

/* ------------------------------------------------------------------ *
 * Modal de exclusão
 * ------------------------------------------------------------------ */

function abrirModalApagar(id) {
  const tarefa = obterTarefa(id);

  if (!tarefa) return;

  confirmar({
    titulo: "Apagar tarefa",
    mensagem: `Tem certeza que deseja apagar "${tarefa.texto}"?`,
    rotuloConfirmar: "Apagar",
    aoConfirmar: () => {
      aplicar((tarefas) => removerTarefa(tarefas, id));
      elementos.inputTarefa.focus();
    },
  });
}

/* ------------------------------------------------------------------ *
 * Inicialização
 * ------------------------------------------------------------------ */

iniciarModais();
assinar(renderizar);

const avisoInicial = iniciarEstado();

if (avisoInicial) console.warn(avisoInicial);

if (usandoMemoria) {
  console.warn("Sem armazenamento local: as tarefas serão perdidas ao fechar a aba.");
}
