// Renderização

import { elementos } from "./dom.js";
import { estado } from "./estado.js";
import { filtrarTarefas } from "./tarefas.js";

export function criarElementoTarefa(tarefa) {
  const li = document.createElement("li");

  li.classList.add("tarefa");
  li.dataset.id = tarefa.id;

  if (tarefa.concluida) {
    li.classList.add("concluida");
  }

  li.innerHTML = `
    <div class="tarefa-conteudo">
      <input type="checkbox" class="check-tarefa" ${tarefa.concluida ? "checked" : ""}>
      <span class="tarefa-texto">${tarefa.texto}</span>
    </div>

    <div class="tarefa-acoes">
      <button class="btn-acao btn-editar">Editar</button>
      <button class="btn-acao btn-concluir">
        ${tarefa.concluida ? "Desfazer" : "Concluir"}
      </button>
      <button class="btn-acao btn-apagar">Apagar</button>
    </div>
  `;

  return li;
}

function atualizarContador() {
  elementos.total.innerText = estado.tarefas.length;
}

function mostrarMensagemVazia(listaFiltrada) {
  elementos.mensagemVazia.style.display = listaFiltrada.length === 0 ? "block" : "none";
}

export function renderizar() {
  elementos.listaTarefas.innerHTML = "";

  const tarefasFiltradas = filtrarTarefas(estado.tarefas, estado.filtro);

  tarefasFiltradas.forEach((tarefa) => {
    elementos.listaTarefas.appendChild(criarElementoTarefa(tarefa));
  });

  atualizarContador();
  mostrarMensagemVazia(tarefasFiltradas);
}
