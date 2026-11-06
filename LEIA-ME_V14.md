# Avaliador Fitopatologico - v14

## Ajustes
- Em Meus ensaios, **Sem pasta** so aparece quando existe algum protocolo fora das pastas. Se o total for zero, a entrada e ocultada automaticamente.
- Removido o botao grande de microfone ao lado de **Lancar**. O microfone do teclado Samsung permanece disponivel no campo de notas.
- Preservadas a avaliacao Assistida (offline), a Guiada (maos livres), a navegacao entre parcelas, historico, pastas hierarquicas e a sincronizacao com o Google Drive.

## Como atualizar
1. Sincronize as avaliacoes e faca backup JSON antes de alterar o site.
2. Na raiz do repositorio GitHub Pages, substitua **somente** `index.html` e `sw.js` pelos desta versao.
3. Aguarde a publicacao em Actions.
4. Com internet, abra o PWA instalado e atualize/reabra para carregar a nova versao. Nao desinstale ou limpe o armazenamento.
5. Verifique: pasta vazia Sem pasta nao aparece, e na barra inferior ha apenas campo e botao Lancar.

**Importante:** a pasta experimental `teste-voz-offline` e independente e pode ser mantida. O codigo nao altera nem apaga notas; dados locais permanecem no armazenamento do mesmo endereco.

## Testes realizados
- Sintaxe dos scripts JavaScript (Node.js);
- Checagem do HTML, remocao do microfone direto e da condicao de pasta vazia;
- Integridade do ZIP.

Nao foi possivel fazer teste real com microfone Samsung ou Google Drive autenticado neste ambiente.
