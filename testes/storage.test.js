// Testes da persistência
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  carregarTarefas,
  criarDepositoMemoria,
  normalizarTarefa,
  salvarTarefas,
} from "../assets/js/storage.js";
import { CHAVE_BACKUP, CHAVE_LEGADA, CHAVE_TAREFAS } from "../assets/js/constantes.js";

const comConteudo = (chave, valor) => {
  const deposito = criarDepositoMemoria();

  deposito.setItem(chave, valor);

  return deposito;
};

describe("normalizarTarefa", () => {
  it("descarta o que não dá para aproveitar", () => {
    assert.equal(normalizarTarefa(null), null);
    assert.equal(normalizarTarefa("texto solto"), null);
    assert.equal(normalizarTarefa(42), null);
    assert.equal(normalizarTarefa({ texto: "   " }), null);
    assert.equal(normalizarTarefa({ id: "1" }), null);
  });

  it("apara o texto e converte concluida para booleano", () => {
    const tarefa = normalizarTarefa({ id: "abc", texto: "  comprar pão  ", concluida: 1 });

    assert.equal(tarefa.texto, "comprar pão");
    assert.equal(tarefa.concluida, true);
  });

  it("regenera id que não seja texto", () => {
    const tarefa = normalizarTarefa({ id: 1742212345678, texto: "x" });

    assert.equal(typeof tarefa.id, "string");
    assert.notEqual(tarefa.id, "1742212345678");
  });
});

describe("carregarTarefas", () => {
  it("devolve lista vazia quando não há nada salvo", () => {
    assert.deepEqual(carregarTarefas(criarDepositoMemoria()), { tarefas: [], aviso: null });
  });

  it("isola o conteúdo corrompido em vez de lançar", () => {
    const deposito = comConteudo(CHAVE_TAREFAS, "{isso nao e json");

    const { tarefas, aviso } = carregarTarefas(deposito);

    assert.deepEqual(tarefas, []);
    assert.match(aviso, /corrompidos/i);
    assert.equal(deposito.getItem(CHAVE_BACKUP), "{isso nao e json");
  });

  it("migra o array cru da chave antiga", () => {
    const deposito = comConteudo(
      CHAVE_LEGADA,
      JSON.stringify([
        { id: 1, texto: "comprar pão", concluida: false },
        { id: 2, texto: "pagar conta", concluida: true },
      ]),
    );

    const { tarefas, aviso } = carregarTarefas(deposito);

    assert.equal(tarefas.length, 2);
    assert.equal(tarefas[1].concluida, true);
    assert.match(aviso, /migradas/i);
    assert.equal(deposito.getItem(CHAVE_LEGADA), null);
    assert.equal(JSON.parse(deposito.getItem(CHAVE_TAREFAS)).versao, 2);
  });

  it("regenera ids repetidos", () => {
    const deposito = comConteudo(
      CHAVE_TAREFAS,
      JSON.stringify({
        versao: 2,
        tarefas: [
          { id: "igual", texto: "a", concluida: false },
          { id: "igual", texto: "b", concluida: false },
        ],
      }),
    );

    const { tarefas } = carregarTarefas(deposito);

    assert.notEqual(tarefas[0].id, tarefas[1].id);
  });

  it("descarta registros inválidos e informa quantos", () => {
    const deposito = comConteudo(
      CHAVE_TAREFAS,
      JSON.stringify({ versao: 2, tarefas: [{ texto: "ok" }, null, { texto: "" }, 42] }),
    );

    const { tarefas, aviso } = carregarTarefas(deposito);

    assert.equal(tarefas.length, 1);
    assert.match(aviso, /3 registro/i);
  });

  it("não avisa nada quando o formato já está na versão atual", () => {
    const deposito = comConteudo(
      CHAVE_TAREFAS,
      JSON.stringify({ versao: 2, tarefas: [{ id: "a", texto: "comprar pão" }] }),
    );

    assert.equal(carregarTarefas(deposito).aviso, null);
  });
});

describe("salvarTarefas", () => {
  it("grava com o número da versão", () => {
    const deposito = criarDepositoMemoria();

    salvarTarefas([{ id: "a", texto: "x", concluida: false }], deposito);

    const gravado = JSON.parse(deposito.getItem(CHAVE_TAREFAS));

    assert.equal(gravado.versao, 2);
    assert.equal(gravado.tarefas.length, 1);
  });

  it("avisa quando o armazenamento está cheio, sem lançar", () => {
    const cheio = {
      getItem: () => null,
      removeItem: () => {},
      setItem: () => {
        const erro = new Error("cheio");
        erro.name = "QuotaExceededError";
        throw erro;
      },
    };

    const { ok, aviso } = salvarTarefas([], cheio);

    assert.equal(ok, false);
    assert.match(aviso, /cheio/i);
  });
});

describe("gravar e ler de volta", () => {
  it("preserva os campos na ida e volta", () => {
    const deposito = criarDepositoMemoria();

    salvarTarefas([{ id: "a", texto: "comprar pão", concluida: true }], deposito);

    const { tarefas, aviso } = carregarTarefas(deposito);

    assert.equal(aviso, null);
    assert.deepEqual(tarefas, [{ id: "a", texto: "comprar pão", concluida: true }]);
  });
});
