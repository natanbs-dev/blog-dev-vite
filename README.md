# blog-dev-vite

### barbosa.md (Vite + React)

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
