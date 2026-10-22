// SPDX-License-Identifier: MIT
(()=>{'use strict';
const M=window.TokyoMarket,key='tokyo-paper-market-v1',el=document.querySelector('#game'),status=document.querySelector('#status');let state=M.initial(Date.now()>>>0),pending=null,lang='en';
const say=text=>status.textContent=text;
try{const raw=localStorage.getItem(key);if(raw)state=M.clean(JSON.parse(raw));}catch{say('Saved data unavailable; export a file to keep progress. 存档不可用，请导出文件保存进度。');}
function persist(){try{localStorage.setItem(key,JSON.stringify(state));}catch{say('Device storage unavailable. Export your save. 本机存储不可用，请导出存档。');}}
function render(){TokyoUI.render(el,state,lang,(action,args)=>{state=M.act(state,action,args);persist();render();},text=>{say(text);persist();});}
document.querySelector('#language').onchange=e=>{lang=e.target.value;document.documentElement.lang=lang==='zh'?'zh-Hans':'en';render();};
document.querySelector('#restart').onclick=()=>{if(!confirm('Replace this run? Export your save first. 重新开始将替换当前进度，请先导出。'))return;state=M.initial(Date.now()>>>0);pending=null;hideImport();persist();render();};
document.querySelector('#export').onclick=()=>{const blob=new Blob([JSON.stringify({format:'tideplay-save',version:1,game:'tokyo',savedAt:new Date().toISOString(),state:M.clean(state)},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='tokyo-paper-market-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function hideImport(){document.querySelector('#confirm-import').hidden=true;document.querySelector('#cancel-import').hidden=true;}
document.querySelector('#import').onchange=async e=>{const file=e.target.files[0];pending=null;hideImport();if(!file)return;try{if(file.size>100000)throw Error();const data=JSON.parse(await file.text());if(data.format!=='tideplay-save'||data.version!==1||data.game!=='tokyo')throw Error();pending=M.clean(data.state);say(`Ready: DAY ${pending.day}, ¥${M.equity(pending)}. Confirm to replace current run. 确认后替换当前进度。`);document.querySelector('#confirm-import').hidden=false;document.querySelector('#cancel-import').hidden=false;}catch{say('Invalid save. Current run unchanged. 存档无效，当前进度未变。');}e.target.value='';};
document.querySelector('#cancel-import').onclick=()=>{pending=null;hideImport();say('Cancelled / 已取消');};
document.querySelector('#confirm-import').onclick=()=>{if(!pending)return;state=pending;pending=null;hideImport();persist();render();say('Restored / 已恢复');};render();
})();
