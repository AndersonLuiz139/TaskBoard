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

  const conteudo = document.createElement("div");
  conteudo.className = "tarefa-conteudo";

  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "check-tarefa";
  check.checked = tarefa.concluida;
  check.setAttribute(
    "aria-label",
    tarefa.concluida ? `Reabrir: ${tarefa.texto}` : `Concluir: ${tarefa.texto}`,
  );

  const texto = document.createElement("span");
  texto.className = "tarefa-texto";
  texto.textContent = tarefa.texto;

  conteudo.append(check, texto);

  const acoes = document.createElement("div");
  acoes.className = "tarefa-acoes";

  const botoes = [
    ["btn-editar", "Editar", `Editar: ${tarefa.texto}`],
    [
      "btn-concluir",
      tarefa.concluida ? "Desfazer" : "Concluir",
      tarefa.concluida ? `Reabrir: ${tarefa.texto}` : `Concluir: ${tarefa.texto}`,
    ],
    ["btn-apagar", "Apagar", `Apagar: ${tarefa.texto}`],
  ];

  botoes.forEach(([classe, rotulo, rotuloAcessivel]) => {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = `btn-acao ${classe}`;
    botao.textContent = rotulo;
    botao.setAttribute("aria-label", rotuloAcessivel);

    acoes.appendChild(botao);
  });

  li.append(conteudo, acoes);

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
