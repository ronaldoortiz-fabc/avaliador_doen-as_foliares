# Avaliador Fitopatologico - v15 - Toque na parcela e leitura automatica

## Mudanca
- Ao tocar em qualquer numero na grade PARCELAS, o aplicativo seleciona a parcela e inicia automaticamente o modo Assistida (offline), anunciando: "Parcela X. [primeira variavel pendente]. Anterior [nota]".
- Se a Assistida ja esta ativa, tocar em outra parcela reanuncia a parcela escolhida e a variavel. Tocar na mesma parcela repete o anuncio.
- Funciona mesmo quando o ensaio ainda nao tem nenhuma nota, sem forcar a parcela 1.
- Se o modo Guiada (maos livres) estiver ativo, o toque na parcela o encerra e inicia a Assistida, evitando disputa entre os dois sistemas de voz.
- O botao Assistida (offline) continua servindo para pausar/reiniciar a leitura.
- O reconhecimento de notas permanece pelo microfone do teclado Samsung; a mudanca e apenas na fala sintetizada do aplicativo e no inicio automatico do modo Assistida.
- Nao altera historico, notas, exportacao Excel, pastas ou sincronizacao Drive.

## Atualizacao segura
1. Com as avaliacoes sincronizadas e backup JSON salvo, extraia o ZIP.
2. Substitua APENAS index.html e sw.js na raiz do mesmo repositorio GitHub Pages.
3. Aguarde o GitHub Pages publicar. Com internet abra o aplicativo instalado para atualizar o cache.
4. Nao desinstale o PWA nem limpe os dados do Chrome: isso pode apagar avaliacoes locais.

## Teste simples no Samsung
1. Abra um ensaio ja existente e toque diretamente no numero 8 na grade PARCELAS, sem tocar em Assistida.
2. Deve anunciar "Parcela 8", a primeira doenca/variavel pendente e a nota anterior correspondente.
3. Toque em 2: deve anunciar "Parcela 2" e o contexto correto.
4. Toque novamente em 2: deve repetir o anuncio.
5. Avalie uma nota usando o ditado do teclado como antes. Ao finalizar, a confirmacao da nota e "Parcela X finalizada" permanecem.

## Validacao
Sintaxe dos scripts e estrutura do pacote verificadas automaticamente. A sintese de voz no Samsung S25 ainda requer teste no aparelho.
