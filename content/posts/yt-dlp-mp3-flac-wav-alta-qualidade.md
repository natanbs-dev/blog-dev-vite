---
title: "yt-dlp: baixar em MP3, FLAC, WAV e vídeo em alta qualidade"
description: "Guia prático de yt-dlp: extrair áudio em mp3, flac e wav, baixar vídeo na qualidade máxima ou em 720p, e a melhor forma de instalar — pip ou pacote da distro."
date: "2026-09-18"
tags: ["yt-dlp", "terminal", "áudio", "vídeo"]
published: true
---

O `yt-dlp` é o sucessor do `youtube-dl` e hoje é a forma mais confiável de baixar vídeo e áudio para estudo offline, backup de conteúdo próprio ou arquivamento.

Este guia cobre o essencial: instalação correta, áudio em `mp3`, `flac` e `wav`, vídeo na qualidade máxima e vídeo travado em `720p`.

## Instalação: pip ou pacote da distro?

Resposta direta: prefira `pipx` ou `pip`, não o pacote do apt/dnf.

O `yt-dlp` quebra com frequência por mudança nos sites. O projeto lança correção em dias, mas o pacote da distro congela por meses. Instalando via `pip`, você atualiza com um comando.

```bash
# recomendado: pipx (isola o binário, sem bagunçar o Python do sistema)
sudo apt install pipx ffmpeg
pipx install yt-dlp
pipx upgrade yt-dlp
```

```bash
# alternativa: pip com --user
pip install -U yt-dlp
yt-dlp -U
```

```bash
# funciona, mas desatualiza rápido — evite no dia a dia
sudo apt install yt-dlp
```

> Regra de ouro: instale o `ffmpeg` pelo gerenciador da distro, e o `yt-dlp` pelo `pipx`. O `yt-dlp` precisa do `ffmpeg` para converter e juntar áudio + vídeo.

Verifique se está tudo certo:

```bash
yt-dlp --version
ffmpeg -version | head -n 1
```

## Conceito-chave: formatos separados

No YouTube e similares, o melhor vídeo e o melhor áudio vêm separados. O `yt-dlp` baixa os dois e o `ffmpeg` junta. Por isso o `-f bestvideo+bestaudio` é importante.

Liste o que existe antes de baixar:

```bash
yt-dlp -F "URL_DO_VIDEO"
```

## Áudio na máxima qualidade

Para música e arquivamento, baixe o melhor áudio original sem converter:

```bash
# melhor áudio original, sem conversão (geralmente opus ou m4a)
yt-dlp -f bestaudio --embed-metadata "URL"
```

### MP3 em alta qualidade

O `mp3` é com lossy, mas é universal. Use `0` como melhor VBR:

```bash
# mp3 VBR qualidade máxima
yt-dlp -x --audio-format mp3 --audio-quality 0 --embed-metadata "URL"
```

```bash
# mp3 320k CBR (compatibilidade total com carro, celular antigo)
yt-dlp -x --audio-format mp3 --audio-quality 320K --embed-metadata "URL"
```

### FLAC sem perda

O `flac` preserva 100% da fonte. O arquivo fica grande, ideal para arquivamento:

```bash
# flac sem perda, com metadados e capa
yt-dlp -x --audio-format flac --embed-metadata --embed-thumbnail "URL"
```

### WAV sem compressão

O `wav` é PCM puro, ótimo para editar em DAW, mas sem tags completas e bem pesado:

```bash
# wav 44.1kHz 16-bit (padrão de CD)
yt-dlp -x --audio-format wav --embed-metadata "URL"
```

### Comparativo rápido

| Formato | Tipo | Tamanho | Quando usar |
| ------- | ---- | ------- | ----------- |
| `mp3 320k` | lossy | pequeno | celular, carro, compartilhar |
| `opus` | lossy moderno | menor ainda | ouvir no PC com qualidade alta |
| `flac` | lossless | grande | arquivar, ouvir em equipamento bom |
| `wav` | PCM | gigante | editar, samplear, produzir |

## Vídeo na mais alta qualidade

Este é o padrão que eu uso para arquivar:

```bash
# melhor vídeo + melhor áudio, juntando em mp4 quando possível
yt-dlp -f "bestvideo+bestaudio/best" --merge-output-format mp4 --embed-metadata --embed-chapters "URL"
```

```bash
# com legenda embutida e miniatura
yt-dlp -f "bestvideo+bestaudio/best" --merge-output-format mkv \
  --embed-subs --sub-langs "pt.*,en" \
  --embed-metadata --embed-chapters "URL"
```

## Vídeo travado em 720p

720p economiza disco e ainda é ótimo para aula e palestra. A lógica é: pegue o melhor até 720p:

```bash
# 720p mp4 simples e compatível
yt-dlp -f "bestvideo[height<=720]+bestaudio/best[height<=720]" \
  --merge-output-format mp4 "URL"
```

```bash
# 720p com metadados
yt-dlp -f "bv*[height<=720]+ba/b[height<=720]" \
  --merge-output-format mp4 --embed-metadata "URL"
```

> Se aparecer `Requested format is not available`, o vídeo só tem 480p ou 1080p. Rode `yt-dlp -F` e escolha manualmente.

## Receitas prontas

```bash
# playlist inteira em mp3, com numeração e pasta por álbum
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "%(playlist_title)s/%(playlist_index)02d - %(title)s.%(ext)s" \
  --yes-playlist "URL_PLAYLIST"
```

```bash
# só o trecho de 1:00 a 2:30, já em mp3
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  --download-sections "*1:00-2:30" --force-keyframes-at-cuts "URL"
```

```bash
# nome de arquivo seguro, sem caracteres estranhos
yt-dlp --restrict-filenames \
  -o "%(upload_date)s - %(title)s [%(id)s].%(ext)s" "URL"
```

## Configuração permanente

Para não repetir flags, crie um arquivo de config:

```bash
mkdir -p ~/.config/yt-dlp
nano ~/.config/yt-dlp/config
```

```text
# ~/.config/yt-dlp/config
--merge-output-format mp4
--embed-metadata
--embed-chapters
--no-playlist
-o "%(title)s [%(id)s].%(ext)s"
```

Depois disso, um simples `yt-dlp "URL"` já baixa no seu padrão.

## Conclusão

- Use `pipx` para o `yt-dlp` e `apt/dnf` para o `ffmpeg`.
- Áudio universal: `mp3 320k`. Arquivo mestre: `flac`. Edição: `wav`.
- Vídeo máximo: `bestvideo+bestaudio`. Econômico: trave em `720p`.
- Sempre confira com `-F` quando algo falhar.
