---
title: "ffmpeg: converter MP3, WAV, FLAC e comandos do dia a dia"
description: "Os comandos ffmpeg mais úteis: converter entre mp3, wav, flac e opus, extrair áudio de vídeo, cortar, normalizar volume e processar em lote."
date: "2026-09-16"
tags: ["ffmpeg", "áudio", "terminal", "conversão"]
published: true
---

O `ffmpeg` é o canivete suíço de áudio e vídeo. Quase todo conversor com botão bonito usa ele por baixo.

Aqui vai o kit de sobrevivência: conversão entre `mp3`, `wav`, `flac` e `opus`, mais extração, corte e lote.

## Verificação rápida

```bash
ffmpeg -version
ffprobe -v error -show_format -show_streams musica.flac
```

O `ffprobe` mostra codec, sample rate, canais e bitrate antes de converter — evita chute.

## Conversões essenciais

### Para MP3 (universal)

```bash
# wav -> mp3 320k (melhor qualidade mp3)
ffmpeg -i entrada.wav -codec:a libmp3lame -b:a 320k saida.mp3
```

```bash
# flac -> mp3 VBR qualidade máxima
ffmpeg -i entrada.flac -codec:a libmp3lame -q:a 0 saida.mp3
```

```bash
# qualquer formato -> mp3, preservando metadados
ffmpeg -i entrada.m4a -codec:a libmp3lame -b:a 256k -map_metadata 0 saida.mp3
```

### Para FLAC (arquivamento sem perda)

```bash
# wav -> flac (compressão máxima, sem perda)
ffmpeg -i entrada.wav -codec:a flac -compression_level 12 saida.flac
```

```bash
# mp3 -> flac (não recupera qualidade, só aumenta o tamanho!)
ffmpeg -i entrada.mp3 -codec:a flac saida.flac
```

> Converter de `mp3` para `flac` não melhora nada. FLAC só vale a pena a partir de fonte sem perda como `wav` ou CD.

### Para WAV (edição)

```bash
# flac -> wav 44.1kHz 16-bit (padrão CD)
ffmpeg -i entrada.flac -codec:a pcm_s16le -ar 44100 -ac 2 saida.wav
```

```bash
# mp3 -> wav para editar em DAW
ffmpeg -i entrada.mp3 -codec:a pcm_s16le saida.wav
```

### Para OPUS (moderno e pequeno)

```bash
# qualquer entrada -> opus 128k (transparente para a maioria)
ffmpeg -i entrada.flac -codec:a libopus -b:a 128k saida.opus
```

### Tabela de decisão

| Origem | Destino ideal | Comando base |
| ------ | ------------- | ------------ |
| `wav` | `flac` | `-codec:a flac` |
| `flac` | `mp3 320k` | `-codec:a libmp3lame -b:a 320k` |
| `mp3` | `opus` | `-codec:a libopus -b:a 128k` |
| qualquer | `wav` | `-codec:a pcm_s16le` |

## Extrair áudio de vídeo

```bash
# vídeo -> mp3 256k, sem manter o vídeo
ffmpeg -i video.mp4 -vn -codec:a libmp3lame -b:a 256k audio.mp3
```

```bash
# vídeo -> flac (extrai a trilha sem perda, se a origem for boa)
ffmpeg -i video.mkv -vn -codec:a flac audio.flac
```

```bash
# extrair sem reconverter (quando o áudio já é aac/m4a)
ffmpeg -i video.mp4 -vn -codec:a copy audio.m4a
```

## Ajustes que salvam

### Sample rate, canais e volume

```bash
# forçar 48kHz estéreo (padrão de vídeo)
ffmpeg -i entrada.wav -ar 48000 -ac 2 saida.wav
```

```bash
# normalizar volume para -14 LUFS (padrão de streaming)
ffmpeg -i entrada.mp3 -filter:a loudnorm=I=-14:TP=-1:LRA=11 saida.mp3
```

```bash
# aumentar volume em 3dB sem clipar
ffmpeg -i baixo.mp3 -filter:a "volume=3dB" alto.mp3
```

### Cortar e juntar

```bash
# cortar de 00:01:00 por 30 segundos, sem recodificar
ffmpeg -ss 00:01:00 -t 30 -i entrada.mp3 -codec:a copy trecho.mp3
```

```bash
# juntar vários mp3 com mesmo codec
printf "file 'p1.mp3'\nfile 'p2.mp3'\nfile 'p3.mp3'\n" > lista.txt
ffmpeg -f concat -safe 0 -i lista.txt -codec:a copy final.mp3
```

## Processar pastas inteiras

```bash
# converter todos os flac da pasta para mp3 320k
for f in *.flac; do
  ffmpeg -i "$f" -codec:a libmp3lame -b:a 320k "${f%.flac}.mp3"
done
```

```bash
# converter todos os wav para flac em paralelo (4 de cada vez)
ls *.wav | xargs -P 4 -I{} sh -c 'ffmpeg -i "$1" -codec:a flac "${1%.wav}.flac"' _ {}
```

```bash
# reduzir todos os mp3 para mono 128k (audiobook, palestra)
for f in *.mp3; do
  ffmpeg -i "$f" -codec:a libmp3lame -b:a 128k -ac 1 "mono-$f"
done
```

## Diagnóstico quando algo falha

```bash
# mostra tudo: codec, duração, bitrate
ffprobe -hide_banner entrada.mp3
```

```bash
# testa a integridade sem gerar saída
ffmpeg -v error -i entrada.flac -f null -
```

```bash
# ver codecs de áudio disponíveis
ffmpeg -encoders | grep -i -E "mp3|flac|opus|wav|aac"
```

## Erros clássicos

- **`Unknown encoder 'libmp3lame'`:** seu ffmpeg está capado. Instale o `ffmpeg-full` da distro.
- **Arquivo gigante:** esqueceu `-b:a`. FLAC e WAV são grandes por natureza, MP3 não deveria ser.
- **Áudio dessincronizado:** extraiu com `-ss` antes do `-i` de forma imprecisa. Teste com `-ss` depois do `-i` para precisão.
- **Volume baixo após converter:** use `loudnorm` em vez de chutar `volume=X`.

## Conclusão

- Mestre sem perda: `wav` para editar, `flac` para guardar.
- Dia a dia universal: `mp3 320k`.
- Moderno e leve: `opus 128k`.
- Aprenda `ffprobe` + `-codec:a copy` e você resolve 80% dos casos sem perder qualidade.
