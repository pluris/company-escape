function updateBullets(dt){
 for(let bi=bullets.length-1;bi>=0;bi--){
  const b=bullets[bi];
  if(!b)continue;
  b.life-=dt;
   if(b.life<=0){bullets.splice(bi,1);continue;}
   if(b.homing){
    let tgt=null,best=150;
    for(const e of enemies){
     if(e.dead)continue;
     const d=Math.hypot(e.x-b.x,(e.y-8)-b.y);
     if(d<best){best=d;tgt=e;}
    }
    if(tgt){
     const want=Math.atan2((tgt.y-8)-b.y,tgt.x-b.x);
     const cur=Math.atan2(b.vy,b.vx);
     let da=want-cur;
     while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
     const mx=3.4*dt;
     da=Math.max(-mx,Math.min(mx,da));
     const ang=cur+da;
     const sp=Math.min(180,Math.hypot(b.vx,b.vy)+90*dt);
     b.vx=Math.cos(ang)*sp;b.vy=Math.sin(ang)*sp;
    }
    if(Math.random()<.4)parts.push({x:b.x,y:b.y,vx:0,vy:0,g:0,life:.22,col:"#4dd7fe",sz:1});
   }
   if(b.chair){
   b.rot+=dt*22;
   b.t2+=dt;
   const dxp=player.x-b.x,dyp=(player.y-12)-b.y;
   const dp=Math.hypot(dxp,dyp)||1;
   if(b.t2<.5){
    const dr=Math.pow(.35,dt);
    b.vx*=dr;b.vy*=dr;
   }else{
    b.vx+=dxp/dp*950*dt;b.vy+=dyp/dp*950*dt;
    const sp=Math.hypot(b.vx,b.vy);
    if(sp>400){b.vx*=400/sp;b.vy*=400/sp;}
   }
   const nx2=b.x+b.vx*dt,ny2=b.y+b.vy*dt;
   if(circleHitsSolid(nx2,ny2,4,false)){b.vx*=-.75;b.vy*=-.75;sfx("clack");}
   else{b.x=nx2;b.y=ny2;}
   for(const e of enemies){
    if(e.dead)continue;
    if((b.hitIds[e.id]||0)>tGlobal-.4)continue;
    if(Math.hypot(e.x-b.x,(e.y-8)-b.y)<e.r+7){
     b.hitIds[e.id]=tGlobal;
     damage(e,b.dmg,Math.atan2(b.vy,b.vx));
     if(!e.static&&!e.boss)e.stunT=Math.max(e.stunT||0,.35);
    }
   }
   if(b.t2>.5&&dp<11)bullets.splice(bi,1);
   continue;
  }  const steps=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)*dt/4));
  let dead=false;
  for(let s=0;s<steps&&!dead;s++){
   b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;
   if(b.x<0||b.x>VW||b.y<0||b.y>VH){dead=true;break;}
   const tx=Math.floor(b.x/TS),ty=Math.floor(b.y/TS);
   const tt=tileAt(tx,ty);
   if(tt===3){
    if(!b.pierce){damagePane(tx,ty);dead=true;break;}
   }else if(tt===1||tt===2||tt===4){
    dead=true;
    parts.push({x:b.x,y:b.y,vx:(Math.random()-.5)*40,vy:(Math.random()-.5)*40,g:0,life:.15,col:"#8b91a0",sz:1});
    break;
   }
   if(b.from==="p"){
    lastKillSrc=(GUNSET.indexOf(b.src)>=0)?"gun":"other";
    for(const e of enemies){
     if(e.dead)continue;
     if(e.type==="ceo"&&!e.alert)continue;
     if(Math.hypot(e.x-b.x,(e.y-8)-b.y)<e.r+b.size+1){
      if(b.crit)stats.crits++;
      if(b.pierceN!==undefined){
       if(b.hitIds[e.id])continue;
       b.hitIds[e.id]=1;
       damage(e,b.dmg,Math.atan2(b.vy,b.vx),true);
       if(b.pierceN>0)b.pierceN--;
       else dead=true;
      }else{
       damage(e,b.dmg,Math.atan2(b.vy,b.vx),true);
       dead=true;
      }
      if(!dead&&b.knock&&!e.static){
       e.stunT=Math.max(e.stunT||0,.28);
       const kn=Math.hypot(b.vx,b.vy)||1;
       moveEnt(e,b.vx/kn*7,b.vy/kn*7,false);
       parts.push({x:e.x,y:e.y-10,vx:(Math.random()-.5)*60,vy:-20-Math.random()*30,g:60,life:.3,col:"#cfe9ff",sz:2});
      }
      if(dead)break;
     }
    }
   }else{
    const pd2=Math.hypot(player.x-b.x,(player.y-8)-b.y);
    if(player.roll<=0&&player.inv<=0&&pd2<player.r+b.size+1){
     hurtPlayer(b.dmg,Math.atan2(b.vy,b.vx));
     dead=true;
    }else if(player.roll>0&&pd2<26&&!b.pd){
     b.pd=1;
     perfectDodge(b);
    }
   }
  }
  if(dead)bullets.splice(bi,1);
 }
}
function updateLobsWarns(dt){
 for(let i=lobs.length-1;i>=0;i--){
  const l=lobs[i];
  l.t+=dt/l.dur;
  if(l.t>=1){explode(l.tx,l.ty,24,26,true);lobs.splice(i,1);}
 }
 for(let i=warns.length-1;i>=0;i--){
  const w=warns[i];
  w.t-=dt;
  if(w.t<=0){explode(w.x,w.y,24,22,false);warns.splice(i,1);}
 }
}
function updateParticles(dt){
 for(let i=parts.length-1;i>=0;i--){
  const p=parts[i];
  p.life-=dt;
  if(p.life<=0){parts.splice(i,1);continue;}
  p.vy+=(p.g||0)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
 }
 if(parts.length>320)parts.splice(0,parts.length-320);
}
function applyPickup(p){
 if(p.kind==="key"){
  hasKey=true;sfx("key");
  pushToast("사원증 획득 - 엘리베이터 개방","#f4c542");
 }else if(p.kind==="med"){
  player.hp=Math.min(player.maxhp,player.hp+30);stats.heals++;sfx("heal");
  pushToast("+30 HP","#37d67a");
 }else if(p.kind==="ammo"){
  ammo.shotgun+=6;ammo.smg+=24;ammo.stapler+=4;ammo.revolver+=2;ammo.toner+=1;ammo.homing+=2;ammo.pen+=1;sfx("pick");
 }else if(p.kind==="wpn"){
  wpn[p.sub]=true;curWpn=p.sub;
  if(p.sub==="shotgun")ammo.shotgun+=10;
  if(p.sub==="smg")ammo.smg+=50;
  if(p.sub==="stapler")ammo.stapler+=24;
  if(p.sub==="revolver")ammo.revolver+=6;
  if(p.sub==="toner")ammo.toner+=3;
  if(p.sub==="homing")ammo.homing+=6;
  if(p.sub==="pen")ammo.pen+=4;
  sfx("key");
  pushToast("무기 획득: "+WPN[p.sub].name,"#4dd7fe");
 }else if(p.kind==="upg"){
  const owned=WPN_ORDER.filter(w=>wpn[w]);
  if(!owned.length){sfx("ui");return;}
  const lvTarget=owned.reduce(function(best,w){
   return (wlv(w)>wlv(best)&&wlv(w)<3)?w:best;
  },owned[0]);
  if(wlv(lvTarget)>=3){
   ammo.shotgun+=6;ammo.smg+=24;sfx("pick");
   pushToast("탄약 보충 (이미 최고급)","#8b91a0");
   return;
  }
  wpnLv[lvTarget]++;
  sfx("key");sfx("skill");
  addFloat(p.x,p.y-26,WPN[lvTarget].name+" LV"+wlv(lvTarget),"#ffd166");
  pushToast(WPN[lvTarget].name+" 강화 LV"+wlv(lvTarget)+"!","#ffd166");
 }
}
function updatePickups(dt){
 for(let i=pickups.length-1;i>=0;i--){
  const p=pickups[i];
  p.t+=dt;
  if(Math.hypot(player.x-p.x,player.y-p.y)<13){
   applyPickup(p);pickups.splice(i,1);
  }
 }
}
function checkExit(){
 if(!exitTiles.length||!hasKey||exiting)return;
 for(const t of exitTiles){
  if(player.x>t.tx*TS-4&&player.x<t.tx*TS+TS+4&&
     player.y>t.ty*TS-8&&player.y<t.ty*TS+TS+8){
   exiting=true;gotoNextFloor();break;
  }
 }
}

