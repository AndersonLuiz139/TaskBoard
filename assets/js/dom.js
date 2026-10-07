// Referências de DOM
const q = (seletor) => document.querySelector(seletor);

export const elementos = {
  inputTarefa: q(".input-tarefa"),
  btnTarefa: q(".btn-tarefa"),
  listaTarefas: q(".tarefas"),
  filtros: [...document.querySelectorAll(".filtro")],
  total: q("#total"),
  mensagemVazia: q(".mensagem-vazia"),
  btnLimpar: q(".btn-limpar"),
  toasts: q(".toasts"),

  modalEditar: q('[data-modal="editar"]'),
  inputEditar: q(".input-editar"),
  btnSalvar: q(".btn-salvar"),

  modalConfirmar: q('[data-modal="confirmar"]'),
  tituloConfirmar: q("#titulo-confirmar"),
  textoConfirmar: q("#texto-confirmar"),
  btnConfirmar: q(".btn-confirmar"),
};
