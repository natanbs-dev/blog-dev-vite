---
title: "Por que eu ainda escolho Spring Boot quando o projeto precisa escalar"
description: "Spring Boot carrega fama de pesado e verboso. Mas quando o projeto cresce de verdade, é justamente o 'peso' dele que me deixa dormir tranquilo. Explico com código."
date: "2026-10-07"
tags: ["java", "spring-boot", "arquitetura", "boas-práticas"]
published: true
---

Tem uma época da vida de todo backend em que alguém pergunta: "por que não um framework mais leve?". É uma pergunta justa. Spring Boot sobe mais devagar, consome mais memória e tem mais mágica acontecendo nos bastidores do que um micro-framework.

Só que escalar não é sobre o hello world subir rápido. É sobre o sistema aguentar gente, dados e mudança de requisito sem virar um castelo de cartas. E é aí que o Spring Boot me ganha há anos.

## "Mágica" vira contrato quando o time cresce

O que parece mágica num projeto de uma pessoa vira *padrão compartilhado* num time de dez. Quando todo mundo injeta dependência do mesmo jeito, configura transação do mesmo jeito e expõe endpoint do mesmo jeito, a pessoa nova entende o código de qualquer módulo no primeiro dia.

```java
@Service
public class PedidoService {

    private final PedidoRepository repo;
    private final EstoqueClient estoque;

    // construtor único: o Spring injeta, e o teste injeta mock. Sem truque.
    public PedidoService(PedidoRepository repo, EstoqueClient estoque) {
        this.repo = repo;
        this.estoque = estoque;
    }

    @Transactional
    public Pedido confirmar(Long id) {
        var pedido = repo.findById(id)
            .orElseThrow(() -> new PedidoNaoEncontrado(id));
        estoque.reservar(pedido.getItens());
        pedido.confirmar();
        return repo.save(pedido);
    }
}
```

Esse `@Transactional` numa linha é o tipo de coisa que, num framework cru, vira 20 linhas de `try/commit/rollback` espalhadas e copiadas errado por alguém com pressa. Escalar time é escalar o número de pessoas que podem errar. O Spring tira várias dessas chances de erro da mesa.

## O ecossistema é a feature, não um detalhe

Quando o projeto cresce, chegam as perguntas chatas: como eu vejo métrica? como eu faço health check pro Kubernetes? como eu roto um segredo sem redeploy? O Spring Boot já tem resposta pronta e testada por muita gente.

O Actuator, por exemplo, te dá observabilidade com quase nada:

```properties
# application.properties
management.endpoints.web.exposure.include=health,metrics,prometheus
management.endpoint.health.probes.enabled=true
```

Pronto — `/actuator/health/readiness` e `/actuator/health/liveness` pro orquestrador, e métricas no formato Prometheus pro seu Grafana. Num framework minimalista, cada uma dessas coisas é uma biblioteca que *você* escolhe, integra e mantém. Multiplique isso por dez necessidades e você reconstruiu meio Spring, pior e sozinho.

## O custo existe, e eu pago consciente

Não vou vender ilusão. Spring Boot sobe mais devagar e come mais RAM. Em função serverless que escala a zero, esse cold start dói. Pra esse caso eu olho GraalVM com imagem nativa, ou honestamente uso outra coisa.

```bash
# imagem nativa quando o cold start importa de verdade
./mvnw -Pnative native:compile
```

Mas a maioria dos sistemas que "precisa escalar" não é função efêmera: é serviço que fica de pé recebendo carga. Nesse mundo, o cold start acontece uma vez por deploy e some na conta.

## O resumo honesto

Spring Boot não é a escolha certa pra tudo. Pra um script, um CLI ou uma função minúscula, ele é exagero. Mas quando o projeto tem time, tem prazo longo e vai mudar de requisito mês após mês, o "peso" dele é previsibilidade. E previsibilidade, num sistema que precisa escalar, vale mais do que uma inicialização rápida que ninguém vê em produção.

Eu escolho a ferramenta que faz o sistema aguentar *gente* — a que recebe tráfego e a que escreve código. Pra esse trabalho, o Spring Boot continua difícil de bater.
