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
import { mostrarToast } from "./toast.js";
import {
  alternarConclusao,
  criarTarefa,
  editarTarefa,
  separarTextoETags,
  mover,
  proximaOrdem,
  reordenar,
  limparConcluidas,
  removerTarefa,
} from "./tarefas.js";

const { listaTarefas } = elementos;

function recortar(texto, limite = 40) {
  return texto.length > limite ? `${texto.slice(0, limite)}…` : texto;
}

function aplicar(transformacao) {
  const aviso = atualizarTarefas(transformacao);

  if (aviso) mostrarToast(aviso, { tipo: "erro", duracao: 9000 });
}

function limparInput() {
  elementos.inputTarefa.value = "";
  elementos.inputTarefa.focus();
}

function adicionarTarefa(entrada) {
  const { texto, tags } = separarTextoETags(entrada);

  if (!texto) return;

  const tagsDoCampo = elementos.novaTags.value;

  const nova = criarTarefa({
    texto,
    prioridade: elementos.novaPrioridade.value,
    prazo: elementos.novaPrazo.value,
    tags: [...tags, ...(tagsDoCampo ? tagsDoCampo.split(/[,\s]+/) : [])],
    ordem: proximaOrdem(estado.tarefas),
  });

  aplicar((tarefas) => [...tarefas, nova]);

  elementos.novaTags.value = "";
  elementos.novaPrazo.value = "";
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

  if (evento.target.classList.contains("etiqueta-tag")) {
    const busca = `#${evento.target.dataset.tag}`;

    elementos.entradaBusca.value = busca;
    definirUI({ busca, filtro: "todas" });
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
  botao.addEventListener("click", () => definirUI({ filtro: botao.dataset.filtro }));
});

elementos.entradaBusca.addEventListener("input", (evento) => {
  definirUI({ busca: evento.target.value });
});

elementos.btnLimparBusca.addEventListener("click", () => {
  elementos.entradaBusca.value = "";
  definirUI({ busca: "" });
  elementos.entradaBusca.focus();
});

elementos.selectOrdenacao.addEventListener("change", (evento) => {
  definirUI({ ordenacao: evento.target.value });
});

elementos.btnLimpar.addEventListener("click", () => {
  const concluidas = estado.tarefas.filter((tarefa) => tarefa.concluida);

  if (concluidas.length === 0) {
    mostrarToast("Nenhuma tarefa concluída para limpar.");
    return;
  }

  confirmar({
    titulo: "Limpar concluídas",
    mensagem: `Isso vai apagar ${concluidas.length} tarefa${
      concluidas.length > 1 ? "s" : ""
    } concluída${concluidas.length > 1 ? "s" : ""}.`,
    rotuloConfirmar: "Limpar",
    aoConfirmar: () => {
      const anterior = estado.tarefas;

      aplicar(limparConcluidas);

      mostrarToast(
        `${concluidas.length} tarefa${concluidas.length > 1 ? "s" : ""} apagada${
          concluidas.length > 1 ? "s" : ""
        }.`,
        { acao: { rotulo: "Desfazer", aoClicar: () => aplicar(anterior) } },
      );
    },
  });
});

/* ------------------------------------------------------------------ *
 * Edição rápida no próprio item
 * ------------------------------------------------------------------ */

listaTarefas.addEventListener("dblclick", (evento) => {
  const id = evento.target.closest(".tarefa")?.dataset.id;

  if (id && evento.target.classList.contains("tarefa-texto")) {
    definirUI({ edicaoInlineId: id });
  }
});

function salvarEdicaoInline(valor) {
  const id = estado.edicaoInlineId;
  const texto = valor.trim();

  if (!id) return;

  if (!texto) {
    definirUI({ edicaoInlineId: null });
    mostrarToast("A tarefa não pode ficar vazia. O texto anterior foi mantido.", {
      tipo: "erro",
    });
    return;
  }

  estado.edicaoInlineId = null;
  aplicar((tarefas) => editarTarefa(tarefas, id, { texto }));
}

listaTarefas.addEventListener("focusout", (evento) => {
  if (evento.target.dataset.inline === "true" && estado.edicaoInlineId) {
    salvarEdicaoInline(evento.target.value);
  }
});

/* ------------------------------------------------------------------ *
 * Reordenar
 * ------------------------------------------------------------------ */

