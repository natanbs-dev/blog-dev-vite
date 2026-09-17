---
title: "Teste antes de entregar: o hábito que muda seu código"
description: "Testes automatizados não são perda de tempo — são garantia de confiança. Um guia prático sobre como começar a testar de verdade, sem dogmatismo."
date: "2026-08-15"
tags: ["testes", "boas-práticas", "tdd"]
published: true
---

Existe uma frase que todo desenvolvedor já ouviu (ou disse) alguma vez:
*"não tenho tempo para escrever testes"*. Em quase todos os casos, o problema
não é falta de tempo — é falta de **confiança no processo**.

Testes automatizados são um investimento com retorno garantido: eles
transformam o medo de quebrar algo em coragem para refatorar.

## Por que testamos?

Testar não é sobre cobrir linhas de código. É sobre criar uma rede de
segurança. Com ela, você:

- Refatora sem pânico
- Adiciona features sem rezar
- Correge bugs sem criar outros dois
- Documenta o comportamento esperado do software

> Código sem teste é um passivo que cobra juros a cada deploy.

## Começo

Meu conselho para quem está começando é: não tente fazer TDD *puro* desde o
primeiro dia. A disciplina vem com o tempo. Comece cobrindo o que já dói.

### Passo 1 — escolha o teste mais barato

Funcionou para mim começar por funções puras e utilitários. Eles não exigem
mock de nada e o retorno é imediato.

```ts
// sum.ts
export function sum(a: number, b: number): number {
  return a + b;
}
```

```ts
// sum.test.ts
import { describe, expect, it } from "vitest";
import { sum } from "./sum";

describe("sum", () => {
  it("soma dois números", () => {
    expect(sum(2, 2)).toBe(4);
  });

  it("aceita números negativos", () => {
    expect(sum(-1, 1)).toBe(0);
  });
});
```

### Passo 2 — teste o comportamento, não a implementação

O maior erro de quem começa é testar *como* o código funciona em vez de *o
que* ele faz. Quando o teste fuzza o nome de métodos internos, qualquer
refatoração quebra ele — e o teste vira um obstáculo em vez de aliado.

## A roda do feedback

Um bom loop de testes é curto. A regra mental que uso:

1. **Escrevo um teste** pensando no comportamento esperado
2. **Rodo o teste** e vejo falhar
3. **Implemento** o mínimo para passar
4. **Refatoro** com segurança

Isso é o essencial do TDD, mas aplicado sem fanatismo: não precisa de
cerimônia, só do ciclo.

```bash
$ npx vitest watch
```

### Exemplo real: validação de dados

Imagine validar um formulário de inscrição. Na primeira versão, é tentador
validar dentro do componente. Melhor: isolar a regra.

```ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isFormValid(form: { email: string; name: string }): boolean {
  return form.name.trim().length >= 2 && validateEmail(form.email);
}
```

```
✓ validação aceita e-mail válido
✓ validação rejeita e-mail sem arroba
✓ formulário inválido se nome tem menos de 2 caracteres
```

Agora essa regra pode ser movida, reaproveitada e testada à exaustão — sem
abrir o navegador uma única vez.

Ferramentas que uso e recomendo: **Vitest** para TypeScript, **Testing
Library** para componentes React, e **supertest** para rotas HTTP.

## Para concluir

Testes não são um destino, são uma prática. Comece pequeno, crie o hábito e,
em alguns meses, você vai se perguntar como conseguia entregar sem eles.

E na dúvida, lembre-se da pergunta que guia tudo:

> Se eu quebrar esse código agora, alguém vai notar antes do usuário?