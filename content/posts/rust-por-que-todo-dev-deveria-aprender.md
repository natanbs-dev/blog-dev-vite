---
title: "Rust: Por que todo desenvolvedor deveria aprender em 2024"
description: "Rust lidera pesquisas de linguagens amadas há anos seguidos. Mas o que torna ela tão especial? Vamos mergulhar nos conceitos que fazem Rust ser diferente de tudo que veio antes."
date: "2024-02-08"
author: "Ana Ribeiro"
tags: ["rust", "sistemas", "performance", "linguagens"]
cover: ""
featured: false
---

# Rust: A Linguagem que Está Redefinindo Sistemas

Por **9 anos consecutivos**, Rust foi eleita a linguagem mais amada pelos desenvolvedores no StackOverflow Developer Survey. Isso não é coincidência. Rust resolve problemas que linguagens como C e C++ nunca conseguiram — e faz isso sem sacrificar performance.

## O Problema com Memória

Em C/C++, você gerencia memória manualmente. É poderoso, mas perigoso:

```c
// C - Uso-após-livre (undefined behavior)
char *ptr = malloc(10);
free(ptr);
printf("%s", ptr); // 💥 comportamento indefinido
```

Em linguagens com GC (Java, Python, Go), você paga o custo do coletor de lixo — pausas, overhead de memória, latência imprevisível.

Rust elimina **ambos** os problemas com o **sistema de ownership**.

## O Sistema de Ownership

A ideia central de Rust é simples: cada valor tem **um único dono**. Quando o dono sai de escopo, o valor é liberado automaticamente. Sem GC, sem use-after-free.

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // s1 é "movido" para s2

    // println!("{}", s1); // ❌ Erro em tempo de compilação!
    println!("{}", s2);    // ✅ OK
} // s2 é liberado aqui automaticamente
```

O compilador **garante** a segurança. Não em runtime — em tempo de compilação.

## Borrowing e Lifetimes

Você pode "emprestar" referências sem transferir ownership:

```rust
fn calcular_tamanho(s: &String) -> usize {
    s.len()
} // s não é liberado aqui — apenas a referência é descartada

fn main() {
    let s1 = String::from("hello");
    let tamanho = calcular_tamanho(&s1); // emprestamos s1
    println!("'{}' tem {} bytes", s1, tamanho); // s1 ainda é válido ✅
}
```

As regras são:
1. Você pode ter **múltiplas referências imutáveis** (`&T`)
2. Ou **exatamente uma referência mutável** (`&mut T`)
3. Nunca os dois ao mesmo tempo

Isso elimina **data races** em tempo de compilação.

## Rust no Mundo Real

Rust está em produção em lugares que importam:

| Empresa | Uso |
|---------|-----|
| **Linux Kernel** | Segundo idioma oficial do kernel |
| **Firefox** | Motor CSS Stylo |
| **Cloudflare** | Proxies de rede de alta performance |
| **Amazon AWS** | Firecracker VMM |
| **Microsoft** | Componentes do Windows |
| **Discord** | Serviços de backend de alta concorrência |

## Exemplo: Servidor HTTP do Zero

```rust
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();

    let response = "HTTP/1.1 200 OK\r\n\r\nHello, Rust!";
    stream.write_all(response.as_bytes()).unwrap();
}

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    println!("Servidor rodando em http://127.0.0.1:7878");

    for stream in listener.incoming() {
        let stream = stream.unwrap();
        handle_connection(stream);
    }
}
```

## Por onde começar?

1. [The Rust Book](https://doc.rust-lang.org/book/) — gratuito, em inglês, excelente
2. [Rustlings](https://github.com/rust-lang/rustlings) — exercícios interativos
3. [Exercism - Rust Track](https://exercism.org/tracks/rust) — prática guiada

## Conclusão

Rust não é apenas uma linguagem — é uma mudança de paradigma. Ela prova que **segurança e performance não são mutuamente exclusivas**. Se você programa sistemas, backend, WebAssembly ou qualquer coisa onde performance importa, Rust merece sua atenção.

O futuro dos sistemas é Rust. 🦀
