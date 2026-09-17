# Guia de estudo para a defesa (17/09)

Versão atualizada: o projeto agora tem um BACKEND (Node.js/Express) além do front-end. Isso muda algumas respostas — estude esta versão, não a antiga.

## A arquitetura em uma frase

O navegador chama o NOSSO servidor (`/api/personagem/:termo`), e é o SERVIDOR quem chama a Rick and Morty API. Existem DOIS fetch()/async/await na aplicação: um no front-end (`public/script.js`) e outro no backend (`server.js`).

### 1. Qual evento inicia a consulta?
O evento `submit` do formulário, em `public/script.js`:
```js
form.addEventListener("submit", function (event) { ... });
```

### 2. Onde ocorre a chamada fetch()?
Em DOIS lugares, e é importante saber diferenciar:
- No front-end (`public/script.js`), dentro de `buscarPersonagem()`: `fetch(`/api/personagem/${termo}`)` — chama o NOSSO backend.
- No backend (`server.js`), dentro da rota `/api/personagem/:termo`: `fetch(url)` — chama a Rick and Morty API de verdade.

### 3. O que representa a variável que recebe a resposta da requisição?
Nos dois lugares se chama `resposta` e é um objeto `Response`: contém o status HTTP e um método `.json()` para ler o corpo. No front-end, é a resposta do NOSSO backend. No backend, é a resposta da Rick and Morty API.

### 4. O que `resposta.json()` faz?
Converte o corpo da resposta (texto em formato JSON) em um objeto/array JavaScript de verdade. Acontece duas vezes: o backend faz isso com a resposta da Rick and Morty API, e o front-end faz isso de novo com a resposta do backend (que já vem filtrada/mais simples).

### 5. Por que a função é `async`?
Tanto `buscarPersonagem()` (front-end) quanto a função da rota `/api/personagem/:termo` (backend) usam `await` dentro delas, e `await` só funciona dentro de uma função `async`.

### 6. O que o `await` está aguardando?
- No front-end: aguarda o NOSSO servidor Express responder.
- No backend: aguarda a Rick and Morty API responder.
- Em ambos, `await resposta.json()` aguarda o corpo ser lido e convertido.

### 7. Onde os dados JSON são utilizados?
No backend, os campos `personagem.id`, `.name`, `.image`, `.species`, `.status`, `.gender`, `.origin` são lidos da resposta da API e reempacotados num JSON mais simples. No front-end, `exibirResultado(dados)` lê esses mesmos campos (já vindos do backend) para preencher o HTML.

### 8. Onde ocorre a manipulação do DOM?
Só no front-end (`public/script.js`) — o backend nunca toca no DOM, ele só processa dados e devolve JSON. No front-end: seleção de elementos com `getElementById`, e alteração de `.textContent`/`.src`/`classList` em `exibirResultado()`, `mostrarCarregando()` e `exibirErro()`.

### 9. Como a aplicação informa que está aguardando a API?
A função `mostrarCarregando()` no front-end escreve "Buscando..." antes do fetch para o backend. Do ponto de vista do usuário, essa espera cobre as DUAS chamadas em sequência (front→backend e backend→API), mas ele só vê uma mensagem.

### 10. Como a aplicação trata uma situação de erro?
Em camadas:
1. **No backend**: se a Rick and Morty API não encontrar o personagem (por ID ou nome), a rota responde com status 404 e um JSON `{ erro: "..." }`. Erros de rede do próprio servidor caem num `catch` e retornam status 500.
2. **No front-end**: verifica `resposta.ok`; se for falso, lê o corpo de erro do backend e lança um `Error` com essa mensagem, que é capturado pelo `catch` e mostrado ao usuário via `exibirErro()`.

---

## Pergunta extra que pode vir: "por que criar um backend, se dava pra fazer só com front-end?"
Resposta honesta: o front-end sozinho já atendia todos os requisitos. O backend foi acrescentado para demonstrar o uso de rotas próprias em Node.js/Express (permitido pelo escopo do projeto) e, na prática, resolveu um bloqueio de firewall que a chamada direta do navegador enfrentava nessa rede.

## Pergunta extra: "por que buscar por ID é diferente de buscar por nome?"
A Rick and Morty API tem dois formatos: `/character/{id}` devolve UM personagem direto; `/character/?name=texto` devolve uma LISTA (`results: [...]`), porque pode haver mais de um personagem com nomes parecidos. Por isso o backend verifica se o termo digitado é só números (`/^\d+$/.test(termo)`) para decidir qual formato usar, e no caso de busca por nome pega `results[0]` (o primeiro da lista).
