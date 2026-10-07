// Servidor estático local
//
//   node servidor.mjs [porta]
//
//   Módulos ES e service worker exigem http: file:// não funciona.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(fileURLToPath(new URL(".", import.meta.url)));
const porta = Number(process.argv[2]) || 8000;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const servidor = createServer(async (requisicao, resposta) => {
  const caminho = decodeURIComponent(new URL(requisicao.url, "http://localhost").pathname);
  const relativo = normalize(caminho === "/" ? "index.html" : caminho).replace(/^([/\\])+/, "");
  const arquivo = join(raiz, relativo);

  if (!arquivo.startsWith(raiz)) {
    resposta.writeHead(403).end("Acesso negado");
    return;
  }

  try {
    const conteudo = await readFile(arquivo);

    resposta.writeHead(200, {
      "Content-Type": TIPOS[extname(arquivo).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    resposta.end(conteudo);
  } catch {
    resposta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    resposta.end("404 — arquivo não encontrado");
  }
});

servidor.listen(porta, () => {
  console.log(`TaskBoard em http://localhost:${porta}`);
});