function updatePlayerCtl(dt){
 let ix=0,iy=0;
 if(keys.KeyW||keys.ArrowUp)iy--;
 if(keys.KeyS||keys.ArrowDown)iy++;
 if(keys.KeyA||keys.ArrowLeft)ix--;
 if(keys.KeyD||keys.ArrowRight)ix++;
 const len=Math.hypot(ix,iy);
 if(len>0){ix/=len;iy/=len;}
 player.aim=Math.atan2(mouse.y-(player.y-8),mouse.x-player.x);
 player.face=Math.cos(player.aim)>=0?1:-1;
 if(rollPressed){
  rollPressed=false;
  if(player.rollCd<=0&&player.roll<=0){
   const a=len>0?Math.atan2(iy,ix):player.aim;
   player.roll=.22;player.rollCd=.55;
   player.rx=Math.cos(a);player.ry=Math.sin(a);
   stats.rolls++;
   for(let i=0;i<5;i++){
    const sa=a+Math.PI+(Math.random()-.5)*1.1;
    parts.push({x:player.x+Math.cos(sa)*6,y:player.y-8+Math.sin(sa)*6,
     vx:Math.cos(sa)*70,vy:Math.sin(sa)*50-20,g:60,life:.28,col:"#8b91a0",sz:2});
   }
   sfx("dash");
  }
 }
 if(player.roll>0){
  player.roll-=dt;
  moveEnt(player,player.rx*275*(caffeineT>0?1.15:1)*dt,player.ry*275*(caffeineT>0?1.15:1)*dt,false);
  if(Math.random()<.5)
   parts.push({x:player.x,y:player.y-4,vx:0,vy:0,g:0,life:.18,col:"#3a3f4d",sz:3});
  player.moving=false;
 }else{
  const spd=player.speed*(caffeineT>0?1.45:1)*(1+pHaste);
  moveEnt(player,ix*spd*dt,iy*spd*dt,false);
  player.moving=len>0;
 }
 if(caffeineT>0&&Math.random()<dt*14)
  parts.push({x:player.x+(Math.random()-.5)*10,y:player.y-20,vx:0,vy:-25,g:0,life:.5,col:"#ffd166",sz:1});
 if(player.moving)player.bob+=dt*11;else player.bob=0;
 if(curWpn!=="ext")player.pressure=Math.min(100,player.pressure+14*dt);
 if(player.pend.length){
  for(let i=player.pend.length-1;i>=0;i--){
   const pd=player.pend[i];
   pd.t-=dt;
   if(pd.t<=0){
    shoot(player.x,player.y-12,player.aim+(Math.random()-.5)*.05,{dmg:9*(1+0.25*(wlv("stapler")-1))*(1+pPower),spd:340},"p","#ff8090",1,true);
    sfx("stap");
    player.pend.splice(i,1);
   }
  }
 }
 if(mouse.down&&player.fireCd<=0&&player.roll<=0)doFire();
 if(interactPressed){
  interactPressed=false;
  for(const v of vendList){
   if(!v.used&&Math.hypot(v.x-player.x,v.y-player.y)<22){
     v.used=true;
     player.hp=Math.min(player.maxhp,player.hp+40);
     stats.heals++;
     sfx("vend");
    pushToast("블랙커피 +40 HP","#57c8e8");
    break;
   }
  }
 }
}

