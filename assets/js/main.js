const inputTarefa = document.querySelector('.input-tarefa');
const btnTarefa = document.querySelector('.btn-tarefa');
const listaTarefas = document.querySelector('.tarefas');
const filtros = document.querySelectorAll('.filtro');
const totalElement = document.querySelector('#total');
const mensagemVazia = document.querySelector('.mensagem-vazia');
const btnLimpar = document.querySelector('.btn-limpar');

const modalEditarOverlay = document.querySelector('.modal-editar-overlay');
const inputEditar = document.querySelector('.input-editar');
const btnCancelar = document.querySelector('.btn-cancelar');
const btnSalvar = document.querySelector('.btn-salvar');

const modalApagarOverlay = document.querySelector('.modal-apagar-overlay');
const btnCancelarApagar = document.querySelector('.btn-cancelar-apagar');
const btnConfirmarApagar = document.querySelector('.btn-confirmar-apagar');

let tarefas = [];
let filtroAtual = 'todas';
let tarefaEmEdicaoId = null;
let tarefaParaApagarId = null;

function gerarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function salvarTarefas() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function carregarTarefas() {
  const tarefasSalvas = localStorage.getItem('tarefas');

  if (!tarefasSalvas) {
    tarefas = [];
    return;
  }

  tarefas = JSON.parse(tarefasSalvas);
}

function limparInput() {
  inputTarefa.value = '';
  inputTarefa.focus();
}

function adicionarTarefa(texto) {
  const textoLimpo = texto.trim();

  if (!textoLimpo) return;

  const novaTarefa = {
    id: gerarId(),
    texto: textoLimpo,
    concluida: false
  };

  tarefas.push(novaTarefa);
  salvarTarefas();
  renderizarTarefas();
  limparInput();
}

function removerTarefa(id) {
  tarefas = tarefas.filter(tarefa => tarefa.id !== id);
  salvarTarefas();
  renderizarTarefas();
}

function alternarConclusao(id) {
  tarefas = tarefas.map(tarefa => {
    if (tarefa.id === id) {
      return {
        ...tarefa,
        concluida: !tarefa.concluida
      };
    }

    return tarefa;
  });

  salvarTarefas();
  renderizarTarefas();
}

function abrirModalEdicao(id) {
  const tarefa = tarefas.find(tarefa => tarefa.id === id);
  if (!tarefa) return;

  tarefaEmEdicaoId = id;
  inputEditar.value = tarefa.texto;
  modalEditarOverlay.classList.remove('hidden');
  inputEditar.focus();
}

function fecharModalEdicao() {
  modalEditarOverlay.classList.add('hidden');
  inputEditar.value = '';
  tarefaEmEdicaoId = null;
}

function salvarEdicao() {
  const textoEditado = inputEditar.value.trim();

  if (!textoEditado) {
    alert('A tarefa não pode ficar vazia.');
    return;
  }

  tarefas = tarefas.map(tarefa => {
    if (tarefa.id === tarefaEmEdicaoId) {
      return {
        ...tarefa,
        texto: textoEditado
      };
    }

    return tarefa;
  });

  salvarTarefas();
  renderizarTarefas();
  fecharModalEdicao();
}

function abrirModalApagar(id) {
  tarefaParaApagarId = id;
  modalApagarOverlay.classList.remove('hidden');
}

function fecharModalApagar() {
  modalApagarOverlay.classList.add('hidden');
  tarefaParaApagarId = null;
}

function confirmarApagarTarefa() {
  if (tarefaParaApagarId === null) return;

  removerTarefa(tarefaParaApagarId);
  fecharModalApagar();
}

function limparConcluidas() {
  tarefas = tarefas.filter(tarefa => !tarefa.concluida);
  salvarTarefas();
  renderizarTarefas();
}

function atualizarContador() {
  totalElement.innerText = tarefas.length;
}

function filtrarTarefas(lista) {
  if (filtroAtual === 'pendentes') {
    return lista.filter(tarefa => !tarefa.concluida);
  }

  if (filtroAtual === 'concluidas') {
    return lista.filter(tarefa => tarefa.concluida);
  }

  return lista;
}

function mostrarMensagemVazia(listaFiltrada) {
  mensagemVazia.style.display = listaFiltrada.length === 0 ? 'block' : 'none';
}

function criarElementoTarefa(tarefa) {
  const li = document.createElement('li');
  li.classList.add('tarefa');
  li.dataset.id = tarefa.id;

  if (tarefa.concluida) {
    li.classList.add('concluida');
  }

  li.innerHTML = `
    <div class="tarefa-conteudo">
      <input type="checkbox" class="check-tarefa" ${tarefa.concluida ? 'checked' : ''}>
      <span class="tarefa-texto">${tarefa.texto}</span>
    </div>

    <div class="tarefa-acoes">
      <button class="btn-acao btn-editar">Editar</button>
      <button class="btn-acao btn-concluir">
        ${tarefa.concluida ? 'Desfazer' : 'Concluir'}
      </button>
      <button class="btn-acao btn-apagar">Apagar</button>
    </div>
  `;

  return li;
}

function renderizarTarefas() {
  listaTarefas.innerHTML = '';

  const tarefasFiltradas = filtrarTarefas(tarefas);

  tarefasFiltradas.forEach(tarefa => {
    const li = criarElementoTarefa(tarefa);
    listaTarefas.appendChild(li);
  });

  atualizarContador();
  mostrarMensagemVazia(tarefasFiltradas);
}

btnTarefa.addEventListener('click', () => {
  adicionarTarefa(inputTarefa.value);
});

inputTarefa.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    adicionarTarefa(inputTarefa.value);
  }
});

listaTarefas.addEventListener('click', (e) => {
  const li = e.target.closest('.tarefa');
  if (!li) return;

  const id = Number(li.dataset.id);

  if (e.target.classList.contains('btn-apagar')) {
    abrirModalApagar(id);
  }

  if (e.target.classList.contains('btn-concluir')) {
    alternarConclusao(id);
  }

  if (e.target.classList.contains('btn-editar')) {
    abrirModalEdicao(id);
  }
});

listaTarefas.addEventListener('change', (e) => {
  const li = e.target.closest('.tarefa');
  if (!li) return;

  const id = Number(li.dataset.id);

  if (e.target.classList.contains('check-tarefa')) {
    alternarConclusao(id);
  }
});

filtros.forEach(botao => {
  botao.addEventListener('click', () => {
    filtros.forEach(filtro => filtro.classList.remove('ativo'));
    botao.classList.add('ativo');
    filtroAtual = botao.dataset.filtro;
    renderizarTarefas();
  });
});

btnLimpar.addEventListener('click', () => {
  limparConcluidas();
});

btnCancelar.addEventListener('click', fecharModalEdicao);
btnSalvar.addEventListener('click', salvarEdicao);

inputEditar.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    salvarEdicao();
  }
});

modalEditarOverlay.addEventListener('click', (e) => {
  if (e.target === modalEditarOverlay) {
    fecharModalEdicao();
  }
});

btnCancelarApagar.addEventListener('click', fecharModalApagar);
btnConfirmarApagar.addEventListener('click', confirmarApagarTarefa);

modalApagarOverlay.addEventListener('click', (e) => {
  if (e.target === modalApagarOverlay) {
    fecharModalApagar();
  }
});

carregarTarefas();
renderizarTarefas();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fecharModalEdicao();
    fecharModalApagar();
  }
});