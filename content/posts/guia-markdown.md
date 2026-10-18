---
title: "Guia do Markdown no barbosa.md"
description: "Tudo que o blog entende: títulos, listas, tabelas, citações, imagens, código com botão copiar e mais."
date: "2026-09-17"
tags: ["markdown", "blog", "guia", "programação"]
cover: "./img/capa-guia-markdown.png"
coverAlt: "Editor com markdown cru à esquerda e o texto formatado à direita"
published: true
---

Este post demonstra **tudo** que o blog renderiza.

## Títulos e âncoras

Passe o mouse sobre um `h2` ou `h3` para ver o link `#`. Os títulos alimentam o índice lateral (TOC) automaticamente.

### Subtítulo de exemplo

Texto com *itálico*, **negrito**, ~~riscado~~, `código inline` e um [link externo](https://vite.dev).



## Listas e tarefas

- Item com `código`
- Item com **destaque**
- Aninhado:
  - sub-item 1
  - sub-item 2

1. Primeiro passo
2. Segundo passo
3. Terceiro passo

- [x] Markdown com GFM ativo
- [x] Botão copiar no código
- [ ] Publicar seu próximo artigo

## Citação

> A melhor ferramenta é aquela que você continua usando daqui a um ano.
> Escreva em markdown, salve na pasta, publique.

## Tabela

| Recurso        | Onde fica              | Atalho     |
| -------------- | ---------------------- | ---------- |
| Buscar         | Header / palette       | `Ctrl + K` |
| Trocar tema    | Ícone ao lado da busca | clique     |
| Copiar código  | Barra do bloco         | `Copiar`   |

## Código com botão copiar

Cada bloco ganha uma barra com a linguagem e um botão **Copiar** (com fallback para navegadores sem clipboard API):

```ts
export function soma(a: number, b: number): number {
  return a + b;
}

console.log(soma(2, 3)); // 5
```

```bash
# exemplo de comando
npm run dev   # para ver o site localmente
```

```python
def saudacao(nome: str) -> str:
    return f"Olá, {nome}!"
```

## Linha e imagem

---

![[max.jpg]]

Use `---` para separar seções.

Para imagens, coloque o arquivo numa pasta ao lado dos artigos, como `content/posts/img/`, e aponte para ele com caminho relativo:

```markdown
![Descrição da foto](./img/minha-foto.jpg)
```

Quem escreve no Obsidian pode usar o jeito dele, só com o nome do arquivo. O blog procura a imagem dentro de `content/` pelo nome:

```markdown
![[minha-foto.jpg]]
![[minha-foto.jpg|Descrição da foto]]
```

Cuidado com espaço entre `]` e `(`: `![foto] (./img/foto.jpg)` não é imagem para o markdown, vira texto comum.

Pode ser foto grande, direto da câmera: no build ela é reduzida para no máximo 1600px de largura e convertida para WebP. A página reserva o espaço da imagem antes de ela carregar, e ela só baixa quando chega perto da tela. GIF e SVG passam sem conversão.

Para dar uma capa ao artigo, use `cover` no front-matter. Ela aparece no topo do artigo e, em miniatura recortada em 16:9, nas listas e no destaque da home:

```yaml
cover: "./img/capa.jpg"
coverAlt: "O que aparece na foto"
```

## Checklist de leitura

1. Abra um artigo com `title`, `description`, `date`, `tags`.
2. Rode `npm run dev` e abra o artigo.
3. Teste `Ctrl + K`, troque os temas, clique em **Copiar** nos blocos.
4. Rode `npm run build` para gerar o índice de busca + bundle final.
