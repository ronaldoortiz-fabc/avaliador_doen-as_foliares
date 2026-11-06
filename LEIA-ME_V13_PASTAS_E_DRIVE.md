# Avaliador Fitopatologico - v13: pastas e Drive hierarquicos

## Novidades
- Crie pastas e subpastas sem nivel fixo. Ex.: `Verao 2026-27 / Soja / CDE Castro / FP26PR_SO09`.
- "Criar pasta" dentro de uma pasta cria uma subpasta; "Voltar" sobe um nivel.
- Mova pastas inteiras ou protocolos; renomeie; excluir pasta promove suas subpastas e transfere os protocolos diretos para a pasta superior (ou Sem pasta).
- Sincronizar JSON+Excel e Enviar Excel ao Drive criam o mesmo caminho dentro de `Avaliacoes_Fitopatologia`.
- Nao altera as notas, historicos, exportacao XLSX, avaliacao por voz ou funcionamento offline.

## ATENCAO ao Google Drive
- **Nao movemos nem apagamos backups antigos**. Ao mover/renomear uma pasta local, o proximo envio cria novos arquivos no caminho atualizado. Os anteriores continuam no caminho antigo.
- Restaurar procura copias do protocolo na hierarquia atual e nas pastas antigas criadas pelo app.
- Importar ensaio do Drive recupera o caminho de pastas da copia encontrada, quando disponivel.
- A arvore de pastas e atribuicoes continua guardada localmente; ela e refletida no Drive durante sincronizacao de protocolos, mas NAO e uma sincronizacao bidirecional automatica de pastas vazias.
- Com a permissao Google Drive `drive.file`, o app somente tem acesso aos arquivos permitidos/criados pelo aplicativo.

## Atualizacao
1. Sincronize cada ensaio e baixe backups JSON antes de publicar.
2. Substitua `index.html` e `sw.js` na raiz do repositorio GitHub. Os demais arquivos podem permanecer.
3. Espere o GitHub Pages concluir a publicacao, abra o PWA com internet e confira a atualizacao.
4. **Nao desinstale, limpe dados ou armazenamento do navegador.**
5. Teste com um ensaio ficticio antes de sincronizar ensaios reais.

## Limites e precaucoes
- Pasta `Sem pasta`: ensaios soltos vao para `Avaliacoes_Fitopatologia/<PROTOCOLO>`.
- Apenas as pastas necessarias para os protocolos sincronizados sao criadas no Drive.
- A pesquisa recursiva de backups pode ficar mais lenta em contas com centenas de pastas.
- O Drive nao e alterado ao mover ou apagar uma pasta *localmente*; somente o destino dos futuros envios muda.
- Validacao automatica: sintaxe JavaScript e testes logicos com armazenamento simulado. O teste real com conta Google no S25 continua necessario.
