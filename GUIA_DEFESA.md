# Guia de estudo para a defesa (17/09)

O documento da atividade diz que você precisa **explicar**, não só apresentar funcionando. Abaixo estão as perguntas que a professora provavelmente vai fazer (seção 8 da avaliação) já respondidas com base neste código. Estude isto até conseguir responder sem olhar.

### 1. Qual evento inicia a consulta?
O evento `submit` do formulário (`<form id="form-busca">`), capturado em:
```js
form.addEventListener("submit", function (event) { ... });
```
Ele dispara quando o usuário clica no botão "Buscar" ou aperta Enter dentro do campo de texto.

### 2. Onde ocorre a chamada fetch()?
Dentro da função `buscarPokemon(nome)`, na linha:
```js
const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);
```

### 3. O que representa a variável que recebe a resposta da requisição?
A variável `resposta` é um objeto do tipo `Response`. Ela **não é** ainda os dados do Pokémon — é um envelope que contém informações sobre a requisição HTTP: o status (200, 404...), os cabeçalhos, e um método `.json()` que permite ler o corpo da resposta.

### 4. O que `resposta.json()` faz?
Lê o corpo da resposta (que vem como texto no formato JSON) e converte esse texto em um objeto/array JavaScript de verdade, que dá para acessar com `dados.name`, `dados.types` etc. Esse processo também é assíncrono — por isso usamos `await` nele também.

### 5. Por que a função é `async`?
Porque dentro dela usamos a palavra `await` duas vezes (no `fetch` e no `.json()`), e `await` só pode ser usado dentro de uma função declarada com `async`. Isso permite escrever código que depende de operações demoradas (rede) de forma sequencial e legível, em vez de encadear vários `.then()`.

### 6. O que o `await` está aguardando?
- No `await fetch(...)`: está aguardando o servidor da PokéAPI responder à requisição HTTP (isso pode levar de alguns milissegundos a alguns segundos).
- No `await resposta.json()`: está aguardando o corpo da resposta ser completamente lido e convertido de texto para objeto JavaScript.

### 7. Onde os dados JSON são utilizados?
Na função `exibirResultado(dados)`, onde os campos `dados.name`, `dados.id`, `dados.types`, `dados.weight`, `dados.height` e `dados.abilities` são lidos e usados para preencher o HTML.

### 8. Onde ocorre a manipulação do DOM?
Em vários pontos:
- No início do arquivo, ao selecionar elementos com `document.getElementById(...)`.
- Em `exibirResultado()`, ao alterar `.textContent` e `.src` dos elementos para mostrar os dados.
- Em `mostrarCarregando()` e `exibirErro()`, ao alterar o texto de status e ao adicionar/remover a classe `escondido` com `classList`.

### 9. Como a aplicação informa que está aguardando a API?
A função `mostrarCarregando()` é chamada logo no início de `buscarPokemon()`, antes do `fetch`, e escreve "Buscando..." no elemento `#mensagem-status`. Essa mensagem some assim que o resultado (ou o erro) é exibido.

### 10. Como a aplicação trata uma situação de erro?
Duas camadas:
1. Se a API responder mas o Pokémon não existir, `resposta.ok` será `false` (status 404), e o código lança um erro manualmente com `throw new Error(...)`.
2. Todo o processo está dentro de um bloco `try/catch`: qualquer erro (o que foi lançado manualmente, ou um erro de rede real, como falta de internet) é capturado no `catch` e exibido para o usuário pela função `exibirErro()`, sem quebrar a aplicação.

---

## Dica extra para a apresentação

Se a professora perguntar "o que acontece se eu tirar o `await` na frente do `fetch`?" — a resposta é: `resposta` deixaria de ser o objeto de resposta e passaria a ser uma `Promise` (uma "promessa" de valor futuro), e tentar usar `resposta.ok` ou `resposta.json()` diretamente causaria erro, porque a requisição ainda não teria terminado.

Se perguntar "por que dividir peso e altura por 10?" — porque a PokéAPI retorna esses valores em hectogramas e decímetros, então dividir por 10 converte para quilogramas e metros.
