# Versão 11 — botão grande de microfone

Na barra inferior, ao lado de **Lançar**, foi adicionado um botão grande de microfone. Um toque inicia o reconhecimento da fala pelo navegador; outro toque interrompe. A nota ou o número da próxima parcela é registrado conforme o estado atual do aplicativo. O botão não abre o teclado.

**Limitação importante:** o Chrome/Android costuma depender da internet para transcrição via SpeechRecognition. Não é tecnicamente permitido a uma página web acionar o ícone de ditado do teclado Samsung. Para funcionar sem internet, continue usando o microfone do teclado no modo **Assistida (offline)** ou digite. Esse botão novo não muda o suporte offline das demais funcionalidades.

**Atualização:** faça backup JSON/Drive antes; no GitHub substitua `index.html` e `sw.js`. Aguarde a publicação, abra com internet e teste. Não limpe os dados do PWA.

**Teste:** iniciar Assistida, tocar no botão grande, falar `10`, conferir confirmação; concluir a última doença, ouvir `10. Parcela 1 finalizada.`, tocar no botão e falar `Parcela 6` ou `6`. Testar também na ausência de internet: se o reconhecimento direto falhar, usar o ditado do teclado.
