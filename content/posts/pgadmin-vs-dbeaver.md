---
title: "pgAdmin ou DBeaver: qual eu abro no dia a dia e por quê"
description: "Dois clientes de banco que vivem no meu dock. Um eu uso pra administrar Postgres de perto, o outro pra transitar entre bancos diferentes. Comparo com a cara de quem usa os dois toda semana."
date: "2026-10-03"
tags: ["banco-de-dados", "sql", "postgres", "ferramentas", "comparação"]
published: true
---

Tem gente que escolhe cliente de banco por religião. Eu escolho por tarefa — e por isso tenho os dois instalados. pgAdmin e DBeaver resolvem problemas que se sobrepõem, mas cada um tem um lugar onde é claramente melhor. Vou tentar ser justo com os dois.

## pgAdmin: feito pra Postgres, e isso aparece

O pgAdmin é a ferramenta oficial do Postgres, e a especialização é a força dele. Quando eu preciso *administrar* um Postgres — ver o que está travando, inspecionar um `VACUUM`, olhar privilégio de role, entender um plano de execução — o pgAdmin fala a língua nativa.

O painel de atividade, por exemplo, me mostra as queries rodando agora sem eu precisar decorar a view de sistema. Mas quando eu quero mesmo entender uma query lenta, vou direto na fonte:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.id, p.total
FROM pedido p
JOIN cliente c ON c.id = p.cliente_id
WHERE c.cidade = 'Fortaleza'
  AND p.criado_em >= now() - interval '30 days';
```

E o pgAdmin desenha esse plano numa árvore visual que ajuda a enxergar onde o tempo foi embora. Pra quem vive em Postgres o dia inteiro, essa proximidade com os detalhes do servidor é difícil de largar.

O lado chato: a interface web é pesada e às vezes lenta, e se o seu mundo tem MySQL, SQLite e Postgres ao mesmo tempo, você vai precisar de outra ferramenta pros outros.

## DBeaver: o canivete de quem transita entre bancos

O DBeaver é o oposto da especialização: ele conversa com praticamente tudo que fala SQL. Num dia em que eu toco Postgres de manhã, SQLite num app mobile à tarde e um MySQL legado no fim do dia, é o DBeaver que fica aberto — uma interface só, uma lógica só.

O editor de SQL dele é melhor no conforto do dia a dia: autocomplete esperto, histórico de query que realmente funciona, e exportar resultado pra CSV ou JSON é dois cliques.

```sql
-- mesma query roda igual aqui, e o resultado eu exporto sem fricção
SELECT cidade, count(*) AS pedidos
FROM pedido p
JOIN cliente c ON c.id = p.cliente_id
GROUP BY cidade
ORDER BY pedidos DESC;
```

O ponto fraco é o espelho do pgAdmin: por ser genérico, ele não te leva tão fundo nas peculiaridades de administração de um banco específico. Ele é excelente em *usar* o banco; é menos focado em *operar* o servidor.

## Como eu divido na prática

É mais simples do que a briga da internet sugere:

- **Administrar um Postgres de perto** — roles, locks, vacuum, plano visual: pgAdmin.
- **Escrever e rodar query no dia a dia, especialmente entre bancos diferentes**: DBeaver.

Se eu só pudesse manter um, ficaria com o DBeaver, porque meu trabalho cruza mais de um banco e a versatilidade pesa mais pra mim. Mas se o seu mundo é Postgres e nada além de Postgres, o pgAdmin vai te dar um controle que o DBeaver não alcança.

Ferramenta não é time pra torcer. É martelo e chave de fenda: tenha os dois na gaveta e pegue o que serve pro prego da vez.
