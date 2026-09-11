# Pokédex - Mini App consumindo a PokéAPI

Projeto da disciplina **Tecnologias para Internet** (Faculdade Senac Cascavel) — Avaliação Prática "Mini App: Consumindo uma API REST".

## O que a aplicação faz

O usuário digita o nome (ou número) de um Pokémon em um campo de texto e clica em "Buscar" (ou pressiona Enter). A aplicação consulta a [PokéAPI](https://pokeapi.co/) e exibe dinamicamente na página: imagem, número na Pokédex, tipo(s), peso, altura e habilidades do Pokémon.

## Tecnologias utilizadas

- HTML5 e CSS3 para a interface
- JavaScript (ES6+) puro, sem frameworks
- [Fetch API](https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API) para a requisição HTTP
- `async/await` para lidar com a resposta assíncrona
- Manipulação do DOM para atualizar a página sem recarregá-la

## Como executar

1. Baixe (ou clone) este repositório.
2. Abra o arquivo `index.html` diretamente no navegador (duplo clique, ou clique com o botão direito → "Abrir com" → navegador).
3. Não é necessário servidor nem instalação de dependências — é um projeto 100% front-end.

## Estrutura dos arquivos

```
mini-app-pokeapi/
├── index.html   → estrutura da página (formulário + área de resultado)
├── style.css    → estilização visual
├── script.js    → lógica: eventos, fetch, tratamento de dados e erros
└── README.md    → este arquivo
```

## Como os requisitos da atividade foram atendidos

| Requisito | Onde está no código |
|---|---|
| Interface organizada com HTML/CSS | `index.html` + `style.css` |
| Campo de entrada que participa da consulta | `<input id="input-pokemon">` em `index.html` |
| Interação por evento do DOM | `form.addEventListener("submit", ...)` em `script.js` |
| Consulta a API REST com `fetch()` | dentro de `buscarPokemon()`, em `script.js` |
| Função com `async/await` | `async function buscarPokemon(nome)` |
| Conversão/uso de dados JSON | `const dados = await resposta.json();` e uso de `dados.name`, `dados.types` etc. |
| Pelo menos 3 informações dinâmicas na página | nome, número, tipo(s), peso, altura e habilidades — em `exibirResultado()` |
| Tratamento de erro / resultado inexistente | bloco `try/catch` + verificação de `resposta.ok` em `buscarPokemon()` |
| Feedback de carregamento ("Buscando...") | função `mostrarCarregando()` |
| Resultado exibido na própria página (não só no console) | funções `exibirResultado()` e `exibirErro()` alteram o DOM diretamente |

## API utilizada

- **PokéAPI** — `https://pokeapi.co/api/v2/pokemon/{nome-ou-numero}`
- Não requer chave de API (uso público e gratuito).

## Autor

Lucas Pereira — Tecnologias para Internet, Faculdade Senac Cascavel.
