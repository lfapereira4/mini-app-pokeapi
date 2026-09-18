/* ============================================================
   1. SELEÇÃO DE ELEMENTOS DO DOM
   ------------------------------------------------------------
   document.getElementById(id) procura, no HTML já carregado, o
   elemento com aquele "id" e devolve uma referência a ele. Fazemos
   isso uma vez só, no topo do arquivo, e guardamos em constantes —
   assim não precisamos ficar procurando o mesmo elemento de novo
   toda vez que formos usá-lo.
   ============================================================ */

const form = document.getElementById("form-busca");
const input = document.getElementById("input-personagem");
const mensagemStatus = document.getElementById("mensagem-status");
const resultado = document.getElementById("resultado");
const botaoSom = document.getElementById("botao-som");

// Elementos onde vamos escrever os dados do personagem
const personagemImagem = document.getElementById("personagem-imagem");
const personagemNome = document.getElementById("personagem-nome");
const personagemNumero = document.getElementById("personagem-numero");
const personagemEspecie = document.getElementById("personagem-especie");
const personagemStatus = document.getElementById("personagem-status");
const personagemGenero = document.getElementById("personagem-genero");
const personagemOrigem = document.getElementById("personagem-origem");

// Extra decorativo (não é requisito da atividade): quando o ID do
// personagem da Rick and Morty API bate com um destes números,
// mostramos a foto/som de um Pokémon no lugar da foto real. Um
// "Set" foi escolhido (em vez de um Array) porque procurar um valor
// dentro dele (.has()) é mais rápido e o código fica mais claro.
// São os personagens de ID 1 a 10, mais 10 "lendários":
// 144 Articuno, 145 Zapdos, 146 Moltres, 150 Mewtwo, 151 Mew,
// 249 Lugia, 250 Ho-Oh, 384 Rayquaza, 483 Dialga, 484 Palkia.
const IDS_COM_POKEMON = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  144, 145, 146, 150, 151, 249, 250, 384, 483, 484,
]);


/* ============================================================
   2. TRATAMENTO DE EVENTO (Requisito 3)
   ------------------------------------------------------------
   "submit" é o evento disparado quando o usuário aperta Enter no
   campo de texto OU clica no botão "Buscar" dentro do <form>.
   ============================================================ */

// Expressão regular que valida o texto digitado:
//   ^            início do texto
//   [ ]          um "conjunto" de caracteres permitidos:
//     \p{L}        qualquer LETRA de qualquer idioma (inclui
//                  acentos: á, ê, ç...) — o "\p{...}" só funciona
//                  com a flag "u" (unicode) no final da regex
//     0-9          dígitos
//     \s           espaços em branco
//   +            um ou mais desses caracteres
//   $            fim do texto
// Ou seja: só aceita letras, números e espaços — bloqueia símbolos
// como / ? < > que poderiam quebrar a URL da requisição.
const PADRAO_VALIDO = /^[\p{L}0-9\s]+$/u;

form.addEventListener("submit", function (event) {
  // Por padrão, o navegador recarregaria a página inteira ao
  // submeter um formulário (comportamento padrão do HTML). Isso
  // destruiria todo o estado da nossa aplicação JavaScript, então
  // cancelamos esse comportamento com preventDefault().
  event.preventDefault();

  // .trim() remove espaços em branco extras no início/fim do texto
  // digitado (ex: " pikachu " vira "pikachu")
  const termoDigitado = input.value.trim();

  // Se o campo estiver vazio depois do trim(), não faz nada
  if (termoDigitado === "") {
    return;
  }

  // Se o texto tiver caractere fora do padrão permitido (símbolos),
  // mostra erro e NÃO chega a fazer a requisição
  if (!PADRAO_VALIDO.test(termoDigitado)) {
    exibirErro("Digite apenas letras e números (sem símbolos ou espaços especiais).");
    return;
  }

  // .toLowerCase() por padronização, antes de enviar pro backend
  buscarPersonagem(termoDigitado.toLowerCase());
});

// Extra decorativo: clique no botão "Ouvir" toca o grito do Pokémon
// correspondente, que já está salvo localmente na pasta
// "public/audio/pokemon/" (não é uma chamada de API).
botaoSom.addEventListener("click", function () {
  // "dataset" lê atributos "data-*" do elemento HTML. Guardamos o
  // ID do personagem em "data-id" (veja exibirResultado() abaixo),
  // e aqui recuperamos com botaoSom.dataset.id.
  const id = botaoSom.dataset.id;
  if (id) {
    // Cria um objeto Audio novo a cada clique e manda tocar.
    // Template literal (crase) monta o caminho do arquivo dinamicamente.
    new Audio(`audio/pokemon/${id}.ogg`).play();
  }
});


/* ============================================================
   3. FUNÇÃO ASSÍNCRONA QUE CONSOME A NOSSA API (Requisitos 4, 5, 6, 8, 9)
   ------------------------------------------------------------
   Importante: este fetch() NÃO vai direto na Rick and Morty API —
   ele chama uma rota do NOSSO PRÓPRIO servidor (server.js), que por
   sua vez é quem conversa com a API externa. Por isso a URL aqui é
   relativa ("/api/personagem/...") e não "https://rickandmorty...".

   Por que a função é "async"? Porque usamos "await" dentro dela, e
   "await" só é permitido em funções declaradas com "async". Isso
   deixa o código assíncrono (que depende de rede, com tempo de
   resposta indeterminado) mais fácil de ler — parece código
   sequencial de cima a baixo, em vez de vários .then() encadeados.
   ============================================================ */

