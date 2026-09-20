---
title: "AUR INFECTADO: MAIS DE 1600 PACOTES INFECTADOS NO REPOSITORIO AUR"
description: "Ataque severo ao repositório archlinux causa danos graves na integridade de confiança do repositório comunitário AUR"
date: "2026-06-15"
author: "BarbosaDev"
tags: ["shell"]
cover: ""
featured: true
published: true

---


# O Maior Ataque ao AUR do Arch Linux em 2026

> **Data do incidente:** 11–12 de junho de 2026  
> **Pacotes comprometidos:** 1.579 (confirmados)  
> **Severidade:** CVSS 8.7 (Sonatype-2026-003775)  
> **Status atual:** Commits maliciosos removidos — repositórios oficiais não foram afetados

---

## O que aconteceu

Entre os dias 11 e 12 de junho de 2026, pesquisadores da Sonatype identificaram uma campanha coordenada de ataque ao **AUR (Arch User Repository)**, o repositório comunitário do Arch Linux. Batizada de **"Atomic Arch"**, a operação comprometeu pelo menos **1.579 pacotes** ao injetar um infostealer baseado em Rust combinado com um rootkit eBPF — capazes de roubar credenciais, exfiltrar dados e se ocultar do sistema operacional sem deixar rastros visíveis ao usuário.

Os repositórios oficiais do Arch Linux (`[core]`, `[extra]` e `[multilib]`) **não foram afetados**. O ataque foi inteiramente restrito ao AUR.

---

## Como o ataque funcionou

O AUR permite que qualquer membro da comunidade adote pacotes cujos mantenedores originais os abandonaram — os chamados **pacotes órfãos**. Os atacantes exploraram exatamente essa brecha: adotaram centenas de pacotes legítimos e abandonados através do processo normal de adoção, ganhando assim controle total sobre os scripts de build (`PKGBUILD`) sem precisar invadir nenhuma conta.

Uma vez no controle, modificaram os `PKGBUILD` para incluir um script de pós-instalação que executava silenciosamente:

```bash
npm install atomic-lockfile minimist chalk
```

Esse comando baixava o pacote npm malicioso `atomic-lockfile`, que continha um binário ELF nativo para Linux chamado `deps`, escrito em Rust — o payload principal do ataque.

### Linha do tempo

| Momento | Pacotes comprometidos |
|---|---|
| Início — 11/06 | ~400 |
| Horas depois | ~900 |
| Fim — 12/06 | **1.579** (parcial) |

Na segunda onda (12 de junho), os atacantes passaram a usar o runtime **Bun** em alguns pacotes, distribuindo novos payloads via `js-digest` e `lockfile-js`. Em pelo menos um caso, commits de um mantenedor legítimo de longa data foram **forjados via manipulação de metadados git**, dificultando ainda mais a detecção.

---

## Por que esses pacotes são perigosos

O que torna o Atomic Arch particularmente grave não é apenas a escala — é a sofisticação do payload e sua capacidade de operar de forma completamente invisível.

### Rootkit via eBPF

O binário `deps` carrega um programa eBPF no kernel Linux, hookando a syscall `getdents64()` — responsável por listar arquivos e diretórios. Com isso, o malware consegue **ocultar seus próprios processos, arquivos e inodes** de ferramentas como `ps`, `htop`, `ls` e `find`. Um sistema infectado pode parecer completamente limpo mesmo sob inspeção direta.

Os mapas eBPF utilizados pelo rootkit foram identificados com os nomes `hidden_pids`, `hidden_names` e `hidden_inodes`.

### Roubo de credenciais

O infostealer foi projetado especificamente para atingir desenvolvedores e administradores de sistemas, coletando:

- **Tokens GitHub, GitLab e npm** — acesso a repositórios e pipelines
- **Chaves SSH privadas** (`~/.ssh/`) — pivô para servidores e infraestrutura
- **Tokens HashiCorp Vault e segredos de CI/CD** — GitHub Actions, GitLab CI, Jenkins
- **Cookies e credenciais de browsers** — Chrome, Firefox e derivados
- **Sessões ativas** de Slack, Discord, Microsoft Teams e Telegram
- **Dados de carteiras de criptomoeda** — arquivos locais e seed phrases

### Persistência e comunicação furtiva

O malware instala serviços `systemd` com `Restart=always` para sobreviver a reinicializações e utiliza comunicação baseada em **Tor** para exfiltrar os dados coletados, dificultando o bloqueio por firewall. Relatórios adicionais apontam para a presença de staging de **mineração de Monero** como estágio posterior à infecção.

### Anti-debugging

O binário inclui lógica baseada em `PTRACE_ATTACH` e `PTRACE_SEIZE` para detectar e dificultar análise por debuggers, dificultando a investigação forense em sistemas comprometidos.

---

## Como verificar se seu sistema foi afetado

