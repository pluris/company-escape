const keys={},mouse={x:VW/2,y:VH/2,down:false};
let dlgNext=false,rollPressed=false,interactPressed=false;

function bindInput(){
 window.addEventListener("keydown",function(e){
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
  if(!keys[e.code]){
   if(e.code==="Space"&&state==="play")rollPressed=true;
   if(e.code==="KeyQ")cycleWeapon(1);
   if(e.code==="KeyE"&&state==="play")interactPressed=true;
   if((e.code==="Enter"||e.code==="Space")&&state==="dialog")dlgNext=true;
    if(e.code==="Escape"){
     if(state==="settings"){state=settingsPrev;sfx("ui");}
     else togglePause();
    }
    if(state==="settings"){
     if(e.code==="Digit1"){OPT.vol=Math.max(0,Math.round((OPT.vol-0.1)*10)/10);setOpt();sset("nr_vol",OPT.vol);sfx("ui");}
     if(e.code==="Digit2"){OPT.shake=Math.max(0,Math.round((OPT.shake-0.25)*4)/4);setOpt();sset("nr_shake",OPT.shake);sfx("ui");}
     if(e.code==="Digit3"){OPT.crt=OPT.crt?0:1;setOpt();sset("nr_crt",OPT.crt);sfx("ui");}
     if(e.code==="ArrowUp"){adjustOpt(1);}
     if(e.code==="ArrowDown"){adjustOpt(-1);}
    }
   if(e.code==="KeyM"){muted=!muted;pushToast(muted?"음소거 ON":"음소거 OFF","#9aa3b2");}
   if(e.code==="KeyR"){
    if(state==="over")retryFloor();
    else if(state==="win")resetRun(true);
   }
   if(state==="play"){
    if(e.code==="Digit1")trySkill(0);
    if(e.code==="Digit2")trySkill(1);
    if(e.code==="Digit3")trySkill(2);
   }
   if(state==="perk"){
    if(e.code==="Digit1")tryPick(0);
    if(e.code==="Digit2")tryPick(1);
    if(e.code==="Digit3")tryPick(2);
   }
    if(e.code==="KeyO"&&(state==="play"||state==="title")){
     settingsPrev=state==="play"?"play":"title";
     if(state==="play")paused=false;
     state="settings";sfx("ui");
    }
    if(state==="title"&&(e.code==="Enter"||e.code==="Space"))startRun();
    if(state==="title"&&e.code==="KeyH"){
    hardMode=!hardMode;sset("nr_hard",hardMode?"1":"0");sfx("ui");
   }
  }
  keys[e.code]=true;
 });
 window.addEventListener("keyup",function(e){keys[e.code]=false;});
 cv.addEventListener("mousemove",function(e){
  const r=cv.getBoundingClientRect();
  mouse.x=(e.clientX-r.left)/r.width*VW;
  mouse.y=(e.clientY-r.top)/r.height*VH;
  if(state==="perk"&&perkPick)hoverPerk=perkIndexAt(mouse.x,mouse.y);
 });
 cv.addEventListener("mousedown",function(e){
  e.preventDefault();
  try{cv.focus();window.focus();}catch(err){}
  initAudio();
  if(state==="title"){startRun();return;}
  if(state==="dialog"){dlgNext=true;return;}
  if(state==="perk"){tryPickByMouse();return;}
  if(state==="over"){retryFloor();return;}
  if(state==="win"){resetRun(true);return;}
  if(e.button===2)rollPressed=true;else mouse.down=true;
 });
 window.addEventListener("mouseup",function(){mouse.down=false;});
 cv.addEventListener("contextmenu",function(e){e.preventDefault();});
 cv.addEventListener("wheel",function(e){
  e.preventDefault();if(state==="play")cycleWeapon(e.deltaY>0?1:-1);
 },{passive:false});
 window.addEventListener("blur",function(){
  for(const k in keys)keys[k]=false;mouse.down=false;
 });
}

