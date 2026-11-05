/* Gerenciamento local de ensaios, compativel com a ficha de voz original. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const reg=()=>JSON.parse(localStorage.getItem(REGISTRY_KEY)||'[]');
  const writeReg=xs=>localStorage.setItem(REGISTRY_KEY,JSON.stringify(xs));
  const storageKey=code=>'fichaVoz.multi.state:'+code;
  const clean=(code)=>protoId(code);
  const blank=(code,npar=48)=>({
    proto:code, avaliador:'',data:new Date().toLocaleDateString('en-CA'),fen:'',area:'',dataAp:'',nap:'',
    npar,vars:DEFAULT_VARS.map(v=>({...v})),cur:1,cursor:0,notes:{},ant:{},hist:[],
    tts:'short',rate:1.2,auto:'1',wake:'1',hfAnt:'1',hfBeep:'1',saDelay:'1100',saFocus:'1',demo:false
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
      list();
      $('ensaiosOverlay').hidden=false;
      msg.textContent='Ensaio '+code+' excluido somente deste aparelho. Arquivos no Drive preservados.';
    }catch(e){msg.textContent='Nao foi possivel excluir: '+(e.message||e);}
  }
  function list(){
    const box=$('ensaiosLista');box.replaceChildren();
    for(const code of reg()){
      let st={};
      try{st=JSON.parse(localStorage.getItem(storageKey(code))||'{}')||{};}catch(e){}
      const row=document.createElement('div');row.className='card';row.style.padding='10px';
      const actions=document.createElement('div');actions.className='row wrap';
      const btn=document.createElement('button');btn.className='btn primary';btn.textContent='Abrir '+code;
      btn.onclick=()=>{try{activate(code);}catch(e){$('ensaiosMsg').textContent=e.message;}};
      const del=document.createElement('button');del.className='btn danger';del.type='button';del.textContent='Excluir';
      del.setAttribute('aria-label','Excluir ensaio '+code+' deste aparelho');
      del.onclick=()=>removeLocal(code);
      actions.append(btn,del);
      const desc=document.createElement('div');desc.className='tiny muted';
      desc.textContent=(st.hist?.length||0)+' avaliacoes arquivadas · '+(Object.keys(st.notes||{}).length)+' parcelas com notas atuais'+(code===S.proto?' · ativo':'');
      row.append(actions,desc);box.append(row);
    }
  }
  function open(){list();$('ensaiosOverlay').hidden=false;}
  $('ensaiosBtn').onclick=open;
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
  window.FichaEnsaios={create,activate,importState,open,list,registry:reg,has:code=>reg().includes(clean(code))};
})();
