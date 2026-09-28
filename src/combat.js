function shoot(x,y,ang,spec,from,color,size,pierceGlass){
 bullets.push({x:x,y:y,vx:Math.cos(ang)*spec.spd,vy:Math.sin(ang)*spec.spd,
  dmg:spec.dmg,from:from,life:spec.life||1.1,size:size||2,
  color:color||(from==="p"?"#ffe9a8":"#ff6b57"),crit:spec.crit||false,pierce:pierceGlass||false,
  src:curShotSrc});
}
function damagePane(tx,ty){
 const k=ty*MW+tx;
 if(!(k in glassHp))return false;
 glassHp[k]--;
 for(let i=0;i<6;i++)parts.push({x:tx*TS+8,y:ty*TS+8,vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*60-20,g:160,life:.5,col:"#57c8e8",sz:1});
 if(glassHp[k]<=0){delete glassHp[k];grid[k]=0;sfx("glass");return true;}
 sfx("hit");return false;
}
function doFire(){
 const w=curWpn,spec=WPN[w];
 curShotSrc=w;
 const lvMul=1+0.25*(wlv(w)-1);
 const rateMul=Math.pow(0.87,wlv(w)-1)*(1-pSwift);
 const pwMul=1+pPower;
 if(w==="ext"){
  if(player.pressure<=1){player.fireCd=.1;return;}
  player.fireCd=spec.rate*rateMul;
  player.pressure=Math.max(0,player.pressure-spec.drain);
  player.muzzle=.03;
  for(let i=0;i<3;i++){
   const a=player.aim+(Math.random()-.5)*spec.spread;
   const bl={x:player.x+Math.cos(a)*8,y:player.y-12+Math.sin(a)*8,
    vx:Math.cos(a)*(130+Math.random()*70),vy:Math.sin(a)*(130+Math.random()*70),
    dmg:spec.dmg*lvMul*pwMul*lvMul*pwMul,from:"p",life:.2,size:3,color:"#cfe9ff",knock:true};
   bullets.push(bl);
  }
  sfx("spray");
  alertNear(player.x,player.y,90);
  return;
 }
 player.fireCd=spec.rate*rateMul*rateMul;player.muzzle=.06;player.recoil=3;
 alertNear(player.x,player.y,170);
 if(w==="case"){
  player.swing=.16;sfx("swing");
  const a=player.aim;
  lastKillSrc="melee";
  for(const e of enemies){
   if(e.dead||(e.type==="ceo"&&!e.alert))continue;
   const d=Math.hypot(e.x-player.x,e.y-player.y);
   let da=Math.atan2(e.y-player.y,e.x-player.x)-a;
   while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
   if(d<44&&Math.abs(da)<1.25){
    moveEnt(e,Math.cos(a)*9,Math.sin(a)*9,e.fly);
    damage(e,spec.dmg*lvMul*pwMul,a);
    if(!e.static&&!e.boss)e.stunT=Math.max(e.stunT||0,.22);
   }
  }
  for(const b of bullets){
   if(b.from!=="e")continue;
   const d=Math.hypot(b.x-player.x,b.y-player.y);
   if(d<50){
    b.from="p";b.color="#ffe9a8";
    const na=a+(Math.random()-.5)*.4;
    const sp=Math.hypot(b.vx,b.vy)*1.25;
    b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp;
    sfx("reflect");
   }
  }
  const px=player.x+Math.cos(a)*30,py=player.y-12+Math.sin(a)*30;
  const tx=Math.floor(px/TS),ty=Math.floor(py/TS);
  if(tileAt(tx,ty)===3)damagePane(tx,ty);
  return;
 }
 if(w==="chair"){
  sfx("dash");
  shake.t=.08;shake.m=1.5;player.recoil=5;
  bullets.push({x:player.x,y:player.y-12,
   vx:Math.cos(player.aim)*300,vy:Math.sin(player.aim)*300,
   dmg:spec.dmg*lvMul*pwMul,from:"p",life:2.4,size:5,color:"#e0a458",
   chair:true,hitIds:{},rot:0,t2:0});
  return;
 }
 if(w==="stapler"){
  if(ammo.stapler<=0){sfx("ui");player.fireCd=.2;return;}
  ammo.stapler--;
  for(let i=0;i<3;i++)player.pend.push({t:i*.07});
  sfx("stap");
  return;
 }
 if(w==="revolver"){
  if(ammo.revolver<=0){sfx("ui");player.fireCd=.2;return;}
  ammo.revolver--;
  shoot(player.x,player.y-12,player.aim+(Math.random()-.5)*.02,{dmg:spec.dmg*lvMul*pwMul,spd:spec.spd},"p","#ffd166",2);
  const rb=bullets[bullets.length-1];
  rb.pierceN=2;rb.hitIds={};
  shake.t=.13;shake.m=2;sfx("mag");
  return;
 }
 if(w==="toner"){
  if(ammo.toner<=0){sfx("ui");player.fireCd=.2;return;}
  ammo.toner--;
  player.fireCd=spec.rate*rateMul;player.recoil=4;
  const txp=clamp(player.x+Math.cos(player.aim)*110,16,VW-16);
  const typ=clamp(player.y-12+Math.sin(player.aim)*110,16,VH-16);
  lobs.push({sx:player.x,sy:player.y-12,tx:txp,ty:typ,t:0,dur:.75});
  sfx("swing");
  alertNear(player.x,player.y,120);
  return;
 }
 if(w==="homing"){
  if(ammo.homing<=0){sfx("ui");player.fireCd=.2;return;}
  ammo.homing--;
  player.fireCd=spec.rate*rateMul;player.muzzle=.05;
  shoot(player.x,player.y-12,player.aim,{dmg:spec.dmg*lvMul*pwMul,spd:spec.spd,life:2.2},"p","#4dd7fe",3);
  bullets[bullets.length-1].homing=true;
  sfx("home");
  alertNear(player.x,player.y,170);
  return;
 }
 if(w==="pen"){
  if(ammo.pen<=0){sfx("ui");player.fireCd=.2;return;}
  ammo.pen--;
  player.fireCd=spec.rate*rateMul;player.muzzle=.08;player.recoil=6;
  shake.t=.15;shake.m=2.5;
  const ex0=player.x,ey0=player.y-12;
  const ep2=rayEnd(ex0,ey0,player.aim,320);
  beams.push({x0:ex0,y0:ey0,x1:ep2.x,y1:ep2.y,t:.14});
  flashes.push({x:ep2.x,y:ep2.y,t:.2});
  const vx2=ep2.x-ex0,vy2=ep2.y-ey0,L2=vx2*vx2+vy2*vy2||1;
  for(const e of enemies){
   if(e.dead||(e.type==="ceo"&&!e.alert))continue;
   let tt=((e.x-ex0)*vx2+((e.y-8)-ey0)*vy2)/L2;
   tt=clamp(tt,0,1);
   if(Math.hypot(e.x-(ex0+vx2*tt),(e.y-8)-(ey0+vy2*tt))<e.r+5){
    damage(e,spec.dmg*lvMul*pwMul,Math.atan2(vy2,vx2),true);
    if(!e.static&&!e.boss)e.stunT=Math.max(e.stunT||0,.25);
   }
  }
  sfx("pen");
  alertNear(player.x,player.y,220);
  return;
 }
 if(w==="shotgun"){
  if(ammo.shotgun<=0){sfx("ui");player.fireCd=.2;return;}
  ammo.shotgun--;
  for(let i=0;i<spec.pellets;i++)
   shoot(player.x,player.y-12,player.aim+(Math.random()-.5)*spec.spread,{dmg:spec.dmg*lvMul*pwMul,spd:spec.spd*(0.85+Math.random()*.3),life:spec.life},"p");
  shake.t=.12;shake.m=2;sfx("shotgun");
 }else if(w==="smg"){
  if(ammo.smg<=0){sfx("ui");player.fireCd=.2;return;}
  ammo.smg--;
  shoot(player.x,player.y-12,player.aim+(Math.random()-.5)*spec.spread,{dmg:spec.dmg*lvMul*pwMul,spd:spec.spd},"p","#fff2c8");
  sfx("smg");
 }else if(w==="card"){
  const crit=Math.random()<.25;
  shoot(player.x,player.y-12,player.aim+(Math.random()-.5)*spec.spread,{dmg:crit?30:spec.dmg*lvMul*pwMul,spd:spec.spd,crit:crit},"p",crit?"#ffd166":"#f5f6fa",1);
  sfx("card");
  }else{
   shoot(player.x,player.y-12,player.aim+(Math.random()-.5)*spec.spread,{dmg:spec.dmg*lvMul*pwMul,spd:spec.spd},"p");
   sfx("shoot");
  }
 }

