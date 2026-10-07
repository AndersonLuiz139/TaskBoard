// Formatação de datas
import { hojeISO } from "./tarefas.js";

const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

const dataCompleta = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function deISO(prazo) {
  return new Date(`${prazo}T00:00:00`);
}

export function rotuloPrazo(prazo, hoje = hojeISO()) {
  const umDia = 24 * 60 * 60 * 1000;
  const dias = Math.round((deISO(prazo).getTime() - deISO(hoje).getTime()) / umDia);

  if (dias === 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  if (dias === -1) return "Atrasada 1 dia";
  if (dias < -1) return `Atrasada ${Math.abs(dias)} dias`;
  if (dias <= 7) return `em ${dias} dias`;

  return `em ${dataCurta.format(deISO(prazo))}`;
}

export function prazoNeutro(prazo) {
  return `Prazo ${dataCurta.format(deISO(prazo))}`;
}

export function prazoCompleto(prazo) {
  return dataCompleta.format(deISO(prazo));
}

export function criadaEmCompleta(iso) {
  const data = new Date(iso);

  return Number.isNaN(data.getTime()) ? "" : dataHora.format(data);
}
