# Atualizacao pontual - botao Excluir ensaio

Esta versao utiliza o mesmo aplicativo de Avaliacoes Fitopatologicas com pastas por protocolo no Drive. **Somente o arquivo `ensaios.js` foi alterado.** As telas de avaliacao, voz, historico, exportacao Excel, autenticacao e sincronizacao com o Drive foram preservadas.

## Como atualizar o GitHub

1. Antes de atualizar, confira seus backups JSON e Excel no Drive.
2. No repositorio `ronaldoortiz-fabc/avaliador_doen-as_foliares`, abra o arquivo `ensaios.js`.
3. Clique no lapis (`Edit this file`), substitua todo o conteudo pelo `ensaios.js` deste pacote e selecione **Commit changes**. Alternativamente envie o arquivo para a raiz do repositorio, substituindo o anterior.
4. Na aba **Actions**, aguarde a publicacao do GitHub Pages terminar com sucesso.
5. Reabra o app com internet. Se a versao anterior estiver em cache, atualize a pagina e reabra o aplicativo instalado. Nao limpe os dados do site, pois isso apaga as avaliacoes locais.

## Como excluir

1. Clique em **Meus ensaios**.
2. Ao lado do protocolo que deseja remover, clique em **Excluir**.
3. Leia a mensagem. Digite **exatamente o codigo do protocolo** para confirmar.
4. O cadastro, as notas e o historico desse protocolo sao removidos apenas do armazenamento local desse navegador/perfil. O JSON e o Excel no **Google Drive permanecem intactos**.
5. Se o protocolo excluido era o atual, o aplicativo abre outro protocolo existente antes de excluir. Para proteger a navegacao, o ultimo protocolo da lista nao pode ser apagado sem criar outro.

## Observacoes

- Nenhum arquivo existente no Google Drive sera excluido, renomeado ou substituido por este botao.
- Se posteriormente restaurar o mesmo protocolo do Drive, ele aparecera de novo em Meus ensaios.
- O botao evita exclusao enquanto uma sincronizacao estiver em andamento.
- A instalacao e o endereco do aplicativo nao mudam; nao precisa refazer o OAuth.
