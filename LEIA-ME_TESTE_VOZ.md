# Atualização pontual — voz no modo Assistida (offline)

A interface e as funções de avaliação, histórico, múltiplos ensaios e Google Drive não foram alteradas.

## Correção
- A rotina de síntese de voz aguarda o início e o fim reais do áudio, em vez de avançar por um temporizador mesmo quando a fala não tocou.
- Tenta recuperar a síntese de voz pausada no Samsung/Chrome e, se necessário, repetir com a voz padrão.
- Ao iniciar a avaliação assistida, anuncia parcela, variável e a nota anterior; se não existir, diz «Sem nota anterior».
- Se o áudio falhar, mostra uma mensagem de diagnóstico sem impedir digitar as notas.
- O cache PWA foi atualizado para baixar a versão corrigida.

## Atualizar o GitHub
1. Antes, sincronize e exporte um backup de seus ensaios.
2. No repositório atual, substitua SOMENTE `index.html` e `sw.js` pelos arquivos deste pacote.
3. Aguarde GitHub Actions/Pages concluir. Reabra o aplicativo com internet para atualizar os arquivos offline.
4. Não limpe dados do navegador nem desinstale o PWA antes de garantir backup e restaurabilidade.

## Teste no Galaxy S25
1. Em Ajustes, confira a velocidade da fala. No modo Assistida, a nota anterior será anunciada independentemente da opção específica do modo Guiada.
2. Abra um protocolo com notas na coluna Anterior; toque em `Assistida (offline)`.
3. O app deve dizer, por exemplo, `Parcela 1. Oídio. Anterior 5.` antes de liberar o ditado.
4. Depois fale/digite uma nota, confira o anúncio da próxima doença e teste em modo avião.
5. Se não ouvir nada, aumente o VOLUME DE MÍDIA e verifique `Configurações > Gerenciamento geral > Saída de texto para voz` (o caminho varia pela versão One UI), escolhendo voz em português e testando reprodução.
6. O microfone do teclado pode depender do pacote offline instalado; reconhecer ditado offline não é garantido pela síntese de voz.

**Validação:** a sintaxe dos arquivos JS foi verificada. Não houve teste físico de reprodução de áudio no Samsung; valide antes de usar em campo.
