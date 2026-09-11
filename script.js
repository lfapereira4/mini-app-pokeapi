/* ============================================================
   1. SELEÇÃO DE ELEMENTOS DO DOM
   ------------------------------------------------------------
   Guardamos em variáveis as referências aos elementos HTML que
   vamos ler ou alterar depois. Fazemos isso uma vez só, no
   início do arquivo, para não ficar chamando document.getElementById
   toda vez que precisarmos do mesmo elemento.
   ============================================================ */

const form = document.getElementById("form-busca");
const input = document.getElementById("input-pokemon");
const mensagemStatus = document.getElementById("mensagem-status");
const resultado = document.getElementById("resultado");

const pokemonImagem = document.getElementById("pokemon-imagem");
const pokemonNome = document.getElementById("pokemon-nome");
const pokemonNumero = document.getElementById("pokemon-numero");
const pokemonTipos = document.getElementById("pokemon-tipos");
const pokemonPeso = document.getElementById("pokemon-peso");
const pokemonAltura = document.getElementById("pokemon-altura");
const pokemonHabilidades = document.getElementById("pokemon-habilidades");


/* ============================================================
   2. TRATAMENTO DE EVENTO (Requisito 3)
   ------------------------------------------------------------
   "submit" é o evento disparado quando o usuário aperta Enter no
   input ou clica no botão "Buscar" dentro do <form>.
   event.preventDefault() é essencial: sem ele, o navegador tentaria
   recarregar a página (comportamento padrão de formulários), o que
   destruiria tudo que fizemos em JavaScript.
   ============================================================ */

form.addEventListener("submit", function (event) {
  event.preventDefault();

  // .trim() remove espaços em branco no início/fim
  // .toLowerCase() porque a PokéAPI espera o nome em minúsculas
  const nomeDigitado = input.value.trim().toLowerCase();

  if (nomeDigitado === "") {
    return; // não faz nada se o campo estiver vazio
  }

  buscarPokemon(nomeDigitado);
});

/* ============================================================
   3. FUNÇÃO ASSÍNCRONA QUE CONSOME A API (Requisitos 4, 5, 6, 8, 9)
   ------------------------------------------------------------
   Por que "async"? Porque dentro dela usamos "await", que só pode
   ser usado em funções marcadas como async. "async/await" é uma
   forma de escrever código assíncrono (que depende de uma resposta
   de rede, que demora um tempo indeterminado) como se fosse
   código sequencial, de cima para baixo — mais fácil de ler do
   que usar .then() encadeado.
   ============================================================ */

async function buscarPokemon(nome) {
  // Requisito 9: feedback de carregamento
  mostrarCarregando();

  try {
    // Requisito 4: chamada fetch() para uma API REST pública
    // "resposta" é um objeto Response: contém o status HTTP (200, 404...)
    // e o corpo da requisição, mas AINDA NÃO é o JSON em si.
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);

    // Requisito 8: tratar erro de requisição / pokémon inexistente
    // Quando a PokéAPI não encontra o pokémon, ela responde com
    // status 404. response.ok é "false" para qualquer status fora
    // da faixa 200-299, então usamos isso para detectar o erro.
    if (!resposta.ok) {
      throw new Error("Pokémon não encontrado. Verifique o nome ou número digitado.");
    }

    // resposta.json() também é assíncrono (retorna uma Promise),
    // por isso usamos "await" de novo: ele espera o corpo da
    // resposta ser lido por completo e convertido de texto (JSON)
    // para um objeto JavaScript comum, que podemos manipular.
    const dados = await resposta.json();

    // Requisito 6/7: usar os dados JSON e exibir pelo menos 3
    // informações dinamicamente na página
    exibirResultado(dados);

  } catch (erro) {
    // Cai aqui tanto em erro de rede (sem internet, API fora do ar)
    // quanto no "throw new Error(...)" feito acima
    exibirErro(erro.message);
  }
}

/* ============================================================
   4. MANIPULAÇÃO DO DOM — mostrar o resultado (Requisitos 7, 10)
   ------------------------------------------------------------
   Aqui pegamos o objeto "dados" (já convertido de JSON) e usamos
   seus campos para preencher o HTML que já existe na página,
   em vez de criar uma página nova ou só usar console.log.
   ============================================================ */

function exibirResultado(dados) {
  pokemonImagem.src = dados.sprites.front_default;
  pokemonImagem.alt = dados.name;

  pokemonNome.textContent = capitalizar(dados.name);
  pokemonNumero.textContent = `#${dados.id}`;

  // dados.types é um array de objetos; usamos .map() para pegar
  // só o nome de cada tipo e .join(", ") para juntar tudo em texto
  pokemonTipos.textContent = dados.types
    .map((t) => capitalizar(t.type.name))
    .join(", ");

  // A PokéAPI retorna peso em hectogramas e altura em decímetros,
  // por isso dividimos por 10 para converter em kg e metros
  pokemonPeso.textContent = `${dados.weight / 10} kg`;
  pokemonAltura.textContent = `${dados.height / 10} m`;

  pokemonHabilidades.textContent = dados.abilities
    .map((a) => capitalizar(a.ability.name))
    .join(", ");

  resultado.classList.remove("escondido");
  resultado.classList.remove("erro-card");
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

/* ============================================================
   6. FUNÇÃO AUXILIAR (só formatação de texto, não é requisito)
   ============================================================ */

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
