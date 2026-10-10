---
title: "5 skills do skills.sh que viraram parte do meu dia como full stack"
description: "O skills.sh virou um jeito prático de instalar Agent Skills em vários agentes de código. Separei cinco que mexeram de verdade no meu fluxo de full stack — e aviso o que checar antes de instalar."
date: "2026-10-05"
tags: ["claude", "ia", "produtividade", "ferramentas"]
published: true
---

Agent Skills deixaram de ser curiosidade e viraram ferramenta de trabalho. A ideia é simples: uma skill é uma pasta com um `SKILL.md` descrevendo um procedimento, e o agente carrega isso quando a tarefa bate. O [skills.sh](https://skills.sh) entrou nessa como um registro: você acha, publica e instala skills num formato padronizado que roda em vários agentes — Claude Code, Cursor, Copilot e por aí.

Antes de qualquer lista, o aviso que ninguém gosta de ouvir: skill é código e instrução de terceiro. Leia o `SKILL.md` antes de rodar, do mesmo jeito que você leria um script da internet. Feito o aviso, vamos às cinco que ficaram.

A instalação em geral é por linha de comando:

```bash
# o padrão do registro
npx skills add <autor>/<nome-da-skill>
```

## 1. Uma skill de revisão de PR

A que mais mudou meu dia. Em vez de pedir "revisa esse diff" e torcer, a skill carrega um roteiro: procura bug de verdade, aponta onde dá pra simplificar, cobra teste faltando. O ganho não é o agente ser mais esperto — é ele seguir *o mesmo* roteiro toda vez, em vez de inventar um critério novo a cada PR.

Full stack toca back e front no mesmo dia; ter um padrão de revisão único nos dois lados economiza aquele troca-contexto que cansa.

## 2. Geração de migration a partir do schema

Alterar entidade e esquecer a migration é clássico. A skill que uso lê a mudança no modelo e já propõe o SQL da migração, com o `down` junto — que é a parte que todo mundo esquece.

```sql
-- up
ALTER TABLE pedido ADD COLUMN cupom_id BIGINT REFERENCES cupom(id);
-- down
ALTER TABLE pedido DROP COLUMN cupom_id;
```

Ela não substitui a sua revisão. Mas tirar o rascunho da frente já vale o clique.

## 3. Componente de UI com teste junto

Do lado do front, a que me poupa mais tempo é a que cria componente *com* o teste no mesmo passo. Nada sofisticado — um componente acessível e um teste que renderiza e checa o comportamento principal. O valor está em não deixar o teste pra "depois", porque o depois não chega.

## 4. Auditoria rápida de dependência

Antes de subir uma lib nova, essa skill cruza o que você tá puxando com avisos conhecidos e com a data do último release. Não é um scanner de segurança completo — é um "espera, essa dependência tá abandonada há dois anos?" antes de você casar com ela.

## 5. Gerador de README honesto

A menos glamourosa e a que mais gente deveria usar. Ela lê o projeto e escreve um README com o que importa: como rodar, como testar, variáveis de ambiente. Não enche de emoji nem de promessa. Full stack vive entrando em repositório alheio; um README decente é o presente que a gente deveria deixar pro próximo.

## O critério que uso pra instalar (ou não)

Skill boa é skill que faz **uma** coisa e descreve bem o quê. Quando abro o `SKILL.md` e a descrição é vaga ou quer fazer tudo, eu passo. O registro ajuda com tendência e ranking, mas o filtro final é a leitura. Teste numa branch descartável antes de confiar em algo que mexe no seu código pra valer.

O skills.sh é um projeto independente, sem vínculo com a Anthropic — e isso não é demérito, é só um motivo a mais pra você mesmo conferir o que está instalando.

**Fontes:** [skills.sh](https://skills.sh) · [Agent Skills — guia](https://codeagentsalpha.substack.com/p/claude-agent-skills-complete-getting) · [anthropics/skills](https://github.com/anthropics/skills)
