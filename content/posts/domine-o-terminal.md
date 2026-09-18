---
title: "Domine o terminal: 10 atalhos que vão mudar seu dia"
description: "O terminal ainda é a ferramenta mais poderosa do desenvolvedor. Um guia direto ao ponto com os atalhos e comandos que mais impactam a produtividade."
date: "2026-07-20"
tags: ["terminal", "unix", "produtividade"]
published: true
---

Todo mundo começa usando o terminal como um explorador de pastas glorificado:
`cd`, `ls`, `cd`, `ls`. Depois de anos assim, descobri que os ganhos reais
de produtividade estão em algumas dezenas de atalhos — e não em ferramentas
complicadas.

Este post é a lista do que uso todos os dias, sem enrolação.

## Navegação que voa

### 1. Retorne para o diretório anterior

```bash
$ cd -      # volta para o último diretório
```

Parece trivial, mas `cd -` poupa incontáveis `cd ../..`. Para alternar entre
dois diretórios, é o atalho supremo.

### 2. Favoritos no shell

Com `zsh`, ative o plugin `dirs` ou use `cd` com nomes parciais:

```bash
$ cd proj/<TAB>      # autocompleta
$ z code/blog        # salta direto (se você usa oh-my-zsh + z)
```

### 3. Limpeza instantânea

```bash
$ clear    # ou Ctrl+L
$ history  # e Ctrl+R para procurar no histórico
```

O **Ctrl+R** é, provavelmente, o atalho mais subestimado do terminal: busque
qualquer comando que você rodou ontem, anteontem ou há um mês.

## Edição de linha de comando

Você não precisa retipar o comando inteiro para ajustar um detalhe.

| Atalho             | Ação                                        |
| ------------------ | ------------------------------------------- |
| `Ctrl+A` / `Ctrl+E`| ir para o início / fim da linha             |
| `Ctrl+U`           | apagar tudo antes do cursor                 |
| `Ctrl+K`           | apagar tudo depois do cursor                |
| `Alt+←` / `Alt+→`  | pular entre palavras                        |
| `Ctrl+W`           | apagar a palavra anterior                   |

> `Ctrl+W` é o melhor amigo de quem acaba de digitar um caminho errado.

## Combinações que economizam minutos

```bash
$ mkdir -p foo/bar && cd !$      # !$ repete o último argumento
$ !!                             # repete o último comando (e com sudo?!)
$ sudo !!                        # "ops, esqueci do sudo"
```

O `!$` é outro herói silencioso: `cd !$` leva você direto para a pasta que
acabou de criar. Depois que você usa, nunca mais volta.

## Pesquisa e saída

```bash
$ history | grep docker
$ grep -R "TODO" src/            # encontre o que ficou pendente
$ npm run test 2>&1 | tail -20   # veja só o fim de saídas longas
```

E para sair de ferramentas interativas sem pânico:

| Situação         | Comando        |
| ---------------- | -------------- |
| sair de `vim`    | `:q`           |
| sair à força     | `Ctrl+C`       |
| congelar a saída | `Ctrl+S` / `Ctrl+Q` |

## Construa seu próprio aliases

O ganho real vem quando você **automatiza o que repete**. Meus aliases mais
usados:

```bash
alias g="git"
alias ls="ls --color=auto -F"
alias path='echo $PATH | tr ":" "\n"'
alias take='mkdir -p $1 && cd $1'
```

```bash
# exemplo da função take
$ take novo-projeto && npm init -y
```

## Encerrando

O terminal recompensa curiosidade: cada atalho que você aprende elimina uma
microfricção do seu fluxo. Não precisa decorar tudo de uma vez — escolha **três
itens desta lista**, use por uma semana e veja a diferença na sua velocidade.

O melhor investimento que fiz na minha carreira foi aprender a ferramenta que
uso o dia inteiro, todos os dias.

```text
$ echo "bom uso das suas mãos você economizará" | tr -s " "
```