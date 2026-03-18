const inputTarefa = document.querySelector('.input-tarefa');
const btnTarefa = document.querySelector('.btn-tarefa');
const listaTarefas = document.querySelector('.tarefas');

let tarefas = [];

function gerarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
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
    texto: textoLimpo
  };

  tarefas.push(novaTarefa);
  renderizarTarefas();
  limparInput();
}

function criarElementoTarefa(tarefa) {
  const li = document.createElement('li');
  li.classList.add('tarefa');
  li.dataset.id = tarefa.id;

  li.innerHTML = `
    <div class="tarefa-conteudo">
      <span class="tarefa-texto">${tarefa.texto}</span>
    </div>
  `;

  return li;
}

function renderizarTarefas() {
  listaTarefas.textContent = '';

  tarefas.forEach(tarefa => {
    const li = criarElementoTarefa(tarefa);
    listaTarefas.appendChild(li);
  });
}

btnTarefa.addEventListener('click', () => {
  adicionarTarefa(inputTarefa.value);
});

inputTarefa.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    adicionarTarefa(inputTarefa.value);
  }
});