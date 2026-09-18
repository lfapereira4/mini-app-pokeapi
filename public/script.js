/* ============================================================
   1. SELEÇÃO DE ELEMENTOS DO DOM
   ============================================================ */

const form = document.getElementById("form-busca");
const input = document.getElementById("input-personagem");
const mensagemStatus = document.getElementById("mensagem-status");
const resultado = document.getElementById("resultado");
const botaoSom = document.getElementById("botao-som");

const personagemImagem = document.getElementById("personagem-imagem");
const personagemNome = document.getElementById("personagem-nome");
const personagemNumero = document.getElementById("personagem-numero");
const personagemEspecie = document.getElementById("personagem-especie");
const personagemStatus = document.getElementById("personagem-status");
const personagemGenero = document.getElementById("personagem-genero");
const personagemOrigem = document.getElementById("personagem-origem");

// Extra decorativo: quando o ID do personagem coincide com um destes,
// mostramos a foto/som de um Pokémon no lugar (1 a 10, mais 10 lendários)
const IDS_COM_POKEMON = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  144, 145, 146, 150, 151, 249, 250, 384, 483, 484,
]);

/* ============================================================
   2. TRATAMENTO DE EVENTO (Requisito 3)
   ============================================================ */

const PADRAO_VALIDO = /^[\p{L}0-9\s]+$/u;

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const termoDigitado = input.value.trim();

  if (termoDigitado === "") {
    return;
  }

  if (!PADRAO_VALIDO.test(termoDigitado)) {
    exibirErro("Digite apenas letras e números (sem símbolos ou espaços especiais).");
    return;
  }

  buscarPersonagem(termoDigitado.toLowerCase());
});

// Extra decorativo: clique no botão "Ouvir" toca o som salvo localmente
botaoSom.addEventListener("click", function () {
  const id = botaoSom.dataset.id;
  if (id) {
    new Audio(`audio/pokemon/${id}.ogg`).play();
  }
});

/* ============================================================
   3. FUNÇÃO ASSÍNCRONA QUE CONSOME A NOSSA API (Requisitos 4, 5, 6, 8, 9)
   ============================================================ */

async function buscarPersonagem(termo) {
  mostrarCarregando();

  try {
    const termoCodificado = encodeURIComponent(termo);
    const resposta = await fetch(`/api/personagem/${termoCodificado}`);

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
   ------------------------------------------------------------
   EXTRA (decorativo, não é requisito da atividade): quando
   dados.id está em IDS_COM_POKEMON, trocamos a imagem por uma
   foto de Pokémon e mostramos um botão pra tocar o som/grito
   dele — arquivos salvos localmente em "public/img/pokemon" e
   "public/audio/pokemon". Os dados (nome, espécie, status...)
   continuam sendo os do personagem real, vindos da Rick and
   Morty API.
   ============================================================ */

function exibirResultado(dados) {
  const temExtraPokemon = IDS_COM_POKEMON.has(dados.id);

  personagemImagem.src = temExtraPokemon
    ? `img/pokemon/${dados.id}.png`
    : dados.image;
  personagemImagem.alt = dados.name;

  if (temExtraPokemon) {
    botaoSom.classList.remove("escondido");
    botaoSom.dataset.id = dados.id;
  } else {
    botaoSom.classList.add("escondido");
    delete botaoSom.dataset.id;
  }

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
