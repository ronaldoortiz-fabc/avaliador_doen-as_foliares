# Avaliador Fitopatologico - pastas por protocolo, historico imutavel de envios

## O que foi alterado

A interface de avaliacao, os comandos de voz, as fichas, o historico e a exportacao Excel permanecem iguais aos da versao anterior. **Somente a rotina de sincronizacao Drive foi alterada.**

- Cada protocolo recebe uma subpasta propria em `Avaliacoes_Fitopatologia/`, criada no primeiro envio.
- Cada clique em **Sincronizar agora** gera **novos arquivos JSON e XLSX**, sem atualizar, substituir, mover ou excluir os arquivos ja enviados.
- Os dois arquivos possuem o mesmo prefixo, iniciando com a data da avaliacao (`AAAA-MM-DD`), seguido de hora UTC, milissegundos, identificador aleatorio e codigo do protocolo, por exemplo:
  - `2026-11-05_18-42-10-123_a1b2c3_FP26PR_SO09_avaliacoes.json`
  - `2026-11-05_18-42-10-123_a1b2c3_FP26PR_SO09_avaliacoes.xlsx`
- A data inicial vem do campo **Data** em Ajustes quando ha notas em andamento, ou da ultima avaliacao arquivada quando a ficha atual esta vazia.
- O XLSX e **consolidado**: mantem uma aba por variavel e as avaliacoes arquivadas e atuais. O JSON e um **snapshot** de todo o estado do protocolo, para poder recuperar seu historico.
- **Enviar Excel ao Drive** cria um XLSX novo e independente na mesma pasta, sem substituir arquivos e sem mexer no JSON.
- **Restaurar do Drive** usa o snapshot JSON datado mais recente disponivel na subpasta; se so existir backup antigo diretamente na pasta principal, usa o arquivo legado.
- **Listar ensaios do Drive** busca a copia mais recente de cada subpasta; arquivos antigos na pasta principal continuam acessiveis.
- Avaliacoes continuam salvas automaticamente **no dispositivo** e funcionam offline. Para evitar centenas de arquivos durante o lancamento de notas, **o envio ao Drive passa a ser manual**: clique em Sincronizar agora ao fim de cada avaliacao. Sem internet, faca isso ao retornar.

## Atualizacao no GitHub Pages

1. Antes de alterar, sincronize e baixe um backup JSON da versao atual. **Nao limpe os dados do navegador** e nao apague arquivos do Drive.
2. Extraia este ZIP e envie seu conteudo para o repositorio `avaliador_doen-as_foliares` no GitHub, substituindo os arquivos de mesmo nome. Mantenha `index.html` na raiz e a pasta `icons/` com os PNGs.
3. Em GitHub > Actions, confira a publicacao Pages concluida com sucesso.
4. Abra `https://ronaldoortiz-fabc.github.io/avaliador_doen-as_foliares/` com internet, atualize o navegador, e reinicie o aplicativo instalado se necessario.
5. No aplicativo, selecione um **ensaio de teste** sem dados demonstrativos. Insira notas em algumas parcelas. Na aba Drive, conecte ao Google e clique em **Sincronizar agora**.
6. Confirme no Drive: `Avaliacoes_Fitopatologia/TESTE001/` deve conter um JSON e um XLSX, com a data no inicio do nome.
7. Depois de nova avaliacao, clique em Sincronizar agora novamente. Devem aparecer mais dois arquivos, mantendo os anteriores.
8. Crie o ensaio `TESTE002` e envie uma avaliacao; confira que a nova pasta e exclusiva para ele.
9. Teste **Restaurar do Drive** apenas depois de um backup local; a operacao restaura a copia mais recente e substitui os dados locais do protocolo, mediante confirmacao.

## Avisos importantes

- Nenhum arquivo antigo do Drive e apagado ou movido. A partir desta versao os novos envios vao para subpastas.
- Cada clique manual em **Sincronizar agora** produz um novo par mesmo que os dados nao tenham mudado. A hora e o identificador evitam colisao de nomes.
- Se houver falha no envio Excel apos o JSON, o app informa o erro e deixa o JSON salvo. O botao **Enviar Excel ao Drive** permite enviar uma nova planilha sem modificar o JSON existente.
- Evite enviar novamente durante uma operacao em andamento. Confirme o status antes de sair.
- Um novo upload e sempre um snapshot completo; nao e um unico arquivo contendo somente as notas da ultima avaliacao. Isso preserva a possibilidade de recuperar o estado e o historico integral do protocolo.
- O reconhecimento de voz no modo guiado pode exigir internet, conforme o navegador. O armazenamento offline nao depende disso.
- A autorizacao OAuth e a conta Google previamente configurada continuam as mesmas.

## Arquivos

`index.html`, `ensaios.js`, `drive-sync.js`, `sw.js`, `manifest.webmanifest`, `icons/icon-192.png`, `icons/icon-512.png`, `LEIA-ME_ATUALIZACAO.md`.