function damage(e,dmg,srcAng,isBullet){
 if(e.dead)return;
 if(e.type==="ceo"){
  if(!e.alert)return;
  if(e.invuln>0)return;
  dmg*=e.vuln||1;
 }
 if(e.type==="shield"&&isBullet!==undefined){
  let da=srcAng-e.faceAng;
  while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  if(Math.abs(da)<.9){
   dmg*=.15;
   parts.push({x:e.x,y:e.y-8,vx:0,vy:-10,g:0,life:.2,col:"#57c8e8",sz:2});
  }
 }
 e.hp-=dmg;e.flash=.08;e.alert=true;
 for(let i=0;i<3;i++)parts.push({x:e.x,y:e.y-8,vx:(Math.random()-.5)*70,vy:(Math.random()-.5)*70-20,g:200,life:.35,col:"#c43b44",sz:1});
 alertNear(e.x,e.y,110);
 if(e.hp<=0)kill(e);
 else sfx("hit");
}
function kill(e){
 e.dead=true;kills++;
 if(lastKillSrc==="gun")stats.guns++;
 if(pKills>0){
  player.killPow=(player.killPow||0)+pKills;
  if(player.killPow>=1){player.killPow-=1;addFloat(e.x,e.y-34,"POWER","#e07b39");}
 }
 comboN++;comboT=3;
 if(comboN>=3)addFloat(e.x,e.y-24,"x"+comboN,"#ffd166");
 stampCorpse(e);
 hitStop=Math.max(hitStop,e.boss?.07:.024);
 whiteFlash=Math.max(whiteFlash,e.boss?.14:.05);
 if(e.type==="ceo"){bossDown();return;}
 sfx("die");
 for(let i=0;i<8;i++){
  const a=Math.random()*7;
  parts.push({x:e.x,y:e.y-8,vx:Math.cos(a)*(30+Math.random()*60),vy:Math.sin(a)*(30+Math.random()*60)-20,g:180,life:.5,col:"#ff5964",sz:1});
 }
 if(e.type==="chief"){
  pickups.push({kind:"med",x:e.x,y:e.y,t:0});
  if(!wpn.revolver)pickups.push({kind:"wpn",sub:"revolver",x:e.x+10,y:e.y,t:.4});
  shake.t=.25;shake.m=3;
 }
 if(e.elite){
  pickups.push({kind:"upg",x:e.x+8,y:e.y,t:.3});
  addFloat(e.x,e.y-30,"ELITE DOWN","#ffd166");
  shake.t=.2;shake.m=2.5;
 }
}
function stampCorpse(e){
 if(!floorCtx)return;
 const spr=e.type==="clone"?SPR.exec:spriteOf(e);
 floorCtx.save();
 floorCtx.globalAlpha=.55;
 floorCtx.fillStyle="#5c1420";
 floorCtx.beginPath();
 floorCtx.ellipse(e.x,e.y-2,5+Math.random()*4,3+Math.random()*2,0,0,7);
 floorCtx.fill();
 floorCtx.globalAlpha=.8;
 floorCtx.translate(e.x,e.y);
 floorCtx.rotate((Math.random()-.5)*.5);
 floorCtx.scale(CHS,CHS);
 floorCtx.drawImage(spr,-spr.width/2,-spr.height+4);
 floorCtx.restore();
}
function spriteOf(e){
 return SPR[e.type==="mgr"?e.type:e.type==="clone"?"exec":e.type]||SPR.guard;
}
function hurtPlayer(dmg,srcAng){
 if(!player||player.inv>0||player.roll>0||state!=="play")return;
 dmg*=DIFF().dmg;
 player.hp-=dmg;player.inv=.75;player.flashRed=.25;
 shake.t=.18;shake.m=2.5;sfx("hurt");
 const kb=40;
 moveEnt(player,-Math.cos(srcAng)*kb*dtSafe(),-Math.sin(srcAng)*kb*dtSafe(),false);
 for(let i=0;i<6;i++)parts.push({x:player.x,y:player.y-8,vx:(Math.random()-.5)*90,vy:(Math.random()-.5)*90-30,g:220,life:.4,col:"#ff4757",sz:1});
 if(player.hp<=0){
  player.hp=0;deaths++;state="over";sfx("roar");
  setMusic(null);sting("lose");
  if(epiT>0)epiRetry=true;
 }
}
let lastDt=0.016;
function dtSafe(){return lastDt;}

