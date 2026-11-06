# Laboratório experimental: voz offline no Samsung S25

**Este é um protótipo isolado. Não substitui o Avaliador Fitopatológico de produção.** Não contém ensaios, notas ou sincronização com Google Drive. Sua finalidade é validar se o Chrome/PWA do Samsung consegue executar o Vosk WebAssembly com um modelo de português 100% local.

## 1. Publicar em pasta separada

1. Extraia o ZIP no computador.
2. No repositório `ronaldoortiz-fabc/avaliador_doen-as_foliares`, crie um diretório **`teste-voz-offline`** e envie os arquivos de `Teste_Voz_Offline_Vosk` dentro dele, incluindo a pasta `icons`.
3. **Não substitua** o `index.html`, `sw.js` nem outros arquivos da raiz. A versão de produção continua intacta.
4. Depois de publicar, abra com internet: `https://ronaldoortiz-fabc.github.io/avaliador_doen-as_foliares/teste-voz-offline/`.
5. O teste usa o navegador sob HTTPS; não abra diretamente um arquivo `file://`.

## 2. Preparação inicial ONLINE

1. Toque **Preparar reconhecimento offline**.
2. Ele baixa a biblioteca Vosk e um modelo brasileiro de cerca de 32 MB. O download pode ser demorado e a carga usa memória relevante.
3. Aguarde o estado **Modelo carregado**. Permita o acesso ao microfone.
4. Toque no botão grande e fale `seis`, `parcela seis`, `trinta e oito`, `parcela quarenta e dois`.
5. Verifique **Transcrição recebida** e **Valor interpretado**. O teste não lança notas em ensaios.

## 3. Teste real OFFLINE

1. **Não limpe os dados do navegador**, pois isso apaga o modelo em cache.
2. Ative **modo avião** e desative Wi-Fi.
3. Feche o laboratório e abra de novo o endereço que já foi carregado (ou o PWA instalado).
4. Toque novamente em **Preparar reconhecimento offline**. Não deverá haver download; deve aparecer no registro que a biblioteca e o modelo vieram do cache.
5. Toque no microfone e repita frases numéricas.
6. Clique em **Diagnosticar cache**; deve mostrar modelo e biblioteca no cache e `offline` na conexão.
7. Anote resultados: tempo até carregar, frases reconhecidas/erros, se abriu sem internet e se houve travamentos.

## 4. Como interpretar o resultado

- **PASSOU:** abre offline, carrega modelo em cache, capta microfone sem teclado, reconhece números corretamente em pelo menos várias tentativas. Isso torna a integração ao avaliador tecnicamente promissora, mas ainda requer ensaio de campo e confirmação do consumo de bateria.
- **FALHOU:** guarde a mensagem da tela/Registro de diagnóstico e informe o ponto da falha. Não substitua a versão de produção.
- **Download falhou:** o link externo pode estar bloqueado pela rede ou pelo CORS; a solução definitiva seria distribuir biblioteca e modelo no mesmo domínio ou como parte de uma instalação controlada.
- **Interpretação errada:** anote o texto efetivamente transcrito; erros do motor e do interpretador são distintos.

## 5. Limitações e observações

- Testei **sintaxe do JavaScript** e **14 casos do interpretador de números** no ambiente de desenvolvimento. Não foi possível baixar o modelo/engine aqui por restrição de rede nem controlar o microfone físico do Samsung; portanto **o reconhecimento offline no S25 ainda NÃO foi comprovado**.
- O áudio é processado pelo Vosk local. O download dos arquivos (somente na preparação inicial) acessa jsDelivr e Hugging Face. Após baixar e armazenar os arquivos, a inferência dispensa rede.
- O navegador pode eliminar o cache por pressão de armazenamento. Instalação do PWA não garante armazenamento permanente.
- O Vosk tem limitações de exatidão para áudio em ambiente ruidoso; avalie em campo antes de lançar notas automaticamente.
- No Android, nem todo Chrome/versão executa WebAssembly com a mesma estabilidade ou memória disponível.
- O código HTML/JS está em fonte aberta neste ZIP e pode ser ajustado.

## 6. Fontes técnicas

- API Vosk Browser: https://github.com/ccoreilly/vosk-browser
- Modelo pt-BR Vosk: https://alphacephei.com/vosk/models
- Pacote do modelo tar.gz usado no protótipo: https://huggingface.co/Andesprit/vosk-small
- CDN: https://cdn.jsdelivr.net/npm/vosk-browser@0.0.8/dist/vosk.js
