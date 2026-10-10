---
title: "Debian Sid ou Arch Linux em 2026: rodei os dois e tenho opinião"
description: "Passei seis meses alternando entre Debian Sid e Arch como sistema principal. Onde cada um brilha, onde cada um me deu dor de cabeça, e qual eu deixei na máquina de trabalho."
date: "2026-10-09"
tags: ["linux", "arch", "debian", "terminal", "ferramentas", "comparação"]
published: true
---

Toda discussão de "qual distro rolling release é melhor" vira briga de torcida em cinco minutos. Vou tentar fugir disso. Rodei Debian Sid e Arch como sistema principal, alternando, por mais ou menos seis meses. O que segue é o que eu senti no dia a dia, não o que está escrito na wiki.

Resumo pra quem tem pressa: os dois são ótimos e nenhum dos dois quebrou do nada no meu uso. A diferença real está em *como* você gosta de gastar seu tempo.

## O mal-entendido do "Sid é instável"

Muita gente lê "Sid = unstable" e imagina um sistema explodindo toda semana. Não é isso. `unstable` ali quer dizer que os pacotes ainda estão em movimento rumo ao `testing`, não que seu desktop vai pegar fogo. Na prática o Sid é bem mais tranquilo do que a fama.

O ponto fraco de verdade é que o Sid não tem uma rede de segurança automática. Quando uma transição grande de biblioteca acontece, você pode pegar meio dia de dependência quebrada. A defesa clássica é nunca atualizar às cegas:

```bash
# veja o que o apt QUER fazer antes de deixar ele fazer
sudo apt update
apt list --upgradable
sudo apt full-upgrade -d   # só baixa, não instala
# leu com calma? então:
sudo apt full-upgrade
```

Esse `-d` (download only) já me salvou de um upgrade que ia remover meio ambiente gráfico num momento ruim. Vi, esperei dois dias, o pacote se resolveu sozinho no repositório.

## O Arch te dá o volante inteiro

No Arch você monta o sistema peça por peça. Isso é cansativo na primeira vez e libertador depois. Você sabe exatamente o que está instalado porque foi você que colocou.

A AUR é o grande trunfo e o grande risco ao mesmo tempo. Precisou de uma ferramenta obscura? Provavelmente está lá. Mas é código de terceiros compilando na sua máquina, então leia o `PKGBUILD` antes de sair instalando:

```bash
# com um helper tipo paru, mas sem pular a leitura
paru -S nome-do-pacote   # ele abre o PKGBUILD pra você revisar
```

O que me conquistou no Arch foi a documentação. A ArchWiki é, sem exagero, o melhor material de Linux que existe — e serve até pra quem não usa Arch.

## Onde cada um me irritou

No **Sid**, o incômodo é quando você precisa de algo muito novo e o pacote ainda está encruado em `experimental`. Aí você acaba misturando repositório, e misturar repositório no Debian é a receita mais rápida pra se meter em encrenca.

No **Arch**, o incômodo é que a manutenção é *sua*. Se você sumir por três semanas e voltar com 600 pacotes pra atualizar, incluindo uma intervenção manual anunciada no site que você não leu, a chance de dor aumenta. Ler a home do Arch antes de um `-Syu` grande não é paranoia, é higiene:

```bash
# nunca faça upgrade parcial no Arch — isso quebra de verdade
sudo pacman -Syu
# evite a tentação do -Sy pacote (isso É upgrade parcial)
```

## O que ficou na minha máquina de trabalho

Debian Sid. E a razão é chata: eu queria pacote novo sem ter que *pensar* no sistema todo dia. O `apt` com aquele hábito do `-d` me deu rolling release com uma camada de freio que combina com máquina que não pode parar.

O Arch ficou no notebook pessoal, que é onde eu gosto de mexer. Se o seu prazer é entender a máquina até o osso, vá de Arch. Se o seu prazer é esquecer que a máquina existe e só trabalhar, o Sid com disciplina de upgrade entrega isso melhor do que a fama dele sugere.

Nenhuma das duas escolhas é errada. A errada é a que não combina com quanto tempo você quer gastar sendo administrador do seu próprio desktop.
