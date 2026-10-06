// Testes das regras de domínio
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  alternarConclusao,
  criarTarefa,
  editarTexto,
  filtrarTarefas,
  gerarId,
  limparConcluidas,
  removerTarefa,
} from "../assets/js/tarefas.js";

const tarefa = (id, texto, concluida = false) => ({ id, texto, concluida });

describe("gerarId", () => {
  it("não repete em muitas chamadas seguidas", () => {
    const ids = new Set();

    for (let i = 0; i < 20000; i += 1) ids.add(gerarId());

    assert.equal(ids.size, 20000);
  });

  it("devolve texto", () => {
    assert.equal(typeof gerarId(), "string");
  });
});

describe("criarTarefa", () => {
  it("apara o texto e começa pendente", () => {
    const nova = criarTarefa("  comprar pão  ");

    assert.equal(nova.texto, "comprar pão");
    assert.equal(nova.concluida, false);
    assert.ok(nova.id);
  });
});

describe("filtrarTarefas", () => {
  const lista = [
    tarefa("1", "comprar pão"),
    tarefa("2", "pagar conta", true),
    tarefa("3", "ligar para o médico"),
  ];

  it("devolve tudo em todas", () => {
    assert.equal(filtrarTarefas(lista, "todas").length, 3);
  });

  it("devolve só as pendentes", () => {
    assert.deepEqual(
      filtrarTarefas(lista, "pendentes").map((t) => t.id),
      ["1", "3"],
    );
  });

  it("devolve só as concluídas", () => {
    assert.deepEqual(
      filtrarTarefas(lista, "concluidas").map((t) => t.id),
      ["2"],
    );
  });

  it("não altera a lista recebida", () => {
    const copia = [...lista];

    filtrarTarefas(lista, "pendentes");

    assert.deepEqual(lista, copia);
  });
});

describe("alternarConclusao", () => {
  const lista = [tarefa("1", "comprar pão"), tarefa("2", "pagar conta")];

  it("inverte só a tarefa indicada", () => {
    const nova = alternarConclusao(lista, "1");

    assert.equal(nova[0].concluida, true);
    assert.equal(nova[1].concluida, false);
  });

  it("devolve objetos novos, sem alterar os antigos", () => {
    const nova = alternarConclusao(lista, "1");

    assert.equal(lista[0].concluida, false);
    assert.notEqual(nova[0], lista[0]);
    assert.equal(nova[1], lista[1]);
  });

  it("ignora id inexistente", () => {
    assert.deepEqual(alternarConclusao(lista, "999"), lista);
  });
});

describe("editarTexto", () => {
  const lista = [tarefa("1", "comprar pão"), tarefa("2", "pagar conta")];

  it("troca o texto e apara os espaços", () => {
    const nova = editarTexto(lista, "1", "  comprar pão integral  ");

    assert.equal(nova[0].texto, "comprar pão integral");
    assert.equal(nova[1].texto, "pagar conta");
  });

  it("preserva o estado de concluída", () => {
    const concluida = [tarefa("1", "comprar pão", true)];

    assert.equal(editarTexto(concluida, "1", "outro texto")[0].concluida, true);
  });
});

describe("removerTarefa", () => {
  const lista = [tarefa("1", "comprar pão"), tarefa("2", "pagar conta")];

  it("tira só a tarefa indicada", () => {
    assert.deepEqual(
      removerTarefa(lista, "1").map((t) => t.id),
      ["2"],
    );
  });

  it("ignora id inexistente", () => {
    assert.equal(removerTarefa(lista, "999").length, 2);
  });
});

describe("limparConcluidas", () => {
  it("mantém apenas as pendentes", () => {
    const lista = [
      tarefa("1", "comprar pão", true),
      tarefa("2", "pagar conta"),
      tarefa("3", "ligar", true),
    ];

    assert.deepEqual(
      limparConcluidas(lista).map((t) => t.id),
      ["2"],
    );
  });

  it("devolve lista vazia quando tudo está concluído", () => {
    assert.deepEqual(limparConcluidas([tarefa("1", "x", true)]), []);
  });
});
