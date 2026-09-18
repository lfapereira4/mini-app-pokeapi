/* ============================================================
   SERVIDOR BACKEND (Node.js + Express)
   ------------------------------------------------------------
   Este arquivo roda no COMPUTADOR (servidor), não no navegador.
   Ele tem duas responsabilidades:

   1. Servir os arquivos do front-end (HTML, CSS, JS) que ficam
      dentro da pasta "public" — é o que faz o navegador conseguir
      abrir http://localhost:3000 e ver a página.

   2. Expor uma ROTA PRÓPRIA (/api/personagem/:termo) que funciona
      como uma "ponte" (proxy) para a Rick and Morty API: o
      front-end (script.js) chama essa rota do NOSSO servidor, e é
      o SERVIDOR quem realmente faz o fetch() na API pública lá
      fora, usando async/await — exatamente como pediu o professor
      (rota própria em Node/Express que consome uma API externa).
   ============================================================ */

// "require" importa um módulo Node.js instalado via npm (está em
// node_modules/, listado em package.json). O Express é um framework
// que facilita criar um servidor HTTP e definir rotas.
const express = require("express");

// Cria a aplicação Express — é esse objeto "app" que vamos configurar
// (rotas, middlewares) e depois colocar pra "escutar" numa porta.
const app = express();

// Porta onde o servidor vai rodar. Depois de "npm start", o site
// fica disponível em http://localhost:3000
const PORT = 3000;

// Middleware embutido do Express: serve automaticamente qualquer
// arquivo dentro da pasta "public" (index.html, style.css, script.js,
// imagens, áudios...) como se fosse um servidor de arquivos estáticos.
// É por isso que basta abrir http://localhost:3000 e o index.html
// aparece sozinho, sem precisar de rota manual pra ele.
app.use(express.static("public"));

// Define uma rota GET própria. ":termo" é um "route parameter":
// tudo que vier depois de /api/personagem/ na URL vira
// req.params.termo. Ex: /api/personagem/rick -> termo = "rick".
// A função é "async" porque dentro dela usamos "await".
app.get("/api/personagem/:termo", async (req, res) => {
  // .toLowerCase() só por padronização (não é obrigatório pra API,
  // mas evita problemas se o usuário digitar com maiúsculas)
  const termo = req.params.termo.toLowerCase();

  // Testa se o texto digitado é SÓ dígitos (regex: começo, um ou
  // mais números, fim). Isso decide qual formato de URL da Rick and
  // Morty API vamos usar.
  const ehNumero = /^\d+$/.test(termo);

  // Operador ternário (condição ? valorSeVerdadeiro : valorSeFalso):
  // - Se for número: a API devolve UM personagem direto, pelo ID.
  // - Se for nome: usamos o parâmetro de busca "?name=", e a API
  //   devolve uma LISTA de resultados parecidos (pode haver mais de
  //   um personagem com nomes semelhantes).
  // encodeURIComponent() escapa caracteres especiais (espaço, acento
  // etc.) pra não quebrar a URL da requisição.
  const url = ehNumero
    ? `https://rickandmortyapi.com/api/character/${termo}`
    : `https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(termo)}`;

  // try/catch: qualquer erro dentro do try (rede fora do ar, JSON
  // inválido etc.) é capturado no catch, sem derrubar o servidor.
  try {
    // fetch() faz a requisição HTTP para a API externa. "await" pausa
    // a execução desta função (só ELA, não o servidor inteiro) até a
    // resposta chegar. "resposta" é um objeto Response: tem o status
    // HTTP (200, 404...) mas AINDA não é o JSON em si.
    const resposta = await fetch(url);

    // resposta.ok é "false" pra qualquer status fora da faixa
    // 200-299. Se a Rick and Morty API não achou nada, devolve 404,
    // e nós replicamos esse erro pro front-end com uma mensagem clara.
    // "return" aqui encerra a função na hora, sem continuar o resto.
    if (!resposta.ok) {
      return res.status(404).json({ erro: "Personagem não encontrado." });
    }

    // resposta.json() lê o corpo da resposta (texto em formato JSON)
    // e converte pra um objeto/array JavaScript de verdade. Também é
    // assíncrono, por isso o segundo "await".
    const dados = await resposta.json();

    // Por ID a API retorna o personagem direto (um objeto). Por nome,
    // retorna { info: {...}, results: [...] }, então pegamos o
    // primeiro item da lista de resultados.
    const personagem = ehNumero ? dados : dados.results[0];

    // Cobre o caso de uma busca por nome que não encontrou ninguém
    // (results seria uma lista vazia, e results[0] seria undefined).
    if (!personagem) {
      return res.status(404).json({ erro: "Personagem não encontrado." });
    }

    // Reempacota só os campos que o front-end precisa, num JSON mais
    // simples e organizado — o front-end não precisa conhecer todos
    // os campos "brutos" que a Rick and Morty API devolve.
    res.json({
      id: personagem.id,
      name: personagem.name,
      image: personagem.image,
      species: personagem.species,
      status: personagem.status,
      gender: personagem.gender,
      origin: personagem.origin,
    });

  } catch (erro) {
    // Cai aqui em caso de erro de rede real (ex: sem internet, DNS
    // falhou) — devolve status 500 (erro interno do servidor).
    res.status(500).json({ erro: "Erro ao consultar a Rick and Morty API." });
  }
});

// Coloca o servidor pra "escutar" requisições na porta definida.
// O callback só roda uma vez, quando o servidor termina de subir.
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
