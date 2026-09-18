---
title: "DDD e Arquitetura Hexagonal com Java e Spring Boot"
description: "Entenda Domain-Driven Design e arquitetura hexagonal na prática: entidades, value objects, agregados, portas e adaptadores, com exemplos em Spring Boot."
date: "2026-09-17"
tags: ["java", "spring-boot", "ddd", "arquitetura"]
published: true
---

DDD e arquitetura hexagonal resolvem problemas diferentes, mas combinam muito bem. O **DDD** diz *como modelar o negócio*. A **hexagonal** diz *como organizar o código para proteger o negócio da infraestrutura*.

## DDD em uma frase

Modele o software a partir da linguagem do negócio, não do banco de dados.

Os blocos básicos são:

- **Entidade:** tem identidade. Um `Pedido` com `id` continua sendo o mesmo pedido mesmo se o status mudar.
- **Value Object:** sem identidade, definido pelo valor. `Dinheiro`, `CPF`, `Endereco` são imutáveis e se comparam por valor.
- **Agregado:** grupo consistente liderado por uma raiz. Só a raiz pode ser alterada por fora.
- **Repositório:** coleção de agregados. O domínio pede `pedidoRepository.save(pedido)` sem saber se é JPA ou Mongo.
- **Serviço de domínio:** regra que não cabe em uma entidade só.
- **Evento de domínio:** algo relevante que aconteceu, como `PedidoPago`.

```java
// Value Object imutável: sem identidade, comparado por valor
public record Dinheiro(BigDecimal valor, String moeda) {
  public Dinheiro {
    if (valor.compareTo(BigDecimal.ZERO) < 0) {
      throw new IllegalArgumentException("valor não pode ser negativo");
    }
  }

  public Dinheiro somar(Dinheiro outro) {
    if (!moeda.equals(outro.moeda)) {
      throw new IllegalArgumentException("moedas diferentes");
    }
    return new Dinheiro(valor.add(outro.valor), moeda);
  }
}
```

```java
// Entidade com identidade e invariantes
public class Pedido {
  private final UUID id;
  private StatusPedido status;
  private final List<ItemPedido> itens = new ArrayList<>();

  public Pedido(UUID id) {
    this.id = id;
    this.status = StatusPedido.CRIADO;
  }

  public void adicionarItem(Produto produto, int quantidade) {
    if (status != StatusPedido.CRIADO) {
      throw new IllegalStateException("pedido já foi confirmado");
    }
    itens.add(new ItemPedido(produto, quantidade));
  }

  public void pagar() {
    if (itens.isEmpty()) {
      throw new IllegalStateException("pedido vazio não pode ser pago");
    }
    this.status = StatusPedido.PAGO;
  }
}
```

## Hexagonal em uma frase

O domínio fica no centro. Tudo externo — REST, JPA, mensageria — é um adaptador plugado em uma porta.

```text
        +-------------------+
        |   REST / Kafka    |  driving (quem chama)
        +--------+----------+
                 | porta de entrada
        +--------v----------+
        |  Application /    |
        |  Domain           |  regras de negócio puras
        +--------+----------+
                 | porta de saída
        +--------v----------+
        |  JPA / HTTP / S3  |  driven (quem obedece)
        +-------------------+
```

- **Porta de entrada:** caso de uso, ex: `CriarPedidoUseCase`.
- **Porta de saída:** contrato que o domínio exige, ex: `PedidoRepository`, `EnviadorDeEmail`.
- **Adaptador driving:** chama o centro, ex: `@RestController`.
- **Adaptador driven:** implementa o contrato, ex: `PedidoJpaAdapter`.

## Diferença prática

| Pergunta | DDD responde | Hexagonal responde |
| -------- | ------------ | ------------------ |
| Como chamo um pedido? | Linguagem ubíqua, agregado, invariante | — |
| Onde fica a regra de pagar? | Na entidade `Pedido` | No centro, isolada |
| Como salvo no banco? | Via repositório do domínio | Adaptador JPA implementa a porta |
| Como troco JPA por Mongo? | Não muda o domínio | Troca só o adaptador |

> DDD sem hexagonal vira entidade anemica acoplada ao `@Entity`. Hexagonal sem DDD vira CRUD bem organizado, mas sem modelo rico.

## Estrutura de projeto Spring Boot

