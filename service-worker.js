// Service worker
//
//   Estratégia: rede primeiro, cache como reserva.
//   Ao mudar arquivos, suba VERSAO.

const VERSAO = "taskboard-v1";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/style.css",
  "./assets/js/main.js",
  "./assets/js/constantes.js",
  "./assets/js/tarefas.js",
  "./assets/js/storage.js",
  "./assets/js/estado.js",
  "./assets/js/dom.js",
  "./assets/js/render.js",
  "./assets/js/modais.js",
  "./assets/js/toast.js",
  "./assets/js/tema.js",
  "./assets/js/formato.js",
  "./assets/img/favicon.png",
  "./assets/img/icone-192.png",
  "./assets/img/icone-512.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(VERSAO)
      .then((cache) => Promise.all(ARQUIVOS.map((arquivo) => cache.add(arquivo).catch(() => null))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves.filter((chave) => chave !== VERSAO).map((chave) => caches.delete(chave)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const { request } = evento;

  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  evento.respondWith(
    fetch(request)
      .then((resposta) => {
        const copia = resposta.clone();

        caches.open(VERSAO).then((cache) => cache.put(request, copia));

        return resposta;
      })
      .catch(async () => {
        const emCache = await caches.match(request);

        if (emCache) return emCache;

        if (request.mode === "navigate") {
          const raiz = await caches.match("./index.html");

          if (raiz) return raiz;
        }

        return Response.error();
      }),
  );
});
