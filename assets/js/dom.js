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

  modalEditarOverlay: q(".modal-editar-overlay"),
  inputEditar: q(".input-editar"),
  btnCancelar: q(".btn-cancelar"),
  btnSalvar: q(".btn-salvar"),

  modalApagarOverlay: q(".modal-apagar-overlay"),
  btnCancelarApagar: q(".btn-cancelar-apagar"),
  btnConfirmarApagar: q(".btn-confirmar-apagar"),
};
