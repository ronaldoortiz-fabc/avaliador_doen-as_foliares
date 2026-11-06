# Avaliador Fitopatologico - v12 (Pastas em Meus ensaios)

## Atualizar
1. Sincronize e faca backup JSON dos ensaios antes de publicar.
2. No GitHub, substitua apenas `index.html` e `sw.js` na raiz do projeto.
3. Aguarde a publicacao do GitHub Pages e abra o PWA com internet. Nao desinstale nem limpe os dados do navegador.

## Como usar
- Abra **Meus ensaios**. Todos os ensaios atuais comecam em **Sem pasta**.
- Digite o nome e toque **Criar pasta**.
- Abra **Sem pasta** e use **Mover para** em cada protocolo.
- Abra uma pasta para visualizar ou criar ensaios dentro dela.
- Use **Renomear** ou **Excluir pasta** quando quiser; excluir a pasta apenas devolve seus ensaios a **Sem pasta**, nao apaga notas.
- A exclusao de ensaio continua sendo uma acao distinta, com confirmacao pelo codigo do protocolo.

## Limites
- A organizacao de pastas e armazenada no localStorage deste navegador, separadamente das notas e dos historicos.
- A estrutura de pastas NAO e sincronizada com o Google Drive; backups JSON continuam por protocolo.
- Caso o armazenamento do navegador seja apagado, as pastas poderao ser recriadas, e os protocolos recuperados dos respectivos backups.
- Todos os demais recursos do PWA mantidos a partir da v11; o botao de microfone do navegador nao garante funcionamento offline.
