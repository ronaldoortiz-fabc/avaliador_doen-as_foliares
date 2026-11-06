# Correção do funcionamento offline — PWA

Esta atualização altera somente `index.html` e `sw.js`. A interface de avaliação, o modo assistido, ensaios, dados, Drive, Excel e JSON são preservados.

## Atualização no GitHub

1. Confirme que as avaliações atuais estão sincronizadas; baixe o JSON antes de atualizar.
2. Substitua **index.html** e **sw.js** na raiz do repositório. Não altere os demais arquivos.
3. Aguarde o status verde no Actions. Abra o app no Chrome **com internet** e recarregue.
4. Abra a aba Drive e confira `Pronto para abrir sem internet (interface e scripts armazenados)`.
5. Feche o aplicativo, habilite modo avião e abra o ícone na tela inicial. Teste Meus ensaios, mudar parcela, registro manual e histórico.
6. Reative internet, conecte Google e sincronize, comprovando os novos arquivos na pasta do protocolo.

**Nunca limpe os dados de navegação ou desinstale antes do backup.** Isso pode excluir avaliações locais.

## O que foi corrigido

O Service Worker antigo tentava acessar a rede em cada solicitação, e um cache incompleto ou uma página de visualização offline do Chrome podia exibir HTML sem JavaScript funcional. Agora o Service Worker instala um conjunto completo de arquivos e utiliza **cache primeiro** para a interface e scripts. Uma atualização de versão requer trocar o identificador de cache no sw.js; as demais funções foram preservadas.

## Limitações

- O reconhecimento da fala do teclado depende das opções offline do Samsung; a reprodução de voz depende de uma voz pt-BR instalada.
- Um PWA não é imune à limpeza de dados do navegador ou à remoção do site pelo Android. Continue fazendo backup no Drive.
- O funcionamento real em Samsung S25 deve ser validado no aparelho. Este pacote foi revisado por sintaxe, não testado fisicamente.
- Se o Chrome mostrar uma página offline estática e sem botões, abra a versão com internet, confirme a verificação do cache e só então repita o teste.
