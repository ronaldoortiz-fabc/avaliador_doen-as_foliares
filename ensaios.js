/* Gerenciamento local de ensaios, compativel com a ficha de voz original. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const reg=()=>JSON.parse(localStorage.getItem(REGISTRY_KEY)||'[]');
  const writeReg=xs=>localStorage.setItem(REGISTRY_KEY,JSON.stringify(xs));
  const storageKey=code=>'fichaVoz.multi.state:'+code;
  const clean=(code)=>protoId(code);
  const FOLDERS_KEY='fichaVoz.multi.folders.v1';
  const ASSIGN_KEY='fichaVoz.multi.folderAssignments.v1';
  let currentFolder=null; // null=visao geral, ''=ensaios sem pasta, string=id da pasta
  const loadJson=(key,fallback)=>{try{const o=JSON.parse(localStorage.getItem(key)||'null');return o??fallback;}catch(e){return fallback;}};
  const folders=()=>{
    const raw=loadJson(FOLDERS_KEY,[]);
    return Array.isArray(raw)?raw.filter(f=>f&&typeof f.id==='string'&&typeof f.name==='string').map(f=>({...f,parentId:typeof f.parentId==='string'?f.parentId:''})):[];
  };
  const assignments=()=>{
    const raw=loadJson(ASSIGN_KEY,{});
    return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  };
  function folderFor(code){
    const id=assignments()[code];
    return folders().some(f=>f.id===id)?id:'';
  }
  function folderName(id){return folders().find(f=>f.id===id)?.name||'Sem pasta';}
  function folderPath(id){
    const all=folders(), path=[], seen=new Set();
    let cursor=id;
    while(cursor){
      if(seen.has(cursor))throw Error('Estrutura de pastas invalida: ciclo detectado.');
      seen.add(cursor);
      const item=all.find(f=>f.id===cursor);
      if(!item)throw Error('Pasta inexistente na hierarquia.');
      path.unshift(item.name);cursor=item.parentId||'';
      if(path.length>30)throw Error('Limite de 30 niveis de pastas excedido.');
    }
    return path;
  }
  function ensurePath(names){
    if(!Array.isArray(names) || names.length>30) throw Error('Caminho de pastas invalido.');
    let parent='';
    for(const name of names){
      const all=folders();
      const item=all.find(f=>f.parentId===parent&&f.name.toLocaleLowerCase('pt-BR')===String(name).toLocaleLowerCase('pt-BR'));
      parent=item?item.id:newFolder(name,parent);
    }
    return parent;
  }
  function descendants(id){
    const all=folders(), seen=new Set(), result=[];
    function visit(parent){for(const f of all.filter(item=>item.parentId===parent)){
      if(seen.has(f.id))continue;seen.add(f.id);result.push(f.id);visit(f.id);
    }}
    visit(id);return result;
  }
  function folderCount(id){const ids=new Set([id,...descendants(id)]);return reg().filter(c=>ids.has(folderFor(c))).length;}
  function moveFolder(id,toParent){
    if(id===toParent || descendants(id).includes(toParent))throw Error('Nao e possivel mover uma pasta para dentro dela mesma.');
    const all=folders(),item=all.find(f=>f.id===id);
    if(!item)throw Error('Pasta inexistente.');
    if(toParent&&!all.some(f=>f.id===toParent))throw Error('Destino inexistente.');
    if(all.some(f=>f.id!==id&&f.parentId===toParent&&f.name.toLocaleLowerCase('pt-BR')===item.name.toLocaleLowerCase('pt-BR')))
      throw Error('Ja existe uma pasta com esse nome no destino.');
    storeFolders(all.map(f=>f.id===id?{...f,parentId:toParent}:f));list();
  }
  function storeFolders(items){localStorage.setItem(FOLDERS_KEY,JSON.stringify(items));}
  function storeAssignments(items){localStorage.setItem(ASSIGN_KEY,JSON.stringify(items));}
  function newFolder(name,parentId=(currentFolder||'')){
    name=String(name||'').trim().replace(/\s+/g,' ');
    if(!name||name.length>60)throw Error('Informe um nome de pasta com ate 60 caracteres.');
    if(parentId&&!folders().some(f=>f.id===parentId))throw Error('A pasta superior nao existe.');
    if(folders().some(f=>f.parentId===parentId&&f.name.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR')))throw Error('Ja existe uma pasta com esse nome neste local.');
    const id='p_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
    storeFolders([...folders(),{id,name,parentId}]);
    return id;
  }
  function moveTo(code,id){
    if(!reg().includes(code))throw Error('Protocolo nao encontrado.');
    if(id&&!folders().some(f=>f.id===id))throw Error('Pasta nao encontrada.');
    const next=assignments();
    if(id)next[code]=id;else delete next[code];
    storeAssignments(next);
    list();
  }
  function renameFolder(id){
    const item=folders().find(f=>f.id===id);if(!item)return;
    const name=window.prompt('Novo nome da pasta:',item.name);
    if(name===null)return;
    const nextName=String(name).trim().replace(/\s+/g,' ');
    if(!nextName||nextName.length>60)throw Error('Nome deve ter entre 1 e 60 caracteres.');
    if(folders().some(f=>f.id!==id&&f.parentId===item.parentId&&f.name.toLocaleLowerCase('pt-BR')===nextName.toLocaleLowerCase('pt-BR')))throw Error('Ja existe uma pasta com esse nome neste local.');
    storeFolders(folders().map(f=>f.id===id?{...f,name:nextName}:f));list();
  }
  function deleteFolder(id){
    const all=folders(),item=all.find(f=>f.id===id);if(!item)return;
    const direct=reg().filter(c=>folderFor(c)===id).length;
    const children=all.filter(f=>f.parentId===id).length;
    const parent=item.parentId||'';
    const parentLabel=parent?folderName(parent):'Sem pasta / raiz';
    const msg='Excluir apenas a pasta "'+item.name+'"?\n\n'+direct+' ensaio(s) diretos serao movidos para '+parentLabel+'. '+children+' subpasta(s) serao promovidas ao nivel superior.\n\nNenhuma avaliacao ou arquivo do Drive sera excluido.';
    if(!window.confirm(msg))return;
    // Evita pastas irmas de mesmo nome ao promover subpastas.
    for(const c of all.filter(f=>f.parentId===id)){
      if(all.some(f=>f.id!==id&&f.id!==c.id&&f.parentId===parent&&f.name.toLocaleLowerCase('pt-BR')===c.name.toLocaleLowerCase('pt-BR'))){
        throw Error('Nao e possivel excluir: a subpasta "'+c.name+'" ja existe no nivel superior. Mova ou renomeie primeiro.');
      }
    }
    const asg=assignments();
    Object.keys(asg).forEach(code=>{if(asg[code]===id){if(parent)asg[code]=parent;else delete asg[code];}});
    storeAssignments(asg);
    storeFolders(all.filter(f=>f.id!==id).map(f=>f.parentId===id?{...f,parentId:parent}:f));
    if(currentFolder===id)currentFolder=parent||null;
    list();
  }
  const blank=(code,npar=48)=>({
    proto:code, avaliador:'',data:new Date().toLocaleDateString('en-CA'),fen:'',area:'',dataAp:'',nap:'',
    npar,vars:DEFAULT_VARS.map(v=>({...v})),cur:1,cursor:0,awaitingPlot:false,fieldNavigationVersion:1,notes:{},ant:{},hist:[],
    tts:'short',rate:1.2,auto:'2',wake:'1',hfAnt:'1',hfBeep:'1',saDelay:'1100',saFocus:'1',demo:false
  });
  function activate(code){
    if(window.FichaDrive?.isBusy?.()) throw Error('Sincronização em andamento. Tente novamente após concluir.');
    if(hf.on) hfStop();
    if(sa.on) saStop();
    const item=JSON.parse(localStorage.getItem(storageKey(code))||'null');
    if(!item) throw Error('Ensaio local não encontrado.');
    KEY=storageKey(code);
    localStorage.setItem(ACTIVE_KEY,code);
    S=Object.assign(blank(code),item,{proto:code});
    migrate();undoStack=[];
    const mapping=[['cProto','proto'],['cAval','avaliador'],['cData','data'],['cFen','fen'],['cArea','area'],['cDataAp','dataAp'],['cNap','nap'],['cNpar','npar'],['cTts','tts'],['cRate','rate'],['cAuto','auto'],['cWake','wake'],['cHfAnt','hfAnt'],['cHfBeep','hfBeep'],['cSaDelay','saDelay'],['cSaFocus','saFocus']];
    mapping.forEach(([id,key])=>{if($(id)) $(id).value=S[key]??'';});
    renderVarEditor();renderHist();render();setupWake();
    $('ensaiosAtual').textContent=code;
    $('ensaiosOverlay').hidden=true;
    save();
    window.dispatchEvent(new CustomEvent('ficha:project-switched',{detail:{protocol:code}}));
  }
  function create(code,npar=48, state=null){
    code=clean(code);
    if(!code || !/^[A-Z0-9][A-Z0-9_-]*$/.test(code)) throw Error('Informe um codigo de protocolo valido (letras, numeros, _ ou -).');
    if(reg().includes(code)) throw Error('Esse protocolo ja existe neste aparelho. Abra-o na lista.');
    if(npar<1||npar>150||!Number.isInteger(npar)) throw Error('Numero de parcelas deve estar entre 1 e 150.');
    const record=state?{...structuredClone(state),proto:code}:blank(code,npar);
    localStorage.setItem(storageKey(code),JSON.stringify(record));
    writeReg([...reg(),code]);
    // Novos ensaios herdam a pasta aberta, se houver.
    if(currentFolder&&folders().some(f=>f.id===currentFolder)){
      const next=assignments();next[code]=currentFolder;storeAssignments(next);
    }
    return code;
  }
  function importState(state){
    const code=clean(state.proto);
    if(!code) throw Error('O backup nao tem codigo de protocolo.');
    if(reg().includes(code)){
      throw Error('Ja existe esse ensaio no aparelho. Abra-o e utilize Restaurar do Drive.');
    }
    create(code,Number(state.npar),state);
    activate(code);
  }
  // Exclui somente o cadastro e os dados locais deste protocolo.
  // Arquivos enviados ao Google Drive nunca sao alterados por esta acao.
  function removeLocal(code){
    const msg=$('ensaiosMsg');
    msg.textContent='';
    try{
      if(window.FichaDrive?.isBusy?.()) throw Error('Ha uma sincronizacao em andamento. Conclua antes de excluir.');
      const current=reg();
      if(!current.includes(code)) throw Error('Ensaio nao encontrado.');
      if(current.length<=1) throw Error('Para excluir o ultimo ensaio, crie primeiro outro protocolo.');
      const typed=window.prompt('EXCLUIR ENSAIO LOCAL\n\nIsso removera as notas e o historico deste ensaio APENAS deste dispositivo. Os arquivos JSON e Excel no Google Drive serao mantidos.\n\nDigite exatamente '+code+' para confirmar:', '');
      if(typed===null) return;
      if(typed.trim()!==code){msg.textContent='Exclusao cancelada: codigo de confirmacao diferente.';return;}
      // Se ativo, primeiro abre um protocolo alternativo, antes de apagar a chave local.
      if(localStorage.getItem(ACTIVE_KEY)===code || S.proto===code){
        const alternative=current.find(x=>x!==code && localStorage.getItem(storageKey(x))!==null);
        if(!alternative) throw Error('Nao ha outro ensaio local disponivel para abrir.');
        activate(alternative);
      }
      // Mantem o registro anterior caso o armazenamento recuse alguma operacao.
      writeReg(current.filter(x=>x!==code));
      localStorage.removeItem(storageKey(code));
      const next=assignments();delete next[code];storeAssignments(next);
      list();
      $('ensaiosOverlay').hidden=false;
      msg.textContent='Ensaio '+code+' excluido somente deste aparelho. Arquivos no Drive preservados.';
    }catch(e){msg.textContent='Nao foi possivel excluir: '+(e.message||e);}
  }
  function folderTile(parent,title,count,onOpen,folderId){
    const row=document.createElement('div');row.className='card';row.style.padding='11px';
    const actions=document.createElement('div');actions.className='row wrap';actions.style.alignItems='center';
    const openBtn=document.createElement('button');openBtn.className='btn';openBtn.type='button';
    openBtn.style.flex='1';openBtn.style.textAlign='left';openBtn.style.minWidth='130px';
    openBtn.textContent='📁 '+title+' ('+count+')';openBtn.onclick=onOpen;
    actions.append(openBtn);
    if(folderId){
      const edit=document.createElement('button');edit.className='btn';edit.type='button';edit.textContent='Renomear';
      edit.onclick=()=>{try{renameFolder(folderId);}catch(e){$('ensaiosMsg').textContent=e.message;}};
      const del=document.createElement('button');del.className='btn danger';del.type='button';del.textContent='Excluir pasta';
      del.onclick=()=>{try{deleteFolder(folderId);}catch(e){$('ensaiosMsg').textContent=e.message;}};
      actions.append(edit,del);
      const move=document.createElement('select');move.setAttribute('aria-label','Mover pasta '+title);
      move.style.maxWidth='160px';
      const item=folders().find(f=>f.id===folderId);
      const banned=new Set([folderId,...descendants(folderId)]);
      const choices=[{id:'',name:'Raiz'},...folders().filter(f=>!banned.has(f.id)).map(f=>({id:f.id,name:folderPath(f.id).join(' / ')}))];
      choices.forEach(f=>{const opt=document.createElement('option');opt.value=f.id;opt.textContent='Mover pasta: '+f.name;move.append(opt);});
      move.value=item?.parentId||'';
      move.onchange=()=>{try{moveFolder(folderId,move.value);$('ensaiosMsg').textContent='Pasta movida com as subpastas e ensaios.';}catch(e){$('ensaiosMsg').textContent=e.message;list();}};
      actions.append(move);
    }
    row.append(actions);parent.append(row);
  }
  function list(){
    const box=$('ensaiosLista'),folderBox=$('pastasLista'),breadcrumb=$('pastaCaminho');
    box.replaceChildren();folderBox.replaceChildren();
    const codes=reg(), ff=folders();
    if(currentFolder!==null&&currentFolder!==''&&!ff.some(f=>f.id===currentFolder))currentFolder=null;
    const parent=currentFolder?ff.find(f=>f.id===currentFolder)?.parentId||'':null;
    $('pastaVoltar').hidden=currentFolder===null;
    $('pastaVoltar').textContent='← '+(currentFolder===null?'Raiz':parent?folderName(parent):'Todas as pastas');
    $('ensaioCriar').textContent=currentFolder?'+ Criar e abrir nesta pasta':'+ Criar e abrir';
    const selected=currentFolder===null?'Raiz':currentFolder===''?'Sem pasta':folderName(currentFolder);
    breadcrumb.textContent=currentFolder===null?'Meus ensaios · '+codes.length+' ensaio(s)':
      (currentFolder===''?'Sem pasta':'Meus ensaios / '+folderPath(currentFolder).join(' / '));
    $('pastaNovoNome').placeholder=currentFolder?'Nova subpasta de '+selected:'Ex.: Verao 2026/27';
    const children=ff.filter(f=>f.parentId===(currentFolder||'')).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    if(currentFolder===null){
      folderTile(folderBox,'Sem pasta',codes.filter(c=>!folderFor(c)).length,()=>{currentFolder='';list();},'');
    }
    if(currentFolder!=='')children.forEach(f=>folderTile(folderBox,f.name,folderCount(f.id),()=>{currentFolder=f.id;list();},f.id));
    if(currentFolder===null){
      if(!children.length){const n=document.createElement('p');n.className='tiny muted';n.textContent='Crie sua primeira pasta acima.';folderBox.append(n);}
      const notice=document.createElement('p');notice.className='tiny muted';notice.textContent='Abra uma pasta para visualizar as subpastas e protocolos.';box.append(notice);
      return;
    }
    const visible=codes.filter(code=>folderFor(code)===currentFolder);
    if(currentFolder!==''){
      const heading=document.createElement('strong');heading.textContent='Ensaios nesta pasta';box.append(heading);
    }
    if(!visible.length){const empty=document.createElement('p');empty.className='tiny muted';empty.textContent=children.length?'Nenhum ensaio diretamente nesta pasta.':'Nenhum ensaio nesta pasta.';box.append(empty);}
    for(const code of visible){
      let st={};try{st=JSON.parse(localStorage.getItem(storageKey(code))||'{}')||{};}catch(e){}
      const row=document.createElement('div');row.className='card';row.style.padding='10px';
      const actions=document.createElement('div');actions.className='row wrap';
      const btn=document.createElement('button');btn.className='btn primary';btn.type='button';btn.textContent='Abrir '+code;
      btn.onclick=()=>{try{activate(code);}catch(e){$('ensaiosMsg').textContent=e.message;}};
      const del=document.createElement('button');del.className='btn danger';del.type='button';del.textContent='Excluir';
      del.onclick=()=>removeLocal(code);actions.append(btn,del);
      const desc=document.createElement('div');desc.className='tiny muted';
      desc.textContent=(st.hist?.length||0)+' avaliacoes arquivadas · '+Object.keys(st.notes||{}).length+' parcelas com notas atuais'+(code===S.proto?' · ativo':'');
      const moveRow=document.createElement('div');moveRow.className='row wrap';moveRow.style.marginTop='8px';moveRow.style.alignItems='center';
      const label=document.createElement('label');label.className='tiny muted';label.textContent='Mover para: ';
      const select=document.createElement('select');select.setAttribute('aria-label','Mover ensaio '+code+' para outra pasta');select.style.maxWidth='100%';
      const opts=[{id:'',name:'Sem pasta'},...ff.map(f=>({id:f.id,name:folderPath(f.id).join(' / ')}))];
      opts.forEach(f=>{const option=document.createElement('option');option.value=f.id;option.textContent=f.name;select.append(option);});
      select.value=folderFor(code);
      select.onchange=()=>{try{moveTo(code,select.value);$('ensaiosMsg').textContent='Ensaio '+code+' movido. Nenhuma nota foi alterada.';}catch(e){$('ensaiosMsg').textContent=e.message;list();}};
      label.append(select);moveRow.append(label);row.append(actions,desc,moveRow);box.append(row);
    }
  }
  function open(){list();$('ensaiosOverlay').hidden=false;}
  $('ensaiosBtn').onclick=open;
  $('pastaVoltar').onclick=()=>{if(currentFolder===''){currentFolder=null;}else{const item=folders().find(f=>f.id===currentFolder);currentFolder=item?.parentId||null;}list();};
  $('pastaCriar').onclick=()=>{
    const msg=$('ensaiosMsg');msg.textContent='';
    try{
      const id=newFolder($('pastaNovoNome').value);
      $('pastaNovoNome').value='';currentFolder=id;list();
      msg.textContent='Pasta criada. Voce ja pode criar ou mover ensaios para ela.';
    }catch(e){msg.textContent=e.message;}
  };
  $('pastaNovoNome').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('pastaCriar').click();}});
  $('ensaiosFechar').onclick=()=>{$('ensaiosOverlay').hidden=true;};
  $('ensaioCriar').onclick=()=>{
    const msg=$('ensaiosMsg');msg.textContent='';
    try{
      const code=create($('ensaioNovoCodigo').value,Number($('ensaioNovoNpar').value));
      $('ensaioNovoCodigo').value='';activate(code);
    }catch(e){msg.textContent=e.message;}
  };
  $('ensaiosAtual').textContent=S.proto;
  $('cProto').readOnly=true;
  // Ao iniciar primeira vez, exibe a lista para evitar lancamento no protocolo errado.
  if(!sessionStorage.getItem('fichaVoz.multi.welcome')){
    sessionStorage.setItem('fichaVoz.multi.welcome','1');open();
  }
  window.FichaEnsaios={create,activate,importState,open,list,registry:reg,has:code=>reg().includes(clean(code)),folders,folderFor,folderPath,pathForProtocol:code=>folderPath(folderFor(code)),ensurePath,moveTo};
})();
