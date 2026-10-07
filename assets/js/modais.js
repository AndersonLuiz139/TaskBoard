// Modais
import { elementos } from "./dom.js";

const SELETOR_FOCAVEIS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

let overlayAberto = null;
let focoAnterior = null;
let aoFecharAtual = null;
let inertizados = [];

export function modalEstaAberto() {
  return overlayAberto !== null;
}

function focaveis(overlay) {
  return [...overlay.querySelectorAll(SELETOR_FOCAVEIS)].filter(
    (elemento) => elemento.offsetParent !== null || elemento === document.activeElement,
  );
}

function isolarFundo(overlay) {
  inertizados = [...document.body.children].filter((filho) => filho !== overlay && !filho.inert);

  inertizados.forEach((filho) => {
    filho.inert = true;
  });
}

function liberarFundo() {
  inertizados.forEach((filho) => {
    filho.inert = false;
  });

  inertizados = [];
}

export function abrirModal(overlay, { focar = null, selecionar = false, aoFechar = null } = {}) {
  if (overlayAberto) fecharModal();

  focoAnterior = document.activeElement;
  overlayAberto = overlay;
  aoFecharAtual = aoFechar;

  overlay.classList.remove("hidden");
  isolarFundo(overlay);

  const alvo = focar ?? focaveis(overlay)[0] ?? overlay.querySelector(".modal");

  const focarAlvo = () => {
    alvo?.focus();

    if (selecionar && typeof alvo?.select === "function") alvo.select();
  };

  focarAlvo();
  setTimeout(focarAlvo, 0);
}

export function fecharModal() {
  if (!overlayAberto) return;

  const overlay = overlayAberto;
  const aoFechar = aoFecharAtual;
  const anterior = focoAnterior;

  overlayAberto = null;
  aoFecharAtual = null;
  focoAnterior = null;

  overlay.classList.add("hidden");
  liberarFundo();

  if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus();

  aoFechar?.();
}

function prenderFoco(evento) {
  const lista = focaveis(overlayAberto);

  if (lista.length === 0) return;

  const primeiro = lista[0];
  const ultimo = lista[lista.length - 1];
  const ativo = document.activeElement;

  if (evento.shiftKey && (ativo === primeiro || !overlayAberto.contains(ativo))) {
    evento.preventDefault();
    ultimo.focus();
    return;
  }

  if (!evento.shiftKey && ativo === ultimo) {
    evento.preventDefault();
    primeiro.focus();
  }
}

export function iniciarModais() {
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (evento) => {
      if (evento.target === overlay) fecharModal();
    });

    overlay.querySelectorAll("[data-fechar-modal]").forEach((botao) => {
      botao.addEventListener("click", fecharModal);
    });
  });

  document.addEventListener("keydown", (evento) => {
    if (!overlayAberto) return;

    if (evento.key === "Escape") {
      evento.preventDefault();
      fecharModal();
      return;
    }

    if (evento.key === "Tab") prenderFoco(evento);
  });
}

export function confirmar({ titulo, mensagem, rotuloConfirmar = "Confirmar", aoConfirmar }) {
  elementos.tituloConfirmar.textContent = titulo;
  elementos.textoConfirmar.textContent = mensagem;
  elementos.btnConfirmar.textContent = rotuloConfirmar;

  const confirmarEFechar = () => {
    fecharModal();
    aoConfirmar();
  };

  elementos.btnConfirmar.addEventListener("click", confirmarEFechar, { once: true });

  abrirModal(elementos.modalConfirmar, {
    focar: elementos.btnConfirmar,
    aoFechar: () => elementos.btnConfirmar.removeEventListener("click", confirmarEFechar),
  });
}