function addDmgNum(x,y,v,col){
 if(dmgNums.length>26)dmgNums.shift();
 dmgNums.push({x:x,y:y,v:String(v),col:col||"#ffffff",t:.75,vy:-34,vx:(Math.random()-.5)*14});
}
function addFloat(x,y,txt,col){floats.push({x:x,y:y,txt:txt,col:col||"#ffffff",t:.9});}
function perfectDodge(b){
 player.rollCd=Math.max(0,player.rollCd-.45);
 parts.push({x:b.x,y:b.y,vx:0,vy:0,g:0,life:.22,col:"#ffffff",sz:10,ring:true});
 sfx("perf");
 addFloat(player.x,player.y-26,"PERFECT","#4dd7fe");
}
function checkUnlocks(){
 for(let i=0;i<SKILLS.length;i++){
  const S=SKILLS[i],st=skillState[S.id];
  if(st&&!st.u&&stats[S.stat]>=S.need){
   st.u=true;skillFlash=1;
   pushToast("스킬 해금 ["+(i+1)+"키] "+S.name+" — "+S.desc,"#ffd166");
   sfx("key");
  }
 }
}
function trySkill(i){
 const S=SKILLS[i];if(!S)return;
 const st=skillState[S.id];
 if(!st)return;
 if(!st.u){pushToast("미해금 — "+S.desc+" ("+Math.min(stats[S.stat],S.need)+"/"+S.need+")","#9aa3b2");sfx("ui");return;}
 if(st.cd>0){sfx("ui");return;}
 st.cd=S.cd;
 skillFlash=1;
 if(S.id==="caffeine"){
  caffeineT=6;
  sfx("skill");
  pushToast("카페인 오버도즈!","#ffd166");
 }else if(S.id==="storm"){
  lastKillSrc="other";
  curShotSrc="card";
  for(let k=0;k<14;k++)
   shoot(player.x,player.y-12,k/14*Math.PI*2,{dmg:10,spd:230},"p","#f5f6fa",2);
  player.inv=Math.max(player.inv,.35);
  shake.t=.12;shake.m=2;
  sfx("swing");
  pushToast("서류 폭풍!","#4dd7fe");
 }else{
  lastKillSrc="gun";
  const ex0=player.x,ey0=player.y-12;
  const ep2=rayEnd(ex0,ey0,player.aim,320);
  beams.push({x0:ex0,y0:ey0,x1:ep2.x,y1:ep2.y,t:.16});
  flashes.push({x:ep2.x,y:ep2.y,t:.22});
  const vx2=ep2.x-ex0,vy2=ep2.y-ey0,L2=vx2*vx2+vy2*vy2||1;
  for(const e of enemies){
   if(e.dead||(e.type==="ceo"&&!e.alert))continue;
   let tt=((e.x-ex0)*vx2+((e.y-8)-ey0)*vy2)/L2;
   tt=clamp(tt,0,1);
   if(Math.hypot(e.x-(ex0+vx2*tt),(e.y-8)-(ey0+vy2*tt))<e.r+6)
    damage(e,55,Math.atan2(vy2,vx2),true);
  }
  shake.t=.14;shake.m=2;
  sfx("pen");
  pushToast("최종 서명","#ff4757");
 }
}

