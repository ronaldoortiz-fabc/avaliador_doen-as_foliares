# Avaliações Fitopatológicas — vários ensaios independentes

## O que mudou

- Botão **Meus ensaios** para criar, abrir e alternar protocolos.
- Cada protocolo tem dados locais próprios: notas, avaliação anterior, histórico, número de parcelas, doenças e ajustes.
- Cada sincronização bem-sucedida salva **dois arquivos por protocolo** na pasta `Avaliacoes_Fitopatologia` de sua conta Google Drive: `<PROTOCOLO>_avaliacoes.json` (recuperação completa) e `<PROTOCOLO>_avaliacoes.xlsx` (resultado, uma aba por doença). Mesmo um ensaio ainda sem notas pode produzir Excel com estrutura vazia.
- Aba Drive: **Listar ensaios do Drive** e **Recuperar ensaio selecionado** para trazer um protocolo ainda não existente neste aparelho.
- A ficha original, a entrada por voz, o histórico, o modo assistido e o download Excel continuam presentes.
- A versão antiga de um único protocolo salva sob `fichaVoz.v2` é **copiada** para o novo banco local na primeira abertura, sem apagar o original.

## ATUALIZAR seu site GitHub Pages

Seu site atual é: `https://ronaldoortiz-fabc.github.io/avaliador_doen-as_foliares/`

1. **Antes de substituir arquivos**, abra o aplicativo antigo com internet, conecte o Google e confirme que seu protocolo já aparece no Drive. Baixe também um backup JSON como medida adicional. **Não limpe os dados do navegador nem desinstale o app.**
2. Extraia o ZIP. Dentro da pasta `Avaliador_Fitopatologia_Multiplos_Ensaios` estão os arquivos que devem ir para a **raiz** do mesmo repositório GitHub:
   - `index.html`
   - `drive-sync.js`
   - `ensaios.js` (**novo**)
   - `sw.js`
   - `manifest.webmanifest`
   - pasta `icons/`
   - este guia (opcional)
3. No GitHub, abra seu repositório `avaliador_doen-as_foliares`, substitua os arquivos antigos pelos novos e adicione `ensaios.js`. Você pode fazer isso pelo menu **Add file > Upload files**: arraste os arquivos e confirme o commit, verificando os caminhos. Para substituir itens específicos, use o editor de arquivos ou outra forma de atualização do repositório; não deixe cópias duplicadas em subpastas. Mantenha `index.html` na raiz.
4. Aguarde o GitHub Pages indicar que a versão foi publicada. Abra a URL do site no navegador e atualize a página. **O aplicativo usa cache offline:** se aparecer a versão antiga, feche e abra novamente ou recarregue a página duas vezes com internet. No celular, recarregue o endereço com conexão antes de trabalhar offline.
5. O **mesmo ID de cliente OAuth** já autorizado deve continuar funcionando, pois o domínio do GitHub Pages é o mesmo. Não inclua a chave secreta do cliente no código.

## Uso diário

1. Clique em **Meus ensaios**. Crie `FP26PR_SO10` com a quantidade de parcelas, por exemplo. O sistema abre o ensaio vazio.
2. Na aba **Ajustes**, altere avaliador, variáveis, datas e demais configurações. O **código do protocolo fica fixo**, evitando que trocar o código misture notas antigas.
3. Lance as notas por voz ou manualmente em **Avaliar**. As informações ficam no próprio aparelho, mesmo sem internet, depois que o app tiver sido carregado e armazenado no cache.
4. No fim de cada data, vá em **Histórico > Finalizar avaliação** para arquivar a data e preparar a próxima avaliação. Como na versão original, confirme antes de finalizar.
5. Quando tiver internet, acesse **Drive > Conectar Google** (se necessário) e **Sincronizar agora**. Aguarde a confirmação de **JSON e Excel salvos**.
6. Entre em **Meus ensaios** e abra outro ensaio. Cada um tem seu próprio histórico e sincronização.
7. Na aba **Excel > Baixar .xlsx**, também é possível baixar o Excel localmente, sem internet.

## Recuperar no outro aparelho

1. Abra o mesmo endereço do aplicativo, conectado à internet.
2. Em **Drive**, informe o ID OAuth e clique em **Conectar Google**.
3. Clique em **Listar ensaios do Drive**, escolha o código e clique em **Recuperar ensaio selecionado**.
4. O ensaio entrará em **Meus ensaios**. Se já existir no aparelho, abra esse código e use **Restaurar do Drive** com cuidado: a restauração substitui o estado local selecionado, preservando um backup local.

## Segurança e limites

- **Drive não sincroniza offline.** O app grava localmente e envia quando houver internet e uma autorização OAuth válida. O login pode expirar; reautorize e use **Sincronizar agora**. Não considere uma avaliação protegida no Drive até a mensagem explícita de sucesso.
- O reconhecimento automático de voz **Guiada (mãos livres)** costuma depender da rede. O ditado offline no modo Assistido depende do teclado/sistema do celular.
- A sincronização verifica o arquivo JSON remoto contra a revisão conhecida. Em caso de edição por outro aparelho, exibe um conflito; **não** force a substituição sem antes restaurar/comparar os dados. O botão **Substituir cópia remota** cria backup da versão JSON anterior, mas é uma operação destrutiva se houver alterações concorrentes.
- O arquivo Excel no Drive é um **derivado** das notas salvas no JSON. Para restauração use o JSON, não o Excel.
- Não edite manualmente os arquivos JSON no Drive. Se renomear ou mover arquivos, a recuperação automática pode não os encontrar.
- O Google Drive usa o escopo `drive.file`: a aplicação enxerga seus próprios arquivos criados/autorizados; não tem acesso geral a todo o seu Drive.
- A publicação do GitHub Pages é pública em configurações comuns. Não coloque JSON com notas reais, segredos OAuth ou dados confidenciais no repositório; esses dados pertencem à conta Drive autorizada.
- Seu armazenamento do navegador é por **origem** (domínio). Trocar de domínio ou limpar dados do navegador exige restaurar do Drive.
- Se sua conta Google usa modo **Testing** para um aplicativo OAuth externo, o acesso pode requerer reautorização após expiração; mantenha o usuário de teste autorizado.

## Teste obrigatório após a atualização

1. Abra `FP26PR_SO09`, anote uma nota de teste e confira se ela permanece após recarregar a página.
2. Crie `FP26PR_SO10`, lance uma nota diferente, volte ao `FP26PR_SO09` e confirme que não houve mistura.
3. Sincronize cada ensaio individualmente e confira no Drive os quatro arquivos (`.json` e `.xlsx` de cada protocolo).
4. Abra uma planilha `.xlsx` e confirme abas por doença e uma coluna por avaliação.
5. Desative a internet, registre notas e reabra o aplicativo. Ligue a internet novamente e sincronize.
6. Antes de usar em avaliações reais, verifique a restauração de um protocolo de teste em **outro navegador ou aparelho**.

## Detalhes técnicos

- Armazenamento local por protocolo: `fichaVoz.multi.state:<CODIGO>`.
- Índice local: `fichaVoz.multi.registry.v1`; projeto ativo: `fichaVoz.multi.active.v1`.
- Estado original `fichaVoz.v2` preservado.
- PWA com cache versionado em `sw.js`; dados não são enviados para o Service Worker.
- OAuth Google Identity Services, token apenas em memória; nenhuma chave secreta é necessária.

**Estado da entrega:** verificação de sintaxe e estrutura realizadas. A autenticação e escrita reais no Drive devem ser confirmadas por você no site publicado; não foram executadas com acesso à sua conta.
