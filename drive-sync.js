/* Sincronização Google Drive - uso pessoal, offline primeiro.
   OAuth: Google Identity Services, escopo drive.file. Não armazena access token. */
(() => {
  'use strict';
  const FOLDER = 'Avaliacoes_Fitopatologia';
  const OAUTH_SCOPE = 'https://www.googleapis.com/auth/drive.file';
  const SETTINGS_KEY = 'fichaVoz.drive.oauthClientId';
  const META_PREFIX = 'fichaVoz.drive.sync.v1:';
  const API = 'https://www.googleapis.com/drive/v3/files';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
  const byId = id => document.getElementById(id);
  let accessToken = null, tokenClient = null, busy = false, autoTimer = null, folderId = null;
  let authorizedUntil = 0;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const safeProto = () => String(S.proto || 'ensaio').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 90) || 'ensaio';
  const fileName = () => safeProto() + '_avaliacoes.json';
  const metaKey = () => META_PREFIX + safeProto();
  const localMeta = () => { try { return JSON.parse(localStorage.getItem(metaKey()) || '{}'); } catch { return {}; } };
  const setLocalMeta = obj => { localStorage.setItem(metaKey(), JSON.stringify(obj)); showInfo(); };
  const status = (message, err = false) => {
    const e = byId('driveStatus'); e.textContent = message; e.className = 'tiny ' + (err ? 'feedback err' : 'muted');
  };
  const isOnline = () => navigator.onLine;
  const isAuthorized = () => Boolean(accessToken && Date.now() < authorizedUntil - 30000);
  function showInfo() {
    const m = localMeta();
    byId('driveSyncInfo').textContent = m.syncedAt
      ? 'Última sincronização confirmada deste protocolo: ' + new Date(m.syncedAt).toLocaleString('pt-BR')
      : 'Este protocolo ainda não tem sincronização confirmada neste dispositivo.';
  }
  function requireAuth() {
    if (!isOnline()) throw Error('Sem internet. As notas permanecem neste aparelho; sincronize depois.');
    if (!isAuthorized()) throw Error('Conecte sua conta Google novamente para sincronizar.');
  }
  async function driveFetch(url, opts = {}) {
    requireAuth();
    const headers = new Headers(opts.headers || {});
    headers.set('Authorization', 'Bearer ' + accessToken);
    const res = await fetch(url, {...opts, headers});
    if (!res.ok) {
      let detail = '';
      try { const e = await res.json(); detail = e.error?.message || ''; } catch {}
      if (res.status === 401) { accessToken = null; authorizedUntil = 0; }
      throw Error('Google Drive (' + res.status + '): ' + (detail || res.statusText));
    }
    return res;
  }
  const escapeQ = text => text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  async function listFiles(q) {
    const qs = new URLSearchParams({q, spaces:'drive', fields:'nextPageToken,files(id,name,mimeType,md5Checksum,modifiedTime)',pageSize:'100'});
    const all = [];
    let pageToken;
    do {
      if (pageToken) qs.set('pageToken', pageToken); else qs.delete('pageToken');
      const data = await (await driveFetch(API + '?' + qs)).json();
      all.push(...(data.files || [])); pageToken = data.nextPageToken;
    } while (pageToken);
    return all;
  }
  async function getFolder(create = false) {
    if (folderId) return folderId;
    const result = await listFiles("name = '" + escapeQ(FOLDER) + "' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
    if (result.length > 1) throw Error('Há mais de uma pasta com este nome criada pelo aplicativo. Organize as duplicatas no Drive.');
    if (result.length === 1) return (folderId = result[0].id);
    if (!create) return null;
    const res = await driveFetch(API + '?fields=id', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:FOLDER,mimeType:'application/vnd.google-apps.folder'})});
    return (folderId = (await res.json()).id);
  }
  async function findRemote(createFolder = false) {
    const fid = await getFolder(createFolder);
    if (!fid) return null;
    const arr = await listFiles("name = '" + escapeQ(fileName()) + "' and '" + fid + "' in parents and trashed = false");
    if (arr.length > 1) throw Error('Foram encontradas várias cópias ativas deste protocolo no Drive. Resolva as duplicatas antes de sincronizar.');
    return arr[0] || null;
  }
  async function remoteContent(fileId) {
    const r = await driveFetch(API + '/' + encodeURIComponent(fileId) + '?alt=media');
    return await r.text();
  }
  // Multipart garante que novo arquivo já seja criado com nome, pasta e conteúdo.
  async function createJson(name, content, parentId) {
    const boundary = 'ficha_' + Math.random().toString(36).slice(2);
    const body = '--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'
      + JSON.stringify({name, mimeType:'application/json', parents:[parentId]})
      + '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'
      + content + '\r\n--'+boundary+'--';
    const r = await driveFetch(UPLOAD + '?uploadType=multipart&fields=id,name,md5Checksum,modifiedTime', {
      method:'POST', headers:{'Content-Type':'multipart/related; boundary='+boundary}, body
    });
    return r.json();
  }
  async function updateJson(fileId, content) {
    const r = await driveFetch(UPLOAD+'/'+encodeURIComponent(fileId)+'?uploadType=media&fields=id,name,md5Checksum,modifiedTime', {
      method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:content
    });
    return r.json();
  }
  async function remoteMeta(fileId) {
    return (await (await driveFetch(API+'/'+encodeURIComponent(fileId)+'?fields=id,name,md5Checksum,modifiedTime')).json());
  }
  function validateState(data) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.vars) || !Array.isArray(data.hist)
        || !data.notes || typeof data.notes !== 'object' || !data.ant || typeof data.ant !== 'object'
        || typeof data.proto !== 'string' || data.npar < 1 || data.npar > 150) {
      throw Error('Arquivo inválido ou incompatível com esta versão do aplicativo.');
    }
    return data;
  }
  function envelope() { return JSON.stringify({format:'ficha-voz-drive-v1', exportadoEm:new Date().toISOString(), estado:S}); }
  function parseEnvelope(content) {
    const data = JSON.parse(content);
    if (data.format !== 'ficha-voz-drive-v1') throw Error('O arquivo não é um backup do aplicativo.');
    return validateState(data.estado);
  }
  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href=url; link.download=name; document.body.appendChild(link); link.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); link.remove(); },3000);
  }
  function backupLocal() {
    downloadBlob(new Blob([envelope()],{type:'application/json'}), fileName());
  }
  function localHasRealData() {
    return Object.keys(S.notes || {}).length > 0 || (S.hist || []).length > 0 || Object.keys(S.ant || {}).length > 0;
  }
  function applyRestored(state) {
    const incoming = structuredClone(state);
    const oldKey = 'fichaVoz.backup.antesRestauracao.' + Date.now();
    try { localStorage.setItem(oldKey, envelope()); } catch { backupLocal(); }
    S = Object.assign(S, incoming);
    migrate(); undoStack = [];
    // Atualiza os inputs sem instalar listeners duplicados.
    [['cProto','proto'],['cAval','avaliador'],['cData','data'],['cFen','fen'],['cArea','area'],['cDataAp','dataAp'],
      ['cNap','nap'],['cNpar','npar'],['cTts','tts'],['cRate','rate'],['cAuto','auto'],['cWake','wake'],
      ['cHfAnt','hfAnt'],['cHfBeep','hfBeep'],['cSaDelay','saDelay'],['cSaFocus','saFocus']]
      .forEach(([id,key]) => { if(byId(id)) byId(id).value=S[key] ?? ''; });
    save(); renderVarEditor(); renderHist(); render(); setupWake(); showInfo();
  }
  async function sync(force = false) {
    if (busy) return;
    busy = true;
    try {
      requireAuth();
      status('Conferindo a cópia existente no Drive...');
      if (S.demo) throw Error('Remova os dados de demonstração na aba Avaliar antes de sincronizar dados reais.');
      const snapshot = envelope();
      const localProtocol = safeProto();
      const meta = localMeta();
      const remote = await findRemote(true);
      let result;
      if (remote) {
        const md5 = remote.md5Checksum || (await remoteMeta(remote.id)).md5Checksum;
        const matchedPrevious = meta.fileId === remote.id && Boolean(meta.md5) && meta.md5 === md5;
        if (!force && !matchedPrevious) {
          throw Error('Conflito: já existe uma cópia deste protocolo no Drive que não corresponde à última sincronização local. Use “Restaurar do Drive” ou “Substituir cópia remota (com backup)”.');
        }
        if (force) {
          const oldContent = await remoteContent(remote.id);
          const name = localProtocol + '_backup_remoto_' + new Date().toISOString().replace(/[:.]/g,'-') + '.json';
          await createJson(name, oldContent, await getFolder(true));
        }
        result = await updateJson(remote.id, snapshot);
      } else {
        result = await createJson(fileName(), snapshot, await getFolder(true));
      }
      // Alterações feitas durante envio continuam pendentes, sem dizer que já foram sincronizadas.
      if (safeProto() === localProtocol) {
        setLocalMeta({fileId:result.id, md5:result.md5Checksum, syncedAt:new Date().toISOString()});
        if (envelope().replace(/"exportadoEm":"[^"]+"/, '"exportadoEm":null')
            !== snapshot.replace(/"exportadoEm":"[^"]+"/, '"exportadoEm":null')) {
          status('Cópia enviada, mas houve novas alterações locais. Sincronize novamente.');
        } else status('Sincronização concluída. Cópia do protocolo salva no seu Google Drive.');
      }
    } catch (e) { status(e.message || String(e), true); }
    finally { busy=false; showInfo(); }
  }
  async function restoreRemote() {
    if (busy) return;
    busy=true;
    try {
      requireAuth();
      const remote = await findRemote(false);
      if (!remote) throw Error('Não encontrei backup deste protocolo na pasta do Drive. Confira o código do protocolo em Ajustes.');
      const raw = await remoteContent(remote.id);
      const state = parseEnvelope(raw);
      if (safeProto() !== String(state.proto).trim().replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,90)) throw Error('O protocolo do arquivo remoto não corresponde ao protocolo atual.');
      if (!confirm('Restaurar a cópia do Drive para o protocolo ' + S.proto + '? As informações locais atuais serão substituídas. Um backup local será preservado antes.')) return;
      applyRestored(state);
      const fresh = await remoteMeta(remote.id);
      setLocalMeta({fileId:remote.id,md5:fresh.md5Checksum,syncedAt:new Date().toISOString()});
      status('Avaliações restauradas do Drive com sucesso.');
    } catch(e) { status(e.message || String(e),true); }
    finally { busy=false; }
  }
  async function forceSync() {
    if (!confirm('Você deseja substituir a cópia atual deste protocolo no Google Drive? O aplicativo criará antes um backup da versão remota.')) return;
    await sync(true);
  }
  async function loadGIS() {
    if (window.google?.accounts?.oauth2) return;
    if (!navigator.onLine) throw Error('É necessário internet para autenticar no Google.');
    await new Promise((resolve,reject)=>{
      const old=document.querySelector('script[data-gis]');
      if (old) { old.addEventListener('load',resolve,{once:true});old.addEventListener('error',()=>reject(Error('Não foi possível carregar a autenticação Google.')),{once:true});return; }
      const el=document.createElement('script');el.src='https://accounts.google.com/gsi/client';el.async=true;el.dataset.gis='1';
      el.onload=resolve;el.onerror=()=>reject(Error('Falha ao carregar autenticação do Google.'));document.head.appendChild(el);
    });
  }
  async function connect() {
    try {
      const clientId=byId('driveClientId').value.trim();
      if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)) throw Error('Informe o ID do cliente OAuth 2.0 do tipo Aplicativo da Web.');
      if (location.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(location.hostname)) throw Error('Publique o aplicativo em HTTPS antes de usar o login Google.');
      localStorage.setItem(SETTINGS_KEY,clientId);
      await loadGIS();
      status('Solicitando autorização Google...');
      tokenClient=window.google.accounts.oauth2.initTokenClient({client_id:clientId,scope:OAUTH_SCOPE,callback:response=>{
        if (response.error || !response.access_token) { status('Autorização negada ou não concluída.',true);return; }
        accessToken=response.access_token;
        authorizedUntil=Date.now()+(Number(response.expires_in)||3500)*1000;
        status('Google conectado. Pode sincronizar este protocolo.');
        // Não sincroniza automaticamente ao conectar pela primeira vez: evita sobrescrever dados remotos.
      }});
      tokenClient.requestAccessToken({prompt:'consent'});
    } catch(e) { status(e.message || String(e),true); }
  }
  function queueAuto() {
    clearTimeout(autoTimer);
    if (!isAuthorized() || !isOnline()) return;
    autoTimer=setTimeout(()=>{ if (!busy) sync(false); }, 15000);
  }
  byId('driveClientId').value=localStorage.getItem(SETTINGS_KEY)||'';
  byId('driveConnect').onclick=connect;
  byId('driveSync').onclick=()=>sync(false);
  byId('driveRestore').onclick=restoreRemote;
  byId('driveOverwrite').onclick=forceSync;
  byId('backupDownload').onclick=backupLocal;
  byId('backupImport').onchange=async event=>{
    const file=event.target.files?.[0];
    if (!file) return;
    try {
      const state=parseEnvelope(await file.text());
      if (!confirm('Importar backup do protocolo ' + state.proto + ' e substituir os dados atuais? Uma cópia local será preservada.')) return;
      applyRestored(state);
      // Dados importados não podem herdar revisão Drive previamente sincronizada.
      localStorage.removeItem(metaKey());
      status('Backup JSON importado. Para enviar ao Drive, sincronize e resolva qualquer conflito existente.');
    } catch(e) { status('Não foi possível importar: '+e.message,true); }
    finally { event.target.value=''; }
  };
  byId('driveOpen').onclick=async ()=>{
    try { requireAuth(); const id=await getFolder(false); if(!id) throw Error('A pasta ainda não foi criada. Sincronize primeiro.');window.open('https://drive.google.com/drive/u/0/folders/'+encodeURIComponent(id),'_blank','noopener'); }
    catch(e){status(e.message,true);}
  };
  window.addEventListener('ficha:changed',queueAuto);
  window.addEventListener('online',()=>{status('Internet disponível. Se a conta Google estiver conectada, a sincronização será tentada.');queueAuto();});
  window.addEventListener('offline',()=>status('Offline: as avaliações continuam sendo guardadas neste dispositivo.'));
  document.querySelectorAll('.tabs button').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.tab==='drive')showInfo();}));
  showInfo();
  if ('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')) {
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
  if (navigator.storage?.persist) navigator.storage.persist().catch(()=>{});
})();
