// Testes das regras de domínio
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  alternarConclusao,
  criarTarefa,
  editarTarefa,
  estaAtrasada,
  hojeISO,
  normalizarPrazo,
  normalizarTags,
  separarTextoETags,
  filtrarTarefas,
  gerarId,
  limparConcluidas,
  removerTarefa,
} from "../assets/js/tarefas.js";

const tarefa = (id, texto, concluida = false, extra = {}) => ({
  id,
  texto,
  concluida,
  criadaEm: "2026-01-01T10:00:00.000Z",
  prioridade: "media",
  prazo: null,
  tags: [],
  ...extra,
});

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
    const nova = criarTarefa({ texto: "  comprar pão  " });

    assert.equal(nova.texto, "comprar pão");
    assert.equal(nova.concluida, false);
    assert.ok(nova.id);
    assert.ok(nova.criadaEm);
  });

  it("cai na prioridade padrão quando o valor é inválido", () => {
    assert.equal(criarTarefa({ texto: "x", prioridade: "urgentíssima" }).prioridade, "media");
    assert.equal(criarTarefa({ texto: "x", prioridade: "alta" }).prioridade, "alta");
  });

  it("aceita só prazo no formato AAAA-MM-DD", () => {
    assert.equal(criarTarefa({ texto: "x", prazo: "30/09/2026" }).prazo, null);
    assert.equal(criarTarefa({ texto: "x", prazo: "2026-09-30" }).prazo, "2026-09-30");
  });
});

describe("hojeISO", () => {
  it("usa a data local, não UTC", () => {
    assert.equal(hojeISO(new Date(2026, 2, 15, 1, 0, 0)), "2026-03-15");
  });
});

describe("normalizarTags", () => {
  it("remove cerquilha, caixa alta e repetidas", () => {
    assert.deepEqual(normalizarTags("#Casa, casa , MERCADO"), ["casa", "mercado"]);
  });

  it("limita a cinco", () => {
    assert.equal(normalizarTags("a b c d e f g").length, 5);
  });
});

describe("normalizarPrazo", () => {
  it("recusa o que não for data válida", () => {
    assert.equal(normalizarPrazo("2026-13-45"), null);
    assert.equal(normalizarPrazo(""), null);
    assert.equal(normalizarPrazo(null), null);
    assert.equal(normalizarPrazo("2026-09-30"), "2026-09-30");
  });
});

describe("separarTextoETags", () => {
  it("extrai as tags escritas no texto", () => {
    assert.deepEqual(separarTextoETags("comprar pão #casa #mercado"), {
      texto: "comprar pão",
      tags: ["casa", "mercado"],
    });
  });

  it("mantém o texto quando só há tags", () => {
    assert.deepEqual(separarTextoETags("#casa"), { texto: "#casa", tags: [] });
  });
});

describe("estaAtrasada", () => {
  const hoje = "2026-03-15";

  it("só vale para tarefa pendente com prazo vencido", () => {
    assert.equal(estaAtrasada(tarefa("1", "x", false, { prazo: "2026-03-14" }), hoje), true);
    assert.equal(estaAtrasada(tarefa("2", "x", false, { prazo: "2026-03-15" }), hoje), false);
    assert.equal(estaAtrasada(tarefa("3", "x", true, { prazo: "2026-03-14" }), hoje), false);
    assert.equal(estaAtrasada(tarefa("4", "x"), hoje), false);
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

describe("editarTarefa", () => {
  const lista = [
    tarefa("1", "comprar pão", false, { prioridade: "alta", tags: ["casa"] }),
    tarefa("2", "pagar conta"),
  ];

  it("troca o texto e apara os espaços", () => {
    const nova = editarTarefa(lista, "1", { texto: "  comprar pão integral  " });

    assert.equal(nova[0].texto, "comprar pão integral");
    assert.equal(nova[1].texto, "pagar conta");
  });

  it("altera só os campos informados", () => {
    const [nova] = editarTarefa(lista, "1", { prazo: "2026-05-01" });

    assert.equal(nova.prazo, "2026-05-01");
    assert.equal(nova.prioridade, "alta");
    assert.deepEqual(nova.tags, ["casa"]);
  });

  it("preserva o estado de concluída", () => {
    const concluida = [tarefa("1", "comprar pão", true)];

    assert.equal(editarTarefa(concluida, "1", { texto: "outro" })[0].concluida, true);
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
