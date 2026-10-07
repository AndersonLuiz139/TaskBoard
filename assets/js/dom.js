// Referências de DOM
const q = (seletor) => document.querySelector(seletor);

export const elementos = {
  inputTarefa: q(".input-tarefa"),
  btnTarefa: q(".btn-tarefa"),
  novaPrioridade: q("#nova-prioridade"),
  novaPrazo: q("#nova-prazo"),
  novaTags: q("#nova-tags"),
  listaTarefas: q(".tarefas"),
  filtros: [...document.querySelectorAll(".filtro")],
  total: q("#total"),
  mensagemVazia: q(".mensagem-vazia"),
  btnLimpar: q(".btn-limpar"),
  toasts: q(".toasts"),

  modalEditar: q('[data-modal="editar"]'),
  inputEditar: q(".input-editar"),
  editarPrioridade: q("#editar-prioridade"),
  editarPrazo: q("#editar-prazo"),
  editarTags: q("#editar-tags"),
  btnSalvar: q(".btn-salvar"),

  modalConfirmar: q('[data-modal="confirmar"]'),
  tituloConfirmar: q("#titulo-confirmar"),
  textoConfirmar: q("#texto-confirmar"),
  btnConfirmar: q(".btn-confirmar"),
};
