# TREMU NA OFICINA

Jogo de inclusão social em **React + JavaScript** que ensina e treina o
alfabeto manual da **Língua Gestual Portuguesa (LGP)**. O utilizador vê uma
palavra de quatro letras e tem de a soletrar com a mão à frente da câmara.
O reconhecimento corre **inteiramente no navegador** — não há servidores nem
APIs externas a serem chamadas durante o jogo.

## Como funciona

O modelo de mãos da MediaPipe (`hand_landmarker.task`) corre via WebAssembly
   no browser e devolve 21 pontos de referência da mão por *frame*.
Um classificador geométrico próprio (`src/lib/lgpAlphabet.js`) avalia
   ângulos das articulações e distâncias relativas para identificar a letra.
A letra fica "presa" quando se mantém o gesto durante ~14 *frames* — só
   aí avança no jogo, para evitar falsos positivos.


Os scripts `predev` / `prebuild` descarregam automaticamente:

- o modelo MediaPipe `hand_landmarker.task` para `public/models/` (≈7 MB,
  descarregado uma única vez);
- a *runtime* WASM da `@mediapipe/tasks-vision` para `public/wasm/`.

Depois do primeiro arranque, **a aplicação funciona offline**.

Abrir [http://127.0.0.1:5173](http://127.0.0.1:5173) e autorizar o acesso à
câmara.

## Build de produção

```bash
npm run build
npm run preview
```

A pasta `dist/` resultante pode ser servida por qualquer *static host*.

## Estrutura

```
src/
  App.jsx                 estado global do jogo
  main.jsx                bootstrap React
  styles.css              tema escuro acessível
  components/
    CameraView.jsx        câmara + canvas + loop de inferência
    GamePanel.jsx         palavra-alvo, pontuação, progresso
    AlphabetGuide.jsx     modal com descrição das letras
  lib/
    handTracker.js        carrega o HandLandmarker e gere a câmara
    lgpAlphabet.js        classificador geométrico + filtro de estabilidade
    words.js              banco de palavras + amostragem
```

## Notas

- O reconhecimento é heurístico (sem treino de ML adicional). Funciona para
  utilizadores principiantes que façam os sinais de forma clara, com luz
  razoável e fundo neutro.
- O sistema é deliberadamente *stand-alone*: nenhum estado do utilizador é
  enviado para fora do dispositivo.
