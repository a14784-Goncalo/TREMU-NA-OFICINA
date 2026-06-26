# TREMU NA OFICINA

O **Tremu na Oficina** é um jogo educativo desenvolvido em **React** e **JavaScript**, criado para incentivar a aprendizagem da **Língua Gestual Portuguesa (LGP)** de forma prática e interativa.

O desafio consiste em apresentar ao utilizador uma sequência de palavras que devem ser soletradas através do alfabeto manual da LGP. À medida que cada gesto é reconhecido, o jogo avança automaticamente para a letra seguinte, permitindo ao jogador acompanhar o seu progresso em tempo real.

## Objetivo

O principal objetivo da aplicação é proporcionar uma experiência de aprendizagem acessível e dinâmica, permitindo que qualquer pessoa pratique o alfabeto gestual diretamente no navegador, sem necessidade de instalar software adicional.

## Execução

Para iniciar a aplicação em ambiente de desenvolvimento:

```bash
npm install
npm run dev
```

Para criar a versão de produção:

```bash
npm run build
npm run preview
```

A versão final fica disponível na pasta `dist/`, pronta para ser publicada em qualquer servidor de páginas estáticas.

## Estrutura do projeto

```
src/
  App.jsx
  main.jsx
  styles.css

  components/
    CameraView.jsx
    GamePanel.jsx
    AlphabetGuide.jsx

  lib/
    handTracker.js
    lgpAlphabet.js
    words.js
```

## Características

* Interface simples e intuitiva.
* Prática do alfabeto manual da LGP através de desafios.
* Sistema de pontuação e acompanhamento do progresso.
* Execução totalmente no navegador.
* Não é necessário criar conta nem fornecer dados pessoais.
* Projeto desenvolvido com foco na acessibilidade e inclusão social.

## Observações

A aplicação foi concebida como uma ferramenta de apoio à aprendizagem da Língua Gestual Portuguesa, oferecendo uma forma interativa de praticar o alfabeto manual. O desempenho pode variar consoante a qualidade da imagem captada pela câmara e as condições de iluminação do ambiente.
