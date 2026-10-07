// Avisos temporários
import { DURACAO_TOAST } from "./constantes.js";
import { elementos } from "./dom.js";

function remover(toast) {
  toast.classList.add("saindo");

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    toast.remove();
    return;
  }

  toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  setTimeout(() => toast.remove(), 400);
}

export function mostrarToast(mensagem, opcoes = {}) {
  const { tipo = "info", acao = null, duracao = DURACAO_TOAST } = opcoes;

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;

  const texto = document.createElement("p");
  texto.className = "toast-texto";
  texto.textContent = mensagem;
  toast.appendChild(texto);

  let temporizador;

  const fechar = () => {
    clearTimeout(temporizador);
    remover(toast);
  };

  if (acao) {
    const btnAcao = document.createElement("button");

    btnAcao.type = "button";
    btnAcao.className = "toast-acao";
    btnAcao.textContent = acao.rotulo;
    btnAcao.addEventListener("click", () => {
      acao.aoClicar();
      fechar();
    });

    toast.appendChild(btnAcao);
  }

  const btnFechar = document.createElement("button");

  btnFechar.type = "button";
  btnFechar.className = "toast-fechar";
  btnFechar.setAttribute("aria-label", "Fechar aviso");
  btnFechar.textContent = "×";
  btnFechar.addEventListener("click", fechar);

  toast.appendChild(btnFechar);
  elementos.toasts.appendChild(toast);

  const iniciarContagem = () => {
    temporizador = setTimeout(fechar, duracao);
  };

  toast.addEventListener("mouseenter", () => clearTimeout(temporizador));
  toast.addEventListener("mouseleave", iniciarContagem);
  toast.addEventListener("focusin", () => clearTimeout(temporizador));
  toast.addEventListener("focusout", iniciarContagem);

  iniciarContagem();

  return fechar;
}
