# Ficha de Voz – versão PWA + Google Drive

Esta é uma adaptação do HTML `FP26PR_SO09.html` para uso pessoal. Preserva as abas **Avaliar, Ficha, Histórico, Excel e Ajustes**, incluindo entrada de notas, modos de voz, histórico e exportação `.xlsx`, e acrescenta a aba **Drive**.

## O que funciona

- **Sem internet:** interface (após a primeira visita online e instalação), lançamento de notas, ficha, histórico, fechamento de avaliações e exportação Excel. O estado é salvo no armazenamento do navegador (`localStorage`) a cada alteração.
- **Com internet e conta Google autorizada:** sincronização automática após alterações (aproximadamente 15 segundos) ou por botão, criando a pasta `Avaliacoes_Fitopatologia` no Google Drive e o arquivo `<PROTOCOLO>_avaliacoes.json`.
- **Recuperação:** botão **Restaurar do Drive** ou importar backup JSON local. Antes de restaurar, o aplicativo preserva um backup local; o usuário deve confirmar.
- **Proteção contra conflitos:** se o arquivo remoto divergir da revisão conhecida no dispositivo, o envio é bloqueado. **Substituir cópia remota (com backup)** exige confirmação e cria uma cópia datada do arquivo anterior no Drive.
- **Segurança:** autenticação Google OAuth com escopo `drive.file`. Não há senha nem segredo de cliente no código; tokens de acesso permanecem só na memória do navegador.

**Limitações importantes:** modo de voz `Guiada (mãos livres)` depende da implementação de reconhecimento de voz no navegador e normalmente requer internet; o modo `Assistida` usa o microfone do teclado e a disponibilidade de ditado offline depende do teclado/sistema operacional. O app pode operar offline depois de carregado uma vez, mas armazenamento local e cache podem ser eliminados pelo usuário/sistema. Realize backups e confirme a sincronização no Drive antes de apagar dados do aparelho. A autenticação Google deve ser refeita após reiniciar/expirar a sessão. O modo offline não realiza upload até a conexão voltar e houver autorização ativa.

## Publicar o aplicativo (GitHub Pages)

1. Crie um repositório **privado ou público conforme sua política de dados** para desenvolvimento; observe que GitHub Pages em repositórios de determinados planos/configurações pode publicar o site de modo público. **O código não contém notas por padrão**, mas seu endereço do aplicativo será acessível a quem tiver o link. As avaliações ficam locais ou no Drive pessoal autenticado.
2. Adicione **todos os arquivos e pastas** deste pacote na raiz do repositório: `index.html`, `drive-sync.js`, `sw.js`, `manifest.webmanifest` e `icons/`.
3. Em **Settings → Pages**, selecione **Deploy from a branch**, `main`, `/ (root)`. Após publicar, anote o endereço HTTPS, por exemplo `https://USUARIO.github.io/NOME-REPOSITORIO/`.
4. Abra o endereço em um navegador atualizado no celular e use a opção de **Adicionar à tela inicial** / **Instalar aplicativo**, se disponível.

Pode usar qualquer outra hospedagem estática HTTPS que preserve esses caminhos relativos. **Não** basta colocar o `index.html` no Google Drive: o Drive é o armazenamento dos dados, não a hospedagem PWA.

## Configurar o acesso à sua conta Google

1. Entre em https://console.cloud.google.com e crie/selecione um projeto.
2. Em **APIs e serviços → Biblioteca**, habilite a **Google Drive API**.
3. Em **Google Auth Platform** (ou **APIs e serviços → Tela de consentimento OAuth**), configure o aplicativo. Para uso pessoal, use o modo de testes e inclua o endereço da sua conta Google em **Usuários de teste**, quando solicitado. Configure a marca/contato exigidos pela interface atual do Google Cloud.
4. Crie **Cliente OAuth 2.0** do tipo **Aplicativo da Web** (em Clientes / Credenciais). Em **Origens JavaScript autorizadas**, inclua somente a **origem** da hospedagem, por exemplo `https://USUARIO.github.io` — **sem** `/NOME-REPOSITORIO/`. Para desenvolvimento local, pode adicionar `http://localhost:8000`.
5. Copie o **ID do cliente**, que termina em `.apps.googleusercontent.com` (não é um segredo; **não** coloque um client secret no HTML).
6. No aplicativo, abra **Drive → ID do cliente OAuth 2.0**, cole o ID e clique em **Conectar Google**. Conceda a permissão solicitada. Depois clique em **Sincronizar agora**.
7. Verifique no seu Drive a pasta `Avaliacoes_Fitopatologia` e o JSON com nome do protocolo. Use o botão **Abrir pasta no Drive** para conferir.

A tela de consentimento do Google e a disponibilidade de publicação/teste variam conforme configuração da conta pessoal ou Google Workspace. Em contas institucionais, o administrador pode exigir aprovação do aplicativo.

## Procedimento de campo

1. **Antes do campo:** abra o aplicativo online para garantir que os arquivos foram carregados, remova as parcelas de demonstração usando **Limpar**, ajuste protocolo, avaliador, número de parcelas e variáveis. Clique em **Conectar Google → Sincronizar agora** e confirme a cópia no Drive.
2. **No campo:** faça as avaliações mesmo sem internet. O navegador salva localmente; acompanhe a aba **Histórico** e faça backups JSON periódicos se possível.
3. **Após o campo:** conecte à internet; se necessário, clique em **Conectar Google** novamente. Clique em **Sincronizar agora** e espere a confirmação explícita. Abra a pasta do Drive e confira a existência do arquivo.
4. **Para baixar em Excel:** abra **Excel → Baixar .xlsx**. Selecione incluir a avaliação de hoje ou somente as arquivadas. O Excel é gerado **localmente** e não precisa de internet.
5. **Troca de aparelho:** abra o app publicado no novo aparelho, conecte a **mesma conta Google** e escolha o **mesmo protocolo** em Ajustes. Na aba Drive, clique em **Restaurar do Drive**. Não use **Sincronizar agora** antes da restauração se já existir uma cópia remota diferente.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Interface original + aba Drive |
| `drive-sync.js` | Login OAuth, criação de pasta, sincronização e restauração |
| `sw.js` | Cache offline dos arquivos de interface |
| `manifest.webmanifest` | Instalação do PWA |
| `icons/` | Ícones para tela inicial |

## Cuidados

- **Este é um protótipo técnico pronto para configuração, não um serviço já publicado.** O login real e os envios ao Drive precisam ser testados na sua hospedagem, com seu cliente OAuth.
- No navegador antigo onde há avaliações reais, faça backup antes de mudar de endereço: o armazenamento local é isolado por **origem**, portanto o HTML aberto como arquivo não transfere automaticamente as notas para o endereço HTTPS novo. Use **Baixar backup JSON** quando disponível na nova versão, ou uma migração do localStorage anterior.
- O nome do arquivo remoto depende do código do protocolo; mantenha um código único por experimento. A versão entregue mantém **um protocolo ativo por instalação/navegador**; trocar o código não separa automaticamente as notas locais. Para múltiplos protocolos independentes, use uma instância/perfil separado ou evolua o app para um gerenciador de protocolos.
- Não compartilhe backups JSON publicamente: eles podem conter nomes de avaliadores, metadados e avaliações ainda não publicadas.