function adjustOpt(dir){
 OPT.vol=Math.max(0,Math.min(1,Math.round((OPT.vol+dir*0.1)*10)/10));
 setOpt();sset("nr_vol",OPT.vol);sfx("ui");
}
function togglePause(){
 if(state!=="play")return;
 paused=!paused;sfx("ui");
}
function cycleWeapon(dir){
 const list=WPN_ORDER.filter(w=>wpn[w]);
 if(list.length<2)return;
 let i=list.indexOf(curWpn);
 i=(i+dir+list.length)%list.length;
 curWpn=list[i];sfx("swap");
}
function currentOwned(){return WPN_ORDER.filter(w=>wpn[w]);}

let dlg=null;
function showDialog(lines,after){
 dlg={lines,idx:0,ch:0,after:after||null};
 state="dialog";
}
function updateDialog(dt){
 if(!dlg)return;
 dlg.ch+=dt*45;
 const line=dlg.lines[dlg.idx][1];
 if(dlgNext){
  dlgNext=false;
  if(dlg.ch<line.length)dlg.ch=line.length+1;
  else{
   dlg.idx++;dlg.ch=0;sfx("ui");
   if(dlg.idx>=dlg.lines.length){
    const cb=dlg.after;dlg=null;
    state="play";
    if(cb)cb();
   }
  }
 }
}
function pushToast(txt,col){toasts.push({txt:txt,col:col||"#f2f2f2",t:3});}

let transT=-1,transCb=null,transDone=false;
function startTrans(cb,label){transT=0;transCb=cb;transDone=false;transLabel=label||null;transDing=false;state="trans";}
function updateTrans(dt){
 transT+=dt*2.4;
 if(transT>=1&&!transDone){
  transDone=true;
  if(transCb)transCb();
 }
 if(transLabel&&!transDing&&transT>=.96){
  transDing=true;sfx("elev");
 }
 if(transT>=2){transT=-1;transCb=null;if(state==="trans")state="play";}
}

