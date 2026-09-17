/* ============================================================
   SERVIDOR BACKEND (Node.js + Express)
   ------------------------------------------------------------
   1. Serve os arquivos estáticos do front-end (pasta "public").
   2. Expõe uma rota própria (/api/personagem/:termo) que funciona
      como "ponte" para a Rick and Morty API: o front-end chama
      essa rota, e é o SERVIDOR quem faz o fetch() na API pública,
      usando async/await.
   ============================================================ */

const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("public"));

// Rota própria: GET /api/personagem/rick, /api/personagem/2 etc.
app.get("/api/personagem/:termo", async (req, res) => {
  const termo = req.params.termo.toLowerCase();

  // Se o usuário digitou só números, buscamos pelo ID do personagem
  // (a API devolve o objeto direto). Se digitou um nome, usamos o
  // parâmetro de busca "?name=" (a API devolve uma LISTA de resultados
  // dentro de "results", então pegamos o primeiro).
  const ehNumero = /^\d+$/.test(termo);
  const url = ehNumero
    ? `https://rickandmortyapi.com/api/character/${termo}`
    : `https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(termo)}`;

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      return res.status(404).json({ erro: "Personagem não encontrado." });
    }

    const dados = await resposta.json();

    // Por ID a API retorna o personagem direto; por nome, retorna
    // { info: {...}, results: [...] } e pegamos o primeiro resultado
    const personagem = ehNumero ? dados : dados.results[0];

    if (!personagem) {
      return res.status(404).json({ erro: "Personagem não encontrado." });
    }

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
    res.status(500).json({ erro: "Erro ao consultar a Rick and Morty API." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
