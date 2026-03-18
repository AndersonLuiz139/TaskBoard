const inputTarefa = document.querySelector('.input-tarefa');
const btnTarefa = document.querySelector('.btn-tarefa');
const listaTarefas = document.querySelector('.tarefas');
const filtros = document.querySelectorAll('.filtro');
const totalElement = document.querySelector('#total');
const mensagemVazia = document.querySelector('.mensagem-vazia');
const btnLimpar = document.querySelector('.btn-limpar');

let tarefas = [];
let filtroAtual = 'todas';

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
    removerTarefa(id);
  }

  if (e.target.classList.contains('btn-concluir')) {
    alternarConclusao(id);
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

carregarTarefas();
renderizarTarefas();