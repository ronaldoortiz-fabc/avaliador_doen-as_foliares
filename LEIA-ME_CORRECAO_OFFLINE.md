# PWA Offline Robusto - atualizacao v8

Esta versao corrige a dependencia de scripts separados durante a abertura offline. A logica de `ensaios.js` e `drive-sync.js` esta incorporada ao `index.html`. Os arquivos originais permanecem no pacote apenas para compatibilidade com instalacoes antigas.

## Atualizar no GitHub
1. Antes de tudo, sincronize seus protocolos e baixe backups JSON. **Nao apague dados do navegador, nao desinstale o app e nao exclua os ensaios locais.**
2. No GitHub, substitua apenas `index.html` e `sw.js` pelos arquivos deste pacote. Os demais arquivos podem permanecer inalterados.
3. Confirme no GitHub Actions que a implantacao ficou verde.
4. No Samsung, conecte internet, abra o **endereco publicado pelo Chrome**, atualize a pagina e entre em Drive. Confirme `Pronto para abrir sem internet`. Feche e reabra com internet uma vez.
5. Desligue Wi-Fi e dados moveis, feche o app e abra **pelo icone instalado**, nao por uma aba antiga que mostra `Off-line` no campo de endereco. Confirme primeiro Meus ensaios e Proxima parcela; depois teste anotacoes apenas em um protocolo ficticio.
6. Ative a internet e sincronize os registros de teste. Confira os JSON e Excel no Drive.

## Observacoes
- O app ainda precisa ter sido carregado online ao menos uma vez depois desta atualizacao para instalar o novo cache. 
- A propria pagina do navegador pode exibir uma *copia offline estatica* sem scripts se o Service Worker nao estiver controlando a pagina. Nessa situacao os botoes nao respondem; para diagnosticar, teste **pelo icone instalado** apos concluir o passo 4.
- O texto-para-fala e o ditado de voz offline continuam dependendo da configuracao do Samsung. A digitacao manual, os ensaios e o historico nao precisam de rede.
- Esta alteracao nao altera a estrutura das avaliacoes nem a sincronizacao com o Drive.
- Nao limpe armazenamento do site: apaga notas ainda nao sincronizadas.
