# Atualização - navegação de parcelas por voz (PWA v9)

## O que mudou
- A interface permanece igual. Em **Ajustes > Avançar sozinho**, há a opção **Por voz: escolher próxima parcela**, ativada por padrão para novos e antigos ensaios ao primeiro carregamento desta versão. Pode retornar ao avanço numérico.
- No modo por voz, ao completar a última doença o aplicativo diz apenas **Parcela X finalizada.** e espera um número inteiro (ex.: `6`, `seis`, `Parcela 6`, `Parcela seis`).
- Enquanto uma doença está ativa, números são notas. Quando aguarda parcela, números são códigos de parcela.
- O número deve estar entre 1 e o total de parcelas. O envio para Drive, a estrutura de JSON e Excel, o histórico e a interface não mudaram.
- No modo Assistida (offline), a escolha pode ser digitada ou ditada pelo microfone do teclado. A disponibilidade do ditado offline depende do Samsung. No modo Guiada, o reconhecimento do navegador pode requerer conexão.

## Atualizar
1. Faça backup JSON de todos os ensaios antes de atualizar.
2. No repositório GitHub substitua apenas `index.html` e `sw.js` pelos dois arquivos deste pacote.
3. Aguarde GitHub Actions verde; abra com internet e recarregue a versão.
4. **Não limpe os dados do site nem desinstale o PWA**, pois avaliações locais ainda não sincronizadas podem ser perdidas.

## Teste
1. Abra um protocolo TESTE com 12 parcelas e 2 variáveis, sem dados anteriores.
2. Acione Assistida e lance a nota da primeira e segunda doença. O app deve dizer `Parcela 1 finalizada.`
3. Diga ou digite `6` — deve abrir a parcela 6. Complete e diga `Parcela 2`.
4. Tente `100`: deve rejeitar sem trocar a parcela.
5. Feche e reabra para conferir preservação do ensaio e exporte o Excel.

A mudança foi verificada por sintaxe e testes lógicos automatizados. A voz e o ditado devem ser confirmados no Samsung.