```text
com.loja.pedido
├── domain
│   ├── model        # Pedido, ItemPedido, Dinheiro, StatusPedido
│   ├── repository   # PedidoRepository (interface!)
│   ├── service      # CalculadoraDeFrete (serviço de domínio)
│   └── event        # PedidoPago
├── application
│   ├── port/in      # CriarPedidoUseCase, PagarPedidoUseCase
│   ├── port/out     # EnviadorDeEmail, GeradorDeNotaFiscal
│   └── service      # CriarPedidoService (orquestra, não tem regra)
└── adapter
    ├── in/web       # PedidoController, DTOs
    └── out/jpa      # PedidoEntity, PedidoJpaAdapter, SpringData repo
```

## Caso de uso: orquestração sem regra

```java
// Porta de entrada
public interface CriarPedidoUseCase {
  UUID executar(NovoPedido comando);
}
```

```java
// Application service: carrega portas, chama o domínio, publica evento
@Service
public class CriarPedidoService implements CriarPedidoUseCase {

  private final PedidoRepository pedidos;
  private final ApplicationEventPublisher eventos;

  public CriarPedidoService(PedidoRepository pedidos,
                            ApplicationEventPublisher eventos) {
    this.pedidos = pedidos;
    this.eventos = eventos;
  }

  @Override
  @Transactional
  public UUID executar(NovoPedido comando) {
    Pedido pedido = new Pedido(UUID.randomUUID());
    comando.itens().forEach(i -> pedido.adicionarItem(i.produto(), i.quantidade()));
    pedidos.save(pedido);
    eventos.publishEvent(new PedidoCriado(pedido.getId()));
    return pedido.getId();
  }
}
```

## Porta de saída + adaptador JPA

O domínio nunca importa `jakarta.persistence`. Só o adaptador conhece JPA:

```java
// Porta de saída — mora no domínio
public interface PedidoRepository {
  void save(Pedido pedido);
  Optional<Pedido> buscarPorId(UUID id);
}
```

```java
// Adaptador driven — converte agregado <-> entidade JPA
@Component
public class PedidoJpaAdapter implements PedidoRepository {

  private final PedidoSpringData springData;

  public PedidoJpaAdapter(PedidoSpringData springData) {
    this.springData = springData;
  }

  @Override
  public void save(Pedido pedido) {
    springData.save(PedidoEntity.deAgregado(pedido));
  }

  @Override
  public Optional<Pedido> buscarPorId(UUID id) {
    return springData.findById(id).map(PedidoEntity::paraAgregado);
  }
}
```

```java
// Controller fino: traduz HTTP para caso de uso
@RestController
@RequestMapping("/pedidos")
public class PedidoController {

  private final CriarPedidoUseCase criarPedido;

  public PedidoController(CriarPedidoUseCase criarPedido) {
    this.criarPedido = criarPedido;
  }

  @PostMapping
  public ResponseEntity<Map<String, UUID>> criar(@RequestBody NovoPedidoDTO dto) {
    UUID id = criarPedido.executar(dto.paraComando());
    return ResponseEntity.created(URI.create("/pedidos/" + id))
      .body(Map.of("id", id));
  }
}
```

## Como a aplicação funciona em runtime

1. `POST /pedidos` chega no adaptador `PedidoController`.
2. O controller chama a porta `CriarPedidoUseCase`.
3. O `CriarPedidoService` executa regras via `Pedido.adicionarItem()` e salva pela porta `PedidoRepository`.
4. O `PedidoJpaAdapter` persiste com Spring Data.
5. Um evento `PedidoCriado` dispara e-mail ou nota fiscal sem acoplar o pedido.

Trocar o banco, adicionar Kafka ou criar um CLI novo não toca no `Pedido`.

## Erros comuns

- **Entidade = `@Entity`:** misturar JPA no domínio contamina tudo com lazy loading e anotação. Mapeie em classe separada.
- **Service com regra:** se o service soma valor, valida CPF ou muda status, essa lógica deveria estar na entidade ou value object.
- **Porta genérica demais:** `save`, `find` ok. `executeQueryNativa` vaza infraestrutura.
- **Hexagonalizar CRUD:** nem todo contexto merece agregado. Use DDD tático onde há complexidade real.

## Quando usar

Use DDD + hexagonal quando há regra que muda sempre, dinheiro envolvido, múltiplos canais de entrada ou necessidade de trocar infraestrutura. Para CRUD simples, um controller + service + repository direto é suficiente e mais barato.

> Comece pelo domínio puro em Java, sem Spring. Depois plugue o Spring nas bordas. Se sua entidade precisa de `@Autowired`, algo saiu do lugar.
