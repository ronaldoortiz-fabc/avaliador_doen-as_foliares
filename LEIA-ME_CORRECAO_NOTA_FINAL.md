# Versão 10 — confirmação da última nota

Correção solicitada: quando o avaliador informa a última nota da parcela, o aplicativo **repete essa nota antes de anunciar** `Parcela X finalizada.`

Exemplo: na última doença da parcela 1, avaliador diz `10` → aplicativo diz `10. Parcela 1 finalizada.`. Depois aguarda `6` ou `Parcela 6` para iniciar a próxima parcela.

A mudança foi aplicada à avaliação **Guiada (mãos livres)** e à **Assistida (offline)**, além do lançamento manual com retorno de voz. As demais notas seguem com a confirmação já existente. Nenhuma alteração na estrutura do armazenamento ou do Drive.

## Publicar no GitHub

1. Faça backup de suas avaliações e sincronize com o Drive, se possível.
2. Substitua apenas `index.html` e `sw.js` pelos arquivos deste ZIP.
3. Aguarde a publicação pelo GitHub Actions e abra o aplicativo com internet para atualizar o cache.
4. **Não desinstale o PWA nem apague os dados do site.**
5. Teste num protocolo fictício com duas doenças: informe `5` na primeira, `10` na última, ouça `10. Parcela 1 finalizada.`, depois diga `6` e confirme a mudança de parcela.

O teste de reconhecimento e reprodução de voz ainda deve ser feito no Samsung.