function resetGear(){
 wpn={pistol:true,shotgun:false,smg:false,stapler:false,revolver:false,case:false,ext:false,chair:false,card:true,toner:false,homing:false,pen:false};
 ammo={shotgun:0,smg:0,stapler:0,revolver:0,toner:0,homing:0,pen:0};curWpn="pistol";
 wpnLv={pistol:1,shotgun:1,smg:1,stapler:1,revolver:1,case:1,ext:1,chair:1,card:1,toner:1,homing:1,pen:1};
 kills=0;deaths=0;playTime=0;
 stats={guns:0,rolls:0,heals:0,crits:0};
 docsRun=0;
 perks=[];perkPick=null;
 pHaste=0;pPower=0;pSwift=0;pLuck=0;pAmmo=0;pRegen=0;pKills=0;
 skillState={};
 for(const S of SKILLS)skillState[S.id]={u:false,cd:0};
 caffeineT=0;comboN=0;comboT=0;
 floats=[];
}
function DIFF(){
 return hardMode?{hp:1.35,dmg:1.3,spd:1.12}:{hp:1,dmg:1,spd:1};
}
function sget(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function sset(k,v){try{localStorage.setItem(k,String(v));}catch(e){}}
function loadMeta(){
 meta.runs=parseInt(sget("nr_runs")||"0",10)||0;
 meta.bosses=parseInt(sget("nr_bosses")||"0",10)||0;
 meta.bestRank=sget("nr_rank")||"-";
 meta.startSkill=sget("nr_skill")||null;
}
function saveMetaOnWin(rank){
 meta.runs++;meta.bosses++;
 const order={C:0,B:1,A:2,S:3};
 if(order[rank]>=(order[meta.bestRank]||0))meta.bestRank=rank;
 sset("nr_runs",meta.runs);sset("nr_bosses",meta.bosses);sset("nr_rank",meta.bestRank);
 const tiers=2;
 const unlocks=Math.floor(meta.bosses/tiers);
 const pool=["caffeine","storm","sign"];
 if(unlocks>0){
  const id=pool[(unlocks-1)%3];
  sset("nr_skill",id);
  meta.startSkill=id;
 }
}
function grantStartSkill(){
 if(!meta.startSkill)return;
 const S=SKILLS.find(function(x){return x.id===meta.startSkill;});
 if(S&&skillState[S.id]){skillState[S.id].u=true;}
}
function beginFloor(i,retry){
 const keep=player?player.hp:100;
 floorIdx=i;
 parseFloor(i);
 if(epiRetry){
  epiRetry=false;
  bossRef.dead=true;
  stampCorpse(bossRef);
  startEpilogue();
 }
 if(retry){player.hp=100;ammo.shotgun+=4;ammo.smg+=20;ammo.stapler+=6;ammo.revolver+=2;ammo.toner+=1;ammo.homing+=2;ammo.pen+=1;}
 else player.hp=Math.max(1,keep);
 pushToast(FLOORS[i].name+" · "+FLOORS[i].sub,"#f4c542");
 pushToast(FLOORS[i].toast,"#9aa3b2");
 setMusic("floor");
 state="play";
}
function gotoNextFloor(){
 const nxt=FLOORS[floorIdx+1];
 if(!nxt)return;
 sfx("elev");
 const label=nxt.name+" · "+nxt.sub;
 if(floorIdx===0){
  startTrans(function(){
   showDialog(EXIT0,function(){openPerkPick(label);});
  },label);
 }else if(floorIdx===4){
  startTrans(function(){
   showDialog(MID_STORY,function(){openPerkPick(label);});
  },label);
 }else{
  openPerkPick(label);
 }
}
function rollPerks(){
 const pool=PERKS.filter(function(pk){
  return !perks.includes(pk.id)||Math.random()<0.25;
 });
 const out=[];
 const copy=pool.slice();
 for(let i=0;i<3&&copy.length;i++){
  out.push(copy.splice(Math.floor(Math.random()*copy.length),1)[0]);
 }
 return out;
}
function openPerkPick(nextLabel){
 if(!nextLabel){startTrans(function(){beginFloor(floorIdx+1);});return;}
 perkPick={opts:rollPerks(),label:nextLabel,t:0};
 state="perk";
}
function perkIndexAt(mx,my){
 if(!perkPick)return -1;
 const opts=perkPick.opts;
 const cw=118,gap=10,y0=110,chh=96;
 const totalW=opts.length*cw+(opts.length-1)*gap;
 const x0=(VW-totalW)/2;
 for(let i=0;i<opts.length;i++){
  const x=x0+i*(cw+gap);
  if(mx>=x&&mx<=x+cw&&my>=y0&&my<=y0+chh)return i;
 }
 return -1;
}
function tryPickByMouse(){
 const i=perkIndexAt(mouse.x,mouse.y);
 if(i>=0)applyPerk(perkPick.opts[i]);
}
function tryPick(i){
 if(state!=="perk"||!perkPick)return;
 if(i<0||i>=perkPick.opts.length)return;
 applyPerk(perkPick.opts[i]);
}
function applyPerk(pk){
 perks.push(pk.id);
 pk.apply(player);
 sfx("skill");
 pushToast("보너스 획득: "+pk.name,"#ffd166");
 const lb=perkPick?perkPick.label:null;
 perkPick=null;
 startTrans(function(){beginFloor(floorIdx+1);},lb);
}
function retryFloor(){
 beginFloor(floorIdx,true);
}
function startRun(){
 initAudio();resetGear();
 player=null;
 showDialog(INTRO,function(){grantStartSkill();startTrans(function(){beginFloor(0);});});
}
function resetRun(toIntro){
 resetGear();player=null;
 if(toIntro)showDialog(INTRO,function(){startTrans(function(){beginFloor(0);});});
 else state="title";
}

function alertNear(x,y,r){
 for(const e of enemies){
  if(!e.dead&&!e.static&&Math.hypot(e.x-x,e.y-y)<r)e.alert=true;
 }
}