/* ============================================================
   1. SELEÇÃO DE ELEMENTOS DO DOM
   ============================================================ */

const form = document.getElementById("form-busca");
const input = document.getElementById("input-personagem");
const mensagemStatus = document.getElementById("mensagem-status");
const resultado = document.getElementById("resultado");

const personagemImagem = document.getElementById("personagem-imagem");
const personagemNome = document.getElementById("personagem-nome");
const personagemNumero = document.getElementById("personagem-numero");
const personagemEspecie = document.getElementById("personagem-especie");
const personagemStatus = document.getElementById("personagem-status");
const personagemGenero = document.getElementById("personagem-genero");
const personagemOrigem = document.getElementById("personagem-origem");

/* ============================================================
   2. TRATAMENTO DE EVENTO (Requisito 3)
   ============================================================ */

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const termoDigitado = input.value.trim().toLowerCase();

  if (termoDigitado === "") {
    return;
  }

  buscarPersonagem(termoDigitado);
});

/* ============================================================
   3. FUNÇÃO ASSÍNCRONA QUE CONSOME A NOSSA API (Requisitos 4, 5, 6, 8, 9)
   ------------------------------------------------------------
   O front-end chama a rota própria do backend (/api/personagem/:termo).
   É o servidor Node.js/Express quem conversa com a Rick and Morty API
   por trás dos panos (veja server.js).
   ============================================================ */

async function buscarPersonagem(termo) {
  mostrarCarregando();

  try {
    const resposta = await fetch(`/api/personagem/${termo}`);

    if (!resposta.ok) {
      const corpoErro = await resposta.json().catch(() => ({}));
      throw new Error(corpoErro.erro || "Não foi possível buscar esse personagem.");
    }

    const dados = await resposta.json();

    exibirResultado(dados);

  } catch (erro) {
    exibirErro(erro.message);
  }
}

/* ============================================================
   4. MANIPULAÇÃO DO DOM — mostrar o resultado (Requisitos 7, 10)
   ============================================================ */

function exibirResultado(dados) {
  personagemImagem.src = dados.image;
  personagemImagem.alt = dados.name;

  personagemNome.textContent = dados.name;
  personagemNumero.textContent = `#${dados.id}`;
  personagemEspecie.textContent = dados.species;
  personagemStatus.textContent = dados.status;
  personagemGenero.textContent = dados.gender;
  personagemOrigem.textContent = dados.origin && dados.origin.name
    ? dados.origin.name
    : "Desconhecida";

  resultado.classList.remove("escondido");
  mensagemStatus.textContent = "";
}

/* ============================================================
   5. FEEDBACK DE CARREGAMENTO E DE ERRO (Requisitos 8 e 9)
   ============================================================ */

function mostrarCarregando() {
  mensagemStatus.textContent = "Buscando...";
  mensagemStatus.classList.remove("erro");
  resultado.classList.add("escondido");
}

function exibirErro(mensagem) {
  mensagemStatus.textContent = mensagem;
  mensagemStatus.classList.add("erro");
  resultado.classList.add("escondido");
}
