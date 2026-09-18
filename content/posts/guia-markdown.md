---
title: "Guia do Markdown no blog-dev"
description: "Tudo que o blog entende: títulos, listas, tabelas, citações, imagens, código com botão copiar e mais."
date: "2026-09-17"
tags: ["markdown", "blog", "guia"]
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

Use `---` para separar seções. Imagens com legenda funcionam com markdown padrão — coloque o arquivo em `public/` e referencie com `/nome.png`.

## Checklist de leitura

1. Abra um artigo com `title`, `description`, `date`, `tags`.
2. Rode `npm run dev` e abra o artigo.
3. Teste `Ctrl + K`, troque os temas, clique em **Copiar** nos blocos.
4. Rode `npm run build` para gerar o índice de busca + bundle final.