function explode(x,y,r,dmg,hurtEnemies){
 lastKillSrc="other";
 sfx("boom");shake.t=.3;shake.m=4;hitStop=Math.max(hitStop,.02);
 flashes.push({x:x,y:y,t:.24});
 parts.push({x:x,y:y,vx:0,vy:0,g:0,life:.32,col:"#ffb347",sz:r*.6,ring:true});
 for(let i=0;i<18;i++){
  const a=Math.random()*7,s=40+Math.random()*90;
  parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:100,life:.4+Math.random()*.3,col:i%2?"#ffb347":"#ff5964",sz:2});
 }
 for(let i=0;i<10;i++){
  const a=Math.random()*7,s=15+Math.random()*50;
  parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,g:-20,life:.7+Math.random()*.5,col:"#3a3f4d",sz:4+Math.random()*4,k:"smoke"});
 }
 for(let i=0;i<8;i++){
  const a=Math.random()*7,s=60+Math.random()*120;
  parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:60,life:.35+Math.random()*.25,col:"#ffd166",sz:2,k:"ember"});
 }
 const pd=Math.hypot(player.x-x,(player.y-8)-y);
 if(pd<r+player.r)hurtPlayer(dmg*(1-pd/(r+player.r)*.5)+8,Math.atan2(player.y-y,player.x-x));
 if(hurtEnemies){
  for(const e of enemies){
   if(e.dead||e.type==="ceo")continue;
   const d=Math.hypot(e.x-x,e.y-y);
   if(d<r+e.r)damage(e,dmg*.8,Math.atan2(e.y-y,e.x-x));
  }
  if(bossRef&&!bossRef.dead&&bossRef.alert){
   const d=Math.hypot(bossRef.x-x,bossRef.y-y);
   if(d<r+bossRef.r)damage(bossRef,dmg*.5,0);
  }
 }
}

