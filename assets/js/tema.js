// Tema
import { CHAVE_TEMA, TEMAS, TEMA_PADRAO } from "./constantes.js";
import { elementos } from "./dom.js";
import { lerPreferencia, salvarPreferencia } from "./storage.js";

const APARENCIA = {
  sistema: { icone: "◐", rotulo: "Tema do sistema" },
  claro: { icone: "☀", rotulo: "Tema claro" },
  escuro: { icone: "☾", rotulo: "Tema escuro" },
};

let temaAtual = TEMA_PADRAO;

function aplicar(tema) {
  temaAtual = tema;

  if (tema === "sistema") {
    delete document.documentElement.dataset.tema;
  } else {
    document.documentElement.dataset.tema = tema;
  }

  elementos.iconeTema.textContent = APARENCIA[tema].icone;
  elementos.rotuloTema.textContent = APARENCIA[tema].rotulo;
  elementos.btnTema.title = "Alternar entre sistema, claro e escuro";
}

export function iniciarTema() {
  aplicar(lerPreferencia(CHAVE_TEMA, TEMA_PADRAO, TEMAS));

  elementos.btnTema.addEventListener("click", () => {
    const proximo = TEMAS[(TEMAS.indexOf(temaAtual) + 1) % TEMAS.length];

    aplicar(proximo);
    salvarPreferencia(CHAVE_TEMA, proximo);
  });
}
