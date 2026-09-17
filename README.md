# blog-dev-vite

### blog-dev (Vite + React)

Blog de artigos em **Vite + React + TypeScript**, onde cada post é um markdown em `content/posts/`.

## Como publicar

1. Crie `content/posts/meu-post.md`:

```yaml
---
title: "Meu novo artigo"
description: "Resumo curto que aparece no card."
date: "2026-09-17"
tags: ["react", "typescript"]
published: true
---
```

2. Rode `npm run dev` — o artigo aparece na home, no arquivo, nas tags e na busca.
3. `published: false` deixa o post como rascunho (oculto).

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor dev com HMR (http://localhost:5173) |
| `npm run build` | gera `public/search-index.json` + `tsc` + bundle `dist/` |
| `npm run preview` | serve o `dist/` para teste final |
| `npm run typecheck` | só checagem de tipos |

## Recursos

- **Markdown completo (GFM):** títulos com âncora `#`, tabelas, task-lists, citações, imagens, código inline.
- **Bloco de código com Copiar:** barra com linguagem + botão `Copiar` → `Copiado!` (clipboard API com fallback).
- **Busca `Ctrl + K` / `Cmd + K`:** palette com debounce, setas + Enter, snippet com destaque, `Esc` fecha.
- **Temas:** `dark` (padrão), `light`, `gruvbox-dark` + extras (`dracula`, `one-dark`, `nord`, `catppuccin-dark`). Persiste em `localStorage`, sem FOUC via script inline no `index.html`.
- **Rotas:** `/`, `/posts/:slug`, `/arquivo`, `/tags`, `/tags/:slug`, `/sobre` (HashRouter — funciona em qualquer estático).
- **Post:** TOC automático (h2/h3), barra de progresso de leitura, prev/next, reading-time.

## Estrutura

```
content/posts/*.md        # adicione aqui — detecção automática
public/search-index.json  # gerado pelo build (não editar)
scripts/generate-search-index.mjs
src/lib/posts.ts          # glob + frontmatter + pipeline unified
src/lib/site.ts
src/components/          # Header, Hero, PostCard, Markdown, Search, ThemePicker…
src/pages/               # Home, PostPage, Archive, Tags, About, NotFound
src/index.css             # design system + 7 temas
```
