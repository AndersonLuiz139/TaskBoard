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
    elementos.filtros.forEach((filtro) => {
      const ativo = filtro === botao;

      filtro.classList.toggle("ativo", ativo);
      filtro.setAttribute("aria-pressed", String(ativo));
    });

    definirUI({ filtro: botao.dataset.filtro });
  });
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