listaTarefas.addEventListener("keydown", (evento) => {
  const alvo = evento.target;

  if (alvo.dataset.inline === "true") {
    if (evento.key === "Enter") {
      evento.preventDefault();
      salvarEdicaoInline(alvo.value);
    }

    if (evento.key === "Escape") {
      evento.preventDefault();
      definirUI({ edicaoInlineId: null });
    }

    return;
  }

  const alca = alvo.closest(".alca");

  if (!alca || !evento.altKey) return;
  if (evento.key !== "ArrowUp" && evento.key !== "ArrowDown") return;

  evento.preventDefault();

  const id = alca.closest(".tarefa").dataset.id;

  aplicar((tarefas) => mover(tarefas, id, evento.key === "ArrowUp" ? -1 : 1));
  focarAcaoDaTarefa(id, ".alca");
});

function limparIndicadores() {
  listaTarefas
    .querySelectorAll(".alvo-antes, .alvo-depois")
    .forEach((li) => li.classList.remove("alvo-antes", "alvo-depois"));
}

function finalizarArraste() {
  estado.idArrastado = null;
  limparIndicadores();
  listaTarefas.querySelectorAll(".arrastando").forEach((li) => li.classList.remove("arrastando"));
}

listaTarefas.addEventListener("dragstart", (evento) => {
  const alca = evento.target.closest(".alca");

  if (!alca || alca.disabled) return;

  const li = alca.closest(".tarefa");

  estado.idArrastado = li.dataset.id;

  evento.dataTransfer.effectAllowed = "move";
  evento.dataTransfer.setData("text/plain", li.dataset.id);
  evento.dataTransfer.setDragImage(li, 24, 24);

  li.classList.add("arrastando");
});

listaTarefas.addEventListener("dragover", (evento) => {
  if (!estado.idArrastado) return;

  const li = evento.target.closest(".tarefa");

  if (!li || li.dataset.id === estado.idArrastado) return;

  evento.preventDefault();
  evento.dataTransfer.dropEffect = "move";

  const area = li.getBoundingClientRect();
  const depois = evento.clientY > area.top + area.height / 2;

  limparIndicadores();
  li.classList.add(depois ? "alvo-depois" : "alvo-antes");
});

listaTarefas.addEventListener("drop", (evento) => {
  if (!estado.idArrastado) return;

  const li = evento.target.closest(".tarefa");

  if (!li) return;

  evento.preventDefault();

  const posicao = li.classList.contains("alvo-depois") ? "depois" : "antes";
  const arrastado = estado.idArrastado;
  const destino = li.dataset.id;

  finalizarArraste();
  aplicar((tarefas) => reordenar(tarefas, arrastado, destino, posicao));
});

listaTarefas.addEventListener("dragend", finalizarArraste);

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
  elementos.editarPrioridade.value = tarefa.prioridade;
  elementos.editarPrazo.value = tarefa.prazo ?? "";
  elementos.editarTags.value = tarefa.tags.join(", ");

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
    mostrarToast("A tarefa não pode ficar vazia.", { tipo: "erro" });
    return;
  }

  const id = estado.tarefaEmEdicaoId;

  aplicar((tarefas) =>
    editarTarefa(tarefas, id, {
      texto: textoEditado,
      prioridade: elementos.editarPrioridade.value,
      prazo: elementos.editarPrazo.value,
      tags: elementos.editarTags.value,
    }),
  );

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
      const anterior = estado.tarefas;

      aplicar((tarefas) => removerTarefa(tarefas, id));
      elementos.inputTarefa.focus();

      mostrarToast(`"${recortar(tarefa.texto)}" foi apagada.`, {
        acao: { rotulo: "Desfazer", aoClicar: () => aplicar(anterior) },
      });
    },
  });
}

/* ------------------------------------------------------------------ *
 * Inicialização
 * ------------------------------------------------------------------ */

iniciarModais();
assinar(renderizar);

const avisoInicial = iniciarEstado();

if (avisoInicial) mostrarToast(avisoInicial, { tipo: "erro", duracao: 12000 });

if (usandoMemoria) {
  mostrarToast("Sem armazenamento local: as tarefas serão perdidas ao fechar a aba.", {
    tipo: "erro",
    duracao: 12000,
  });
}