function spawnClone(x,y){
 const c=spawnEnemy("clone",x,y);
 c.alert=true;c.alpha=.72;
 parts.push({x:x,y:y,vx:0,vy:0,g:0,life:.25,col:"#9aa3b2",sz:8,ring:true});
}

function bossDown(){
 bossActive=false;
 bullets.length=0;warns.length=0;lobs.length=0;
 for(const e of enemies)if(!e.dead&&e.type!=="ceo")e.dead=true;
 shake.t=.6;shake.m=5;sfx("boom");sfx("roar");
 for(let i=0;i<40;i++){
  const a=Math.random()*7,s=30+Math.random()*140;
  parts.push({x:bossRef.x,y:bossRef.y-10,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:150,life:.6+Math.random()*.5,col:["#ffd166","#ffb347","#6b6b6b"][i%3],sz:2});
 }
 startEpilogue();
}
const EPI_LINES=[
 ["도혁","사이렌 소리다. 검찰이다."],
 ["경호팀","...본부 명령이다. 전원 — 철수. 이건 더 이상 사내 문제가 아니야."],
 ["도혁","가지 마. 법정에서는 같이 갈 수 있어."],
 ["CEO 강만재","(연행되며) 도혁... 너 이직 잘하더라."],
 ["도혁","아니요 사장님. 퇴사입니다. 오늘부로."]
];
function startEpilogue(){
 epiT=48;epiWave=0;trickleT=4;winT=0;
 bullets.length=0;warns.length=0;lobs.length=0;
 for(const e of enemies)if(!e.dead&&!e.boss)e.dead=true;
 setMusic("boss");
 pushToast("회사 최후의 반격!","#ff4757");
 pushToast("검찰 도착까지 버텨라!","#ffd166");
 sfx("alarm");
 shake.t=.3;shake.m=3;
}
function epiSpawnAt(type,x,y){
 const e=spawnEnemy(type,x,y);
 e.alert=true;
 parts.push({x:x,y:y,vx:0,vy:0,g:0,life:.25,col:"#9aa3b2",sz:8,ring:true});
 return e;
}
function farCorner(){
 const cs=[[36,36],[VW-36,36],[36,VH-44],[VW-36,VH-44]];
 let best=cs[0],bd=-1;
 for(const c of cs){
  const d=Math.hypot(c[0]-player.x,c[1]-player.y);
  if(d>bd){bd=d;best=c;}
 }
 return best;
}
function epiSpawn(w){
 if(w===0){
  const c=farCorner();
  epiSpawnAt("guard",c[0]-20,c[1]);epiSpawnAt("guard",c[0]+20,c[1]);
  epiSpawnAt("worker",c[0],c[1]+22);epiSpawnAt("worker",VW-c[0],VH-c[1]);
 }else if(w===1){
  const c=farCorner();
  epiSpawnAt("shield",c[0],c[1]);epiSpawnAt("mgr",c[0]+26,c[1]);
  epiSpawnAt("mgr",c[0]-26,c[1]);epiSpawnAt("drone",VW/2,30);
 }else{
  epiSpawnAt("clone",60,36);epiSpawnAt("clone",VW-60,36);
  epiSpawnAt("exec",farCorner()[0],VH-50);
  epiSpawnAt("guard",VW/2-30,30);epiSpawnAt("guard",VW/2+30,30);
 }
 sfx("alarm");
}
function buildEnding(){
 const d=Math.min(docsRun,5);
 if(d>=5){
  return [
   ["검찰","N-13 전권 확보. 컴퓨터실 증거 3만 부. 전원 기소."],
   ["도혁","증거가 다 모였군. 이제 개인 복수가 아니라 법의 문제야."],
   ["CEO 강만재","(구금 차에) 나는... 법인이었을 뿐이야. 경영자였어."],
   ["도혁","경영자였을 뿐이죠. 그래서 더 무거워진 거예요."],
   ["도혁","N-13은 기록에 남는다. 나는 진짜로 퇴근한다."]
  ];
 }
 if(hardMode){
  return [
   ["검찰","N-13 일부 확보. 증거는 불충분하나 피의자는 많네."],
   ["도혁","LEAN 모드로 살아남은 건 우연이 아니야."],
   ["CEO 강만재","하드하게 들어왔구나. 인정은 안 하지만, 대단해."],
   ["도혁","대단한 건 당신이지. 난 그저 끝까지 포기 안 한 거야."],
   ["도혁","다음엔 더 빠르게 끝내겠다."]
  ];
 }
 if(d>=3){
  return [
   ["검찰","N-13 상당 부분 확보. 재판은 길어지겠지만."],
   ["도혁","일부는 남아. 그래도 이걸로 그녀는 풀려나."],
   ["도혁","진짜 퇴근이다."]
  ];
 }
 return EPI_LINES;
}
function finishEpilogue(){
 epiT=-1;
 for(const e of enemies)e.dead=true;
 bullets.length=0;warns.length=0;lobs.length=0;
 cleared=true;sset("nr_cleared","1");
 saveMetaOnWin(rankCalc());
 setMusic(null);sting("win");
 showDialog(buildEnding(),function(){state="win";});
}
function eShoot(e,ang,dmg,spd,col,size,pierce){
 shoot(e.x,e.y-12,ang,{dmg:Math.round(dmg*DIFF().dmg),spd:spd},"e",col||"#ff6b57",size||2,pierce);
}
function ringShot(e,n,spd,dmg,col){
 const base=Math.random()*7;
 for(let i=0;i<n;i++)eShoot(e,base+i/n*Math.PI*2,dmg,spd,col);
}