> **Período de risco:** pacotes instalados ou atualizados entre **09 e 12 de junho de 2026**.

---

### Verificação completa — script da comunidade

Para uma análise mais aprofundada — incluindo verificação de rootkit eBPF, cache npm/bun e histórico de logs do pacman — utilize o script consolidado pela comunidade:

#### Verificação 1

```bash
# 1. Clone o repositório
git clone https://github.com/lenucksi/aur-malware-check
cd aur-malware-check

# 2. Dê permissão de execução
chmod +x /aur_check-v2.sh

# 3. Execute a verificação (recomendado)
./aur_check-v2.sh
```

O script realiza as seguintes verificações:

| Check | O que verifica |
|---|---|
| `[1]` Pacotes instalados | Cruza pacotes AUR instalados com a lista de comprometidos


**Códigos de saída:**

- `0` → Sistema limpo
- `1` → Avisos — revisar output
- `2` → Indicadores de infecção encontrados

---

#### Verificação 2:
```bash
# 1. Baixe o raw ou copie o conteúdo do arquivo
https://gist.github.com/Kidev/59bf9f5fb53ab5eee99f19a6a2fc3992

# 2. Dê permissão de execução
chmod +x aur_check.sh

# 3. Execute a verificação completa (recomendado)
./aur_check.sh
```




## O que fazer se seu sistema foi comprometido

Se qualquer verificação retornar positivo, aja imediatamente — não espere por sintomas visíveis. O rootkit eBPF foi projetado para não os exibir.


### 1. Remova o pacote e as dependências maliciosas

```bash
# Remova o pacote AUR comprometido
sudo pacman -Rns <nome-do-pacote>

# Verifique e remova o atomic-lockfile do npm global
npm ls -g atomic-lockfile 2>/dev/null
npm uninstall -g atomic-lockfile 2>/dev/null

# Procure rastros nos caches de build
grep -r "atomic-lockfile\|js-digest\|lockfile-js" \
  ~/.cache/yay/ ~/.cache/paru/ /tmp/ 2>/dev/null
```

### 3. Verifique persistência systemd

```bash
# Liste serviços em execução fora do padrão
systemctl list-units --type=service --state=running

# Verifique serviços com padrão de persistência do malware
grep -rl "Restart=always" /etc/systemd/system/ ~/.config/systemd/user/ 2>/dev/null \
  | xargs grep -l "RestartSec=30" 2>/dev/null
```

### 4. Verifique o rootkit eBPF

```bash
# Requer root
sudo ls -la /sys/fs/bpf/ 2>/dev/null | grep -E "hidden_pids|hidden_names|hidden_inodes"
```

Qualquer resultado aqui é indicador crítico de comprometimento.

### 5. Considere reinstalação limpa

Dado que o payload inclui um rootkit eBPF capaz de ocultar processos e arquivos, **a única forma garantida de eliminar a ameaça é reinstalar o Arch Linux a partir de mídia confiável**. Um sistema com rootkit ativo não pode ser auditado de forma confiável de dentro de si mesmo.

---

## Boas práticas para evitar ataques futuros

- **Revise o `PKGBUILD` antes de instalar ou atualizar** qualquer pacote AUR. Procure por chamadas inesperadas a `npm install`, `pip install`, `curl | bash` ou similares.
- **Desconfie de pacotes com mantenedor recém-alterado.** AUR helpers como `yay` e `paru` não alertam sobre mudanças de mantenedor.
- **Evite pacotes órfãos sem revisão prévia.** O status de órfão deve ser tratado como sinal de atenção redobrada.
- **Mantenha um inventário dos seus pacotes AUR** com `pacman -Qm` e revise periodicamente.
- **Considere usar `aurutils`** para maior controle sobre o processo de build sem automação excessiva.

---

## Referências

- [Sonatype — Atomic Arch: npm Campaign Adds Malicious Dependency](https://www.sonatype.com/blog/atomic-arch-npm-campaign-adds-malicious-dependency) (Sonatype-2026-003775, CVSS 8.7)
- [Dolutech — Arch Linux AUR: 1.579 Pacotes Infectados com Malware](https://dolutech.com/arch-linux-aur-1579-pacotes-infectados-com-malware/)
- [Phoronix — Arch Linux Now Believes Malware Incident Under Control: More Than 1,500 Affected Packages](https://www.phoronix.com/news/Arch-Linux-AUR-More-Than-1500)
- [GitHub — lenucksi/aur-malware-check](https://github.com/lenucksi/aur-malware-check)
- [Gist — Kidev: Script original de detecção](https://gist.github.com/Kidev/59bf9f5fb53ab5eee99f19a6a2fc3992)
- [Lista oficial de pacotes comprometidos — HedgeDoc Arch Linux](https://md.archlinux.org/s/SxbqukK6IA)
- Mailing list `aur-general` do Arch Linux — thread de 11–12 de junho de 2026