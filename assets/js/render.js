// Renderização
import { ROTULO_PRIORIDADE } from "./constantes.js";
import { elementos } from "./dom.js";
import { estado } from "./estado.js";
import { criadaEmCompleta, prazoCompleto, prazoNeutro, rotuloPrazo } from "./formato.js";
import { estaAtrasada, filtrarTarefas, hojeISO } from "./tarefas.js";

function criarMeta(tarefa, hoje) {
  const meta = document.createElement("div");
  meta.className = "tarefa-meta";

  const prioridade = document.createElement("span");
  prioridade.className = `etiqueta etiqueta-${tarefa.prioridade}`;
  prioridade.textContent = `Prioridade ${ROTULO_PRIORIDADE[tarefa.prioridade]}`;
  meta.appendChild(prioridade);

  if (tarefa.prazo) {
    const prazo = document.createElement("time");

    prazo.className = "etiqueta etiqueta-prazo";
    prazo.dateTime = tarefa.prazo;
    prazo.textContent = tarefa.concluida
      ? prazoNeutro(tarefa.prazo)
      : rotuloPrazo(tarefa.prazo, hoje);
    prazo.title = `Prazo: ${prazoCompleto(tarefa.prazo)}`;

    if (estaAtrasada(tarefa, hoje)) prazo.classList.add("etiqueta-atrasada");

    meta.appendChild(prazo);
  }

  tarefa.tags.forEach((tag) => {
    const etiqueta = document.createElement("span");

    etiqueta.className = "etiqueta etiqueta-tag";
    etiqueta.textContent = `#${tag}`;

    meta.appendChild(etiqueta);
  });

  const criada = document.createElement("span");
  criada.className = "etiqueta etiqueta-criada";
  criada.textContent = `Criada em ${criadaEmCompleta(tarefa.criadaEm)}`;
  meta.appendChild(criada);

  return meta;
}

export function criarElementoTarefa(tarefa, hoje) {
  const li = document.createElement("li");

  li.className = `tarefa prioridade-${tarefa.prioridade}`;
  li.dataset.id = tarefa.id;

  if (tarefa.concluida) li.classList.add("concluida");
  if (estaAtrasada(tarefa, hoje)) li.classList.add("atrasada");

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

  const corpo = document.createElement("div");
  corpo.className = "tarefa-corpo";

  const texto = document.createElement("span");
  texto.className = "tarefa-texto";
  texto.textContent = tarefa.texto;

  corpo.append(texto, criarMeta(tarefa, hoje));
  conteudo.append(check, corpo);

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
  const hoje = hojeISO();

  elementos.listaTarefas.innerHTML = "";

  const tarefasFiltradas = filtrarTarefas(estado.tarefas, estado.filtro);

  tarefasFiltradas.forEach((tarefa) => {
    elementos.listaTarefas.appendChild(criarElementoTarefa(tarefa, hoje));
  });

  atualizarContador();
  mostrarMensagemVazia(tarefasFiltradas);
}