async function buscarPersonagem(termo) {
  // Requisito 9: feedback de carregamento, mostrado ANTES do fetch
  mostrarCarregando();

  try {
    // encodeURIComponent() escapa caracteres especiais do termo
    // digitado (espaços, acentos, etc.) antes de colocá-lo na URL —
    // evita que a requisição quebre ou interprete algo errado.
    const termoCodificado = encodeURIComponent(termo);

    // Requisito 4: fetch() para uma rota (que por trás consome uma
    // API REST pública). "await" pausa a função aqui até a resposta
    // do NOSSO servidor chegar. "resposta" é um objeto Response —
    // ainda não são os dados em si, é um "envelope" com o status
    // HTTP e um método .json() pra ler o corpo.
    const resposta = await fetch(`/api/personagem/${termoCodificado}`);

    // Requisito 8: tratamento de erro / resultado inexistente.
    // resposta.ok é "false" para qualquer status fora de 200-299
    // (no nosso caso, 404 ou 500, definidos no server.js).
    if (!resposta.ok) {
      // Tenta ler a mensagem de erro que o SERVIDOR mandou em JSON
      // (ex: { erro: "Personagem não encontrado." }). O .catch(() => ({}))
      // evita quebrar o código caso o corpo não seja um JSON válido.
      const corpoErro = await resposta.json().catch(() => ({}));
      // "throw" interrompe o try e pula direto pro catch abaixo,
      // levando essa mensagem de erro junto.
      throw new Error(corpoErro.erro || "Não foi possível buscar esse personagem.");
    }

    // resposta.json() também é assíncrono: lê o corpo da resposta
    // (texto em formato JSON) e converte para um objeto JavaScript
    // de verdade, que dá pra acessar como dados.name, dados.id etc.
    const dados = await resposta.json();

    // Requisito 6/7: usa os dados JSON pra exibir informações na página
    exibirResultado(dados);

  } catch (erro) {
    // Cai aqui tanto no "throw new Error(...)" feito acima quanto
    // num erro de rede de verdade (ex: servidor local fora do ar).
    // erro.message é o texto que passamos pro Error.
    exibirErro(erro.message);
  }
}


/* ============================================================
   4. MANIPULAÇÃO DO DOM — mostrar o resultado (Requisitos 7, 10)
   ------------------------------------------------------------
   EXTRA (decorativo, não é requisito da atividade): quando
   dados.id está em IDS_COM_POKEMON, trocamos a imagem por um
   sprite ANIMADO (gif) de Pokémon e mostramos um botão pra tocar
   o som/grito dele — arquivos salvos localmente em
   "public/img/pokemon-animado" e "public/audio/pokemon". Os
   dados (nome, espécie, status...) continuam sendo os do
   personagem real, vindos da Rick and Morty API.
   ============================================================ */

function exibirResultado(dados) {
  // .has() do Set: verifica se o ID deste personagem está na lista
  // de IDs que têm uma versão Pokémon associada
  const temExtraPokemon = IDS_COM_POKEMON.has(dados.id);

  // Operador ternário: se tem Pokémon associado, usa o gif animado
  // local; senão, usa a foto real do personagem que veio da API
  // (campo dados.image, montado pelo backend em server.js)
  personagemImagem.src = temExtraPokemon
    ? `img/pokemon-animado/${dados.id}.gif`
    : dados.image;
  personagemImagem.alt = dados.name;

  if (temExtraPokemon) {
    // classList.remove tira a classe "escondido" (display:none),
    // fazendo o botão aparecer
    botaoSom.classList.remove("escondido");
    // dataset.id cria/atualiza o atributo HTML "data-id" no botão,
    // pra sabermos depois (no clique) qual som tocar
    botaoSom.dataset.id = dados.id;
  } else {
    botaoSom.classList.add("escondido");
    // delete remove o atributo data-id quando não há som pra esse personagem
    delete botaoSom.dataset.id;
  }

  // .textContent troca o TEXTO de dentro do elemento (mais seguro
  // que .innerHTML, que interpretaria o texto como código HTML)
  personagemNome.textContent = dados.name;
  // Template literal (crase) monta a string "#123" dinamicamente
  personagemNumero.textContent = `#${dados.id}`;
  personagemEspecie.textContent = dados.species;
  personagemStatus.textContent = dados.status;
  personagemGenero.textContent = dados.gender;
  // dados.origin pode vir como { name: "Earth", url: "..." } ou
  // ausente/nulo — o "&&" evita erro ao tentar ler .name de algo
  // que não existe, e o ternário decide o texto final
  personagemOrigem.textContent = dados.origin && dados.origin.name
    ? dados.origin.name
    : "Desconhecida";

  // Requisito 10: revela o card de resultado (tira "escondido")
  resultado.classList.remove("escondido");
  // Limpa qualquer mensagem de status/erro anterior
  mensagemStatus.textContent = "";
}


/* ============================================================
   5. FEEDBACK DE CARREGAMENTO E DE ERRO (Requisitos 8 e 9)
   ============================================================ */

function mostrarCarregando() {
  mensagemStatus.textContent = "Buscando...";
  // Garante que a mensagem não fique com a cor/estilo de erro
  mensagemStatus.classList.remove("erro");
  // Esconde o resultado anterior enquanto a nova busca acontece
  resultado.classList.add("escondido");
}

function exibirErro(mensagem) {
  mensagemStatus.textContent = mensagem;
  // Adiciona a classe "erro" (definida no CSS) pra destacar o texto
  // em vermelho
  mensagemStatus.classList.add("erro");
  resultado.classList.add("escondido");
}
