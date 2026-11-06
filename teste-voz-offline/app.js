'use strict';
/* Laboratorio autônomo: nenhum vínculo com o armazenamento de ensaios. */
const LIB_URL='https://cdn.jsdelivr.net/npm/vosk-browser@0.0.8/dist/vosk.js';
const MODEL_URL='https://huggingface.co/Andesprit/vosk-small/resolve/main/vosk-model-small-pt-0.3.tar.gz?download=true';
const ASSET_CACHE='laboratorio-voz-modelo-v1';
const LIB_KEY='https://local-voice-assets.invalid/vosk-browser-0.0.8.js';
const MODEL_KEY='https://local-voice-assets.invalid/vosk-small-pt-0.3.tar.gz';
const $=id=>document.getElementById(id);
let model=null, recognizer=null, stream=null, context=null, processor=null, source=null, gain=null;
let micActive=false, transcribed='', busy=false, scriptUrl=null, modelUrl=null;
function log(s){const t=new Date().toLocaleTimeString('pt-BR');$('log').textContent+='['+t+'] '+s+'\n';$('log').scrollTop=$('log').scrollHeight;}
function setupMessage(s,cls=''){ $('setupStatus').textContent=s; $('setupStatus').className='status '+cls;}
function micMessage(s,cls=''){ $('micStatus').textContent=s; $('micStatus').className='status '+cls;}
function normalize(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\bparcela numero\b/g,'parcela').replace(/[.,;:!?]/g,' ').replace(/\s+/g,' ').trim();}
const UNITS={zero:0,um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9};
const TEENS={dez:10,onze:11,doze:12,treze:13,quatorze:14,catorze:14,quinze:15,dezesseis:16,dezassete:17,dezessete:17,dezoito:18,dezenove:19};
const TENS={vinte:20,trinta:30,quarenta:40,cinquenta:50,sessenta:60,setenta:70,oitenta:80,noventa:90};
const HUNDREDS={cem:100,cento:100,duzentos:200,trezentos:300,quatrocentos:400,quinhentos:500,seiscentos:600,setecentos:700,oitocentos:800,novecentos:900};
function numberWords(s){
  const clean=normalize(s).replace(/\b(numero|parcela|nota|e)\b/g,' ').trim();
  if(/^\d{1,4}$/.test(clean))return Number(clean);
  const words=clean.split(/\s+/).filter(Boolean); if(!words.length)return null;
  let total=0,last=Infinity;for(const w of words){let n=UNITS[w]??TEENS[w]??TENS[w]??HUNDREDS[w];if(n===undefined)return null;
    const mag=n>=100?100:n>=20?10:1;
    if(mag>last)return null;last=mag;total+=n;
  }
  return total<=9999?total:null;
}
function interpret(s){let clean=normalize(s);const isParcel=/\bparcela\b/.test(clean);const n=numberWords(clean);return {raw:s,kind:isParcel?'parcela':'numero',number:n,valid:n!==null&&Number.isInteger(n)&&n>=0};}
function showText(raw){const t=String(raw||'').trim();if(!t)return;$('transcript').textContent=t;const r=interpret(t);$('number').textContent=r.valid?r.number:'Não reconhecido';$('kind').textContent=r.valid?(r.kind==='parcela'?'Comando de parcela':'Comando numérico (nota ou parcela, conforme a etapa)'):'A frase não corresponde a um número válido.';log('Reconhecido: '+t+' -> '+(r.valid?r.number:'indefinido'));}
async function cacheInfo(){const c=await caches.open(ASSET_CACHE);const a=await c.match(LIB_KEY),b=await c.match(MODEL_KEY);const asz=a?Number(a.headers.get('content-length')||0):0,bsz=b?Number(b.headers.get('content-length')||0):0;return {c,lib:a,model:b,asz,bsz};}
async function downloadAsset(c,key,url,label,progressFrom,progressRange){
  const old=await c.match(key);if(old){log(label+' encontrado no cache.');return old;}
  if(!navigator.onLine)throw new Error(label+' não disponível offline. Conecte para a preparação inicial.');
  log('Baixando '+label+'...');setupMessage('Baixando '+label+'. Não feche o aplicativo.');
  const res=await fetch(url,{cache:'no-store',mode:'cors'});if(!res.ok||res.type==='opaque')throw Error('Falha no download de '+label+' (HTTP '+res.status+').');
  const length=Number(res.headers.get('content-length')||0);
  let response;
  if(res.body&&length>0){
    const reader=res.body.getReader(),chunks=[];let loaded=0;
    for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.byteLength;$('progress').style.width=(progressFrom+progressRange*Math.min(1,loaded/length))+'%';}
    const blob=new Blob(chunks,{type:'application/octet-stream'});response=new Response(blob,{headers:{'content-type':'application/octet-stream','content-length':String(blob.size)}});
    log(label+': '+(blob.size/1e6).toFixed(1)+' MB recebidos.');
  }else{const b=await res.blob();response=new Response(b,{headers:{'content-type':'application/octet-stream','content-length':String(b.size)}});log(label+': '+(b.size/1e6).toFixed(1)+' MB recebidos.');}
  await c.put(key,response.clone());$('progress').style.width=(progressFrom+progressRange)+'%';return response;
}
async function loadScript(blob){if(window.Vosk?.createModel)return;const u=URL.createObjectURL(new Blob([blob],{type:'text/javascript'}));scriptUrl=u;
  await new Promise((resolve,reject)=>{const el=document.createElement('script');el.onload=resolve;el.onerror=()=>reject(Error('Falha ao executar a biblioteca Vosk'));el.src=u;document.head.append(el);});
  if(!window.Vosk?.createModel)throw Error('Biblioteca carregada, mas Vosk.createModel não foi encontrado.');
}
async function prepare(){if(busy)return;busy=true;$('setup').disabled=true;$('mic').disabled=true;
 try{
  if(!('caches' in window))throw Error('Cache Storage indisponível neste navegador.');
  const c=await caches.open(ASSET_CACHE);
  const lib=await downloadAsset(c,LIB_KEY,LIB_URL,'biblioteca de reconhecimento',0,12);
  await loadScript(await lib.blob());
  const mdl=await downloadAsset(c,MODEL_KEY,MODEL_URL,'modelo português (~32 MB)',12,78);
  setupMessage('Inicializando o modelo no aparelho. Pode demorar na primeira vez...');
  if(!model){const b=await mdl.blob();if(b.size<1000000)throw Error('Arquivo do modelo é pequeno demais; download possivelmente incorreto.');modelUrl=URL.createObjectURL(b);model=await Vosk.createModel(modelUrl);}
  $('progress').style.width='100%';setupMessage('Modelo carregado. Pronto para testar SEM internet.','good');
  micMessage('Modelo local pronto. Toque no microfone para falar.','good');$('mic').disabled=false;log('Vosk inicializado no dispositivo.');
 }catch(err){setupMessage('Falha: '+(err.message||err),'error');micMessage('Não foi possível iniciar o modelo.','error');log('ERRO: '+(err.stack||err));$('setup').disabled=false;}finally{busy=false;}
}
async function beginMic(){if(!model){micMessage('Carregue o modelo antes de usar o microfone.','error');return;}
 try{
  stream=await navigator.mediaDevices.getUserMedia({video:false,audio:{echoCancellation:true,noiseSuppression:true,channelCount:1}});
  context=new (window.AudioContext||window.webkitAudioContext)();await context.resume();
  recognizer=new model.KaldiRecognizer(context.sampleRate);
  recognizer.on('result',m=>{const text=m?.result?.text||'';if(text.trim())showText(text);});
  recognizer.on('partialresult',m=>{const text=m?.result?.partial||'';if(text.trim()){$('transcript').textContent=text+' …';transcribed=text;}});
  source=context.createMediaStreamSource(stream);
  processor=context.createScriptProcessor(4096,1,1);
  gain=context.createGain();gain.gain.value=0;
  processor.onaudioprocess=e=>{if(micActive&&recognizer){try{recognizer.acceptWaveform(e.inputBuffer);}catch(err){log('Falha de áudio: '+err.message);}}};
  source.connect(processor);processor.connect(gain);gain.connect(context.destination);
  micActive=true;$('mic').textContent='■ PARAR ESCUTA';$('mic').classList.add('listening');
  micMessage('Escutando NO APARELHO. Fale um número ou “Parcela 6”.','good');log('Microfone iniciado, sem API de transcrição remota.');
 }catch(err){micMessage('Erro ao abrir microfone: '+(err.message||err),'error');log('ERRO microfone: '+(err.stack||err));await stopMic();}
}
async function stopMic(){micActive=false;$('mic').textContent='🎙️ TOCAR PARA FALAR';$('mic').classList.remove('listening');
 if(processor){processor.disconnect();processor.onaudioprocess=null;processor=null;}if(source){source.disconnect();source=null;}if(gain){gain.disconnect();gain=null;}
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}if(context){await context.close().catch(()=>{});context=null;}
 if(recognizer){const old=recognizer;try{old.retrieveFinalResult?.();}catch(err){log('Resultado final não disponível: '+err.message);}setTimeout(()=>{try{old.remove();}catch(_){}},900);recognizer=null;}
 micMessage('Microfone parado. Toque para falar novamente.');
}
$('setup').addEventListener('click',prepare);
$('mic').addEventListener('click',()=>micActive?stopMic():beginMic());
$('diagnose').addEventListener('click',async()=>{try{const d=await cacheInfo();let s='Conexão informada pelo navegador: '+(navigator.onLine?'online':'offline')+'\nBiblioteca em cache: '+(d.lib?'SIM':'NÃO')+'\nModelo pt-BR em cache: '+(d.model?'SIM':'NÃO')+'\nService worker: '+(navigator.serviceWorker?.controller?'controlando esta página':'não controla esta página');$('diagnostics').textContent=s;log(s.replace(/\n/g,'; '));}catch(e){$('diagnostics').textContent='Falha no diagnóstico: '+e.message;}});
$('clear').addEventListener('click',async()=>{if(!confirm('Apagar somente os componentes de voz deste laboratório? As avaliações do seu aplicativo principal não serão afetadas.'))return;await stopMic();if(model){try{model.terminate();}catch(_){}model=null;}await caches.delete(ASSET_CACHE);if(modelUrl)URL.revokeObjectURL(modelUrl);if(scriptUrl)URL.revokeObjectURL(scriptUrl);$('setup').disabled=false;$('mic').disabled=true;$('progress').style.width='0%';setupMessage('Modelo de teste removido.');micMessage('Prepare novamente para testar.');});
$('parse').addEventListener('click',()=>{const r=interpret($('manual').value);$('manualResult').textContent=JSON.stringify(r);});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').then(()=>log('Service Worker registrado.')).catch(e=>log('Falha Service Worker: '+e.message));
if(!window.isSecureContext)setupMessage('Abra por HTTPS (GitHub Pages). Microfone requer contexto seguro.','error');
window.__testeVoz={normalize,numberWords,interpret};
log('Laboratório iniciado. Este código não acessa localStorage do aplicativo de avaliações.');
