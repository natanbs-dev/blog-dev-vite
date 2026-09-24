---
title: "Bem-vindo ao meu blog"
description: "Apresentando este espaço: o que você vai encontrar aqui e por que ele existe."
date: "2026-09-01"
tags: ["blog", "programação", "carreira", "shell"]
published: true
---

Todo desenvolvedor eventualmente acumula um baú de anotações: o truque do
terminal que salvou uma tarde, a decisão de arquitetura que evitou um
retrabalho, a biblioteca que valeu cada minuto de setup.

Este blog é o meu jeito de transformar essas anotações em algo útil para
outras pessoas — e, honestamente, para o meu eu do futuro, que sempre esquece
por que escolheu uma solução em vez de outra.

```sql
SELECT c.code, c.name, c.is_system, c.active,  
       string_agg(p.prefix, ', ' ORDER BY p.prefix) AS prefixos  
```

## Por que um blog simples?

A resposta curta: porque a ferramenta certa não atrapalha. Eu escrevo o texto
e o artigo aparece no site — com a formatação pronta, *sem* painel
administrativo, sem banco de dados, sem burocracia.

Um dos princípios que mais respeito em engenharia de software é o **bike
shedding**: gastar energia no que importa. O conteúdo é o que importa aqui.

### O que o markdown me dá?

- Custo de manutenção baixo — é um arquivo `.md` versionável no Git
- Formatação consistente em qualquer editor
- Fácil de revisar via *pull request*

> A melhor ferramenta é aquela que você continua usando daqui a um ano.

## Como este site funciona

Você pode estar lendo a primeira publicação de um sistema simples, e isso é
intencional. O conteúdo novo aparece no site assim que é publicado.

### Front matter

Cada post começa com um cabeçalho YAML que define os metadados. Por exemplo:

```yaml
---
title: "Meu novo artigo"
description: "Um resumo curto que aparece no card do post."
date: "2026-09-12"
tags: ["react", "typescript"]
published: true
---
```

Se `published` for `false`, o artigo fica como **rascunho** e não aparece na
lista. Prático para escrever com calma.

## O que esperar por aqui

Os artigos vão cobrir temas que eu mesmo pesquiso todos os dias:

| Área                | Exemplos                                  |
| ------------------- | ----------------------------------------- |
| Front-end           | React, Next.js, performance, acessibilidade |
| Ferramentas         | terminal, Git, automação de ambiente       |
| Engenharia          | padrões, testes, revisão de código         |
| Carreira            | aprendizado contínuo, comunicação técnica  |

## Aja agora

Se você quer tirar mais do próprio conhecimento, o caminho é simbólico: abra
um terminal e escreva.

```ts
function actOnKnowledge(notes: string[]): void {
  for (const note of notes) {
    publish(note); // transforme anotação em conteúdo
  }
}
```

Compartilhar o que se aprende é um dos maiores aceleradores de carreira que
existem. Este blog existe exatamente para isso — e a porta está aberta.

Boa leitura, e nos vemos na próxima publicação.
