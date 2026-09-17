# Buscador de Personagens - Rick and Morty API

Projeto da disciplina **Tecnologias para Internet** (Faculdade Senac Cascavel) — Avaliação Prática "Mini App: Consumindo uma API REST".

## O que a aplicação faz

O usuário digita o nome (ou número) de um personagem de Rick and Morty e clica em "Buscar" (ou pressiona Enter). O front-end chama um backend próprio em Node.js/Express, que consulta a [Rick and Morty API](https://rickandmortyapi.com/) e devolve os dados prontos para exibição: imagem, número, espécie, status, gênero e origem.

## Arquitetura (front-end + backend)

```
Navegador (front-end)  --fetch()-->  Servidor Express (backend)  --fetch()-->  Rick and Morty API
     script.js                          server.js
```

O front-end NÃO fala mais diretamente com a API pública. Ele chama uma rota própria do nosso servidor (`/api/personagem/:termo`), e é o servidor quem consulta a Rick and Morty API e devolve o resultado já filtrado em JSON.

## Tecnologias utilizadas

- HTML5 e CSS3 para a interface
- JavaScript (ES6+) no front-end: DOM, eventos, fetch, async/await
- Node.js + Express no backend: rota própria que consome a API pública
- `async/await` tanto no front-end quanto no backend
- Tratamento de erros em ambas as camadas

## Como executar

1. Tenha o [Node.js](https://nodejs.org/) instalado.
2. Na pasta do projeto, instale as dependências: `npm install`
3. Inicie o servidor: `npm start`
4. Abra `http://localhost:3000` no navegador.

Obs: se sua rede tiver um firewall/proxy corporativo com inspeção SSL (ex: FortiGate), pode ser necessário rodar com `node --use-system-ca server.js` (já configurado no script `start`) para que o Node confie no certificado da rede.

## Estrutura dos arquivos

```
mini-app-pokeapi/
├── server.js         → backend Express: serve o front-end e consulta a API pública
├── package.json       → dependências e script de inicialização
├── public/
│   ├── index.html      → estrutura da página
│   ├── style.css        → estilização visual
│   └── script.js         → lógica do front-end: eventos, fetch para o backend, DOM
├── README.md
└── GUIA_DEFESA.md      → respostas para a apresentação/defesa
```

## Como os requisitos da atividade foram atendidos

| Requisito | Onde está no código |
|---|---|
| Interface organizada com HTML/CSS | `public/index.html` + `public/style.css` |
| Campo de entrada que participa da consulta | `<input id="input-personagem">` |
| Interação por evento do DOM | `form.addEventListener("submit", ...)` em `public/script.js` |
| Consulta a API REST com `fetch()` | front-end chama o backend; backend chama a Rick and Morty API (ambos com `fetch()`) |
| Função com `async/await` | `buscarPersonagem()` no front-end e a rota `/api/personagem/:termo` no backend |
| Conversão/uso de dados JSON | `resposta.json()` nas duas camadas |
| Pelo menos 3 informações dinâmicas na página | nome, número, espécie, status, gênero e origem |
| Tratamento de erro / resultado inexistente | `try/catch` + status 404/500 no backend, e verificação de `resposta.ok` no front-end |
| Feedback de carregamento ("Buscando...") | função `mostrarCarregando()` |
| Resultado exibido na própria página | funções `exibirResultado()` e `exibirErro()` |
| Rotas próprias em Node.js (escopo do projeto) | rota `GET /api/personagem/:termo` em `server.js` |

## API utilizada

- **Rick and Morty API** — `https://rickandmortyapi.com/api/character`
- Não requer chave de API (uso público e gratuito).

## Autor

Lucas Pereira — Tecnologias para Internet, Faculdade Senac Cascavel.
