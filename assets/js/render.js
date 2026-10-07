// Renderização
import { ROTULO_PRIORIDADE } from "./constantes.js";
import { elementos } from "./dom.js";
import { estado } from "./estado.js";
import { criadaEmCompleta, prazoCompleto, prazoNeutro, rotuloPrazo } from "./formato.js";
import {
  contar,
  estaAtrasada,
  filtrarTarefas,
  hojeISO,
  ordenarTarefas,
} from "./tarefas.js";

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
    const etiqueta = document.createElement("button");

    etiqueta.type = "button";
    etiqueta.className = "etiqueta etiqueta-tag";
    etiqueta.dataset.tag = tag;
    etiqueta.textContent = `#${tag}`;
    etiqueta.setAttribute("aria-label", `Filtrar pela tag ${tag}`);

    meta.appendChild(etiqueta);
  });

  const criada = document.createElement("span");
  criada.className = "etiqueta etiqueta-criada";
  criada.textContent = `Criada em ${criadaEmCompleta(tarefa.criadaEm)}`;
  meta.appendChild(criada);

  return meta;
}

function criarAlca(tarefa, manual) {
  const alca = document.createElement("button");

  alca.type = "button";
  alca.className = "alca";
  alca.textContent = "⠿";

  if (manual) {
    alca.draggable = true;
    alca.setAttribute(
      "aria-label",
      `Reordenar: ${tarefa.texto}. Use Alt com as setas para cima ou para baixo.`,
    );
  } else {
    alca.disabled = true;
    alca.tabIndex = -1;
    alca.setAttribute("aria-hidden", "true");
    alca.title = "Reordenar só funciona na ordem manual, sem busca";
  }

  return alca;
}

function criarTexto(tarefa) {
  if (estado.edicaoInlineId === tarefa.id) {
    const entrada = document.createElement("input");

    entrada.type = "text";
    entrada.className = "entrada-inline";
    entrada.value = tarefa.texto;
    entrada.dataset.inline = "true";
    entrada.setAttribute("aria-label", `Editar texto: ${tarefa.texto}`);

    return entrada;
  }

  const texto = document.createElement("span");

  texto.className = "tarefa-texto";
  texto.textContent = tarefa.texto;
  texto.title = "Duplo clique para editar";

  return texto;
}

export function criarElementoTarefa(tarefa, hoje, manual) {
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

  corpo.append(criarTexto(tarefa), criarMeta(tarefa, hoje));
  conteudo.append(criarAlca(tarefa, manual), check, corpo);

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

function textoVazio(numeros) {
  if (estado.busca.trim()) {
    return `Nenhuma tarefa encontrada para "${estado.busca.trim()}".`;
  }

  if (numeros.total === 0) return "Você ainda não adicionou nenhuma tarefa.";

  const porFiltro = {
    pendentes: "Nenhuma tarefa pendente. Tudo em ordem!",
    concluidas: "Nenhuma tarefa concluída ainda.",
    atrasadas: "Nenhuma tarefa atrasada.",
  };

  return porFiltro[estado.filtro] ?? "Nenhuma tarefa para mostrar.";
}

function atualizarResumo(numeros) {
  const { total, concluidas, atrasadas, percentual } = numeros;

  elementos.contador.textContent =
    total === 0
      ? "Nenhuma tarefa por aqui"
      : `${concluidas} de ${total} concluída${total > 1 ? "s" : ""}` +
        (atrasadas > 0 ? ` · ${atrasadas} atrasada${atrasadas > 1 ? "s" : ""}` : "");

  elementos.barraProgresso.setAttribute("aria-valuenow", String(percentual));
  elementos.barraProgresso.title = `${percentual}% concluído`;
  elementos.preenchimentoProgresso.style.width = `${percentual}%`;

  elementos.contagens.forEach((span) => {
    span.textContent = String(numeros[span.dataset.contagem] ?? 0);
  });

  elementos.filtros.forEach((botao) => {
    const ativo = botao.dataset.filtro === estado.filtro;

    botao.classList.toggle("ativo", ativo);
    botao.setAttribute("aria-pressed", String(ativo));

    if (botao.dataset.filtro === "atrasadas") {
      botao.classList.toggle("tem-atrasadas", numeros.atrasadas > 0);
    }
  });
}

export function renderizar() {
  const hoje = hojeISO();
  const manual = estado.ordenacao === "manual" && estado.busca.trim() === "";

  elementos.listaTarefas.innerHTML = "";

  const visiveis = ordenarTarefas(
    filtrarTarefas(estado.tarefas, {
      filtro: estado.filtro,
      busca: estado.busca,
      hoje,
    }),
    estado.ordenacao,
  );

  visiveis.forEach((tarefa) => {
    elementos.listaTarefas.appendChild(criarElementoTarefa(tarefa, hoje, manual));
  });

  elementos.listaTarefas.classList.toggle("reordenavel", manual);

  const numeros = contar(estado.tarefas, hoje);

  atualizarResumo(numeros);

  const vazio = visiveis.length === 0;

  elementos.mensagemVazia.textContent = vazio ? textoVazio(numeros) : "";
  elementos.mensagemVazia.hidden = !vazio;

  elementos.selectOrdenacao.value = estado.ordenacao;
  elementos.btnLimparBusca.hidden = estado.busca.trim() === "";
  elementos.btnLimpar.disabled = numeros.concluidas === 0;

  const entradaInline = elementos.listaTarefas.querySelector("[data-inline]");

  if (entradaInline && document.activeElement !== entradaInline) {
    entradaInline.focus();
    entradaInline.setSelectionRange(entradaInline.value.length, entradaInline.value.length);
  }
}