function updatePlay(dt){
 lastDt=dt;playTime+=dt;
 shake.t=Math.max(0,shake.t-dt);
 if(shake.t<=0)shake.m=0;
 player.rollCd=Math.max(0,player.rollCd-dt);
 player.fireCd=Math.max(0,player.fireCd-dt*(caffeineT>0?1.55:1));
 player.swingCd=Math.max(0,player.swingCd-dt);
 player.swing=Math.max(0,player.swing-dt);
 player.muzzle=Math.max(0,player.muzzle-dt);
 player.recoil=Math.max(0,player.recoil-dt*30);
 player.flashRed=Math.max(0,player.flashRed-dt);
 if(pRegen>0){
  player.regenT=(player.regenT||0)+dt;
  while(player.regenT>=1.5){
   player.regenT-=1.5;
   if(player.hp<player.maxhp){player.hp=Math.min(player.maxhp,player.hp+pRegen);addFloat(player.x,player.y-24,"+"+pRegen,"#ff9ff3");}
  }
 }
 if(pKills>0)player.killPow=Math.max(0,(player.killPow||0)-dt*1.6);
 updatePlayerCtl(dt);
 for(const e of enemies)if(!e.dead)updateEnemy(e,dt);
 separation();
 contactsPass();
 updateBullets(dt);
 updateLobsWarns(dt);
 updateParticles(dt);
 updatePickups(dt);
 for(const m of motes){
  m.x+=Math.sin(tGlobal*.5+m.p)*.09;
  m.y-=.07*m.s;
  if(m.y<-4){m.y=VH+4;m.x=Math.random()*VW;}
 }
 for(let i=flashes.length-1;i>=0;i--){flashes[i].t-=dt;if(flashes[i].t<=0)flashes.splice(i,1);}
 for(let i=beams.length-1;i>=0;i--){beams[i].t-=dt;if(beams[i].t<=0)beams.splice(i,1);}
 for(let i=floats.length-1;i>=0;i--){const f2=floats[i];f2.t-=dt;f2.y-=18*dt;if(f2.t<=0)floats.splice(i,1);}
 for(let i=dmgNums.length-1;i>=0;i--){
  const d=dmgNums[i];
  d.t-=dt;d.y+=d.vy*dt;d.x+=d.vx*dt;d.vy+=70*dt;
  if(d.t<=0)dmgNums.splice(i,1);
 }
 for(const e of enemies)if(e.hitT>0)e.hitT-=dt;
 for(const S of SKILLS){const st=skillState[S.id];if(st&&st.cd>0)st.cd-=dt;}
 caffeineT=Math.max(0,caffeineT-dt);
 comboT-=dt;if(comboT<=0)comboN=0;
 skillFlash=Math.max(0,skillFlash-dt*1.4);
 checkUnlocks();
 for(let i=toasts.length-1;i>=0;i--){toasts[i].t-=dt;if(toasts[i].t<=0)toasts.splice(i,1);}
 checkExit();
 if(epiT>0){
  epiT-=dt;
  trickleT-=dt;
  if(trickleT<=0){
   trickleT=6;
   const c=farCorner();
   epiSpawnAt(Math.random()<.6?"guard":"drone",c[0],c[1]);
  }
  if(epiWave===0&&epiT<44){epiWave=1;epiSpawn(0);}
  if(epiWave===1&&epiT<30){epiWave=2;epiSpawn(1);}
  if(epiWave===2&&epiT<16){epiWave=3;epiSpawn(2);}
  if(epiT<=0)finishEpilogue();
 }
 if(FLOORS[floorIdx].boss&&bossRef&&!rfIntroDone){
  rfIntroDone=true;
  const bi=BOSS_INTRO.slice();
  if(docsRun>=5){
   bi.splice(2,0,["도혁","그리고 N-13 전체. 조각 다 모았습니다."]);
   bi.splice(3,0,["CEO 강만재","...제법이군. 그래서 더 확실히 지워야 하는데."]);
  }
  showDialog(bi,function(){
   bossActive=true;bossRef.alert=true;setMusic("boss");sfx("roar");
   pushToast("CEO 강만재 - 구조조정을 시작하지","#ff4757");
  });
 }
}

function frame(dt){
 tGlobal+=dt;
 whiteFlash=Math.max(0,whiteFlash-dt);
 if(hitStop>0){hitStop-=dt;render();return;}
 if(transT>=0){
  updateTrans(dt);
  if(state==="dialog")updateDialog(dt);
 }else if(state==="dialog")updateDialog(dt);
 else if(state==="play"&&!paused)updatePlay(dt);
 render();
}
let lastTs=performance.now();
function loop(ts){
 requestAnimationFrame(loop);
 let dt=(ts-lastTs)/1000;lastTs=ts;
 if(dt>0.05)dt=0.05;
 if(dt<0)dt=0;
 frame(dt);
}