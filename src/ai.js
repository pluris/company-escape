function tryBurst(e,n,interval,cdBase,mk){
 if(e.burst>0){
  e.bt-=lastDt;
  if(e.bt<=0){mk();e.burst--;e.bt=interval;}
 }else{
  e.cool-=lastDt;
  if(e.cool<=0){e.burst=n;e.bt=0;e.cool=cdBase+Math.random()*.6;}
 }
}
function seekBand(e,min,max,dt,sp){
 const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;
 let mx=0,my=0;
 if(d>max){mx=dx/d;my=dy/d;}
 else if(d<min){mx=-dx/d;my=-dy/d;}
 else{const s=Math.sin(e.t*2.2)*e.strafe;mx=-dy/d*s;my=dx/d*s;}
 moveEnt(e,mx*sp*dt,my*sp*dt,e.fly);
 e.moving=Math.abs(mx)+Math.abs(my)>.1;
}

function triggerAlarm(){
 alarmDone=true;alarmActive=true;
 setMusic("tense");
 sfx("alarm");
 pushToast("경보 발생!! 증원이 옵니다","#d93a3a");
 const corners=[[VW-60,40],[40,VH-56]];
 let best=null,bd=-1;
 for(const c of corners){
  const d=Math.hypot(c[0]-player.x,c[1]-player.y);
  if(d>bd){bd=d;best=c;}
 }
 for(let i=0;i<2;i++){
  const g=spawnEnemy("guard",best[0]+i*14,best[1]+(i?10:-6));
  g.alert=true;
 }
 for(const e of enemies)e.alert=true;
}

function updateEnemy(e,dt){
 e.flash=Math.max(0,e.flash-dt);
 e.contactCd=Math.max(0,e.contactCd-dt);
 e.t+=dt;
 if(e.stunT>0&&!e.boss){e.stunT-=dt;return;}
 if(e.type==="ceo"){if(e.alert)updateCEO(e,dt);return;}
 const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy);
 const seen=d<260&&los(e.x,e.y,player.x,player.y);
 if(!e.alert){
  if((seen&&d<150)||d<55){e.alert=true;}
  else{
   if(!e.static){
    e.wt=(e.wt||0)-dt;
    if(e.wt<=0){e.wt=1.5+Math.random()*2;e.tx=e.x0+(Math.random()-.5)*50;e.ty=e.y0+(Math.random()-.5)*40;}
    const wx=e.tx-e.x,wy=e.ty-e.y,wd=Math.hypot(wx,wy);
    if(wd>6){moveEnt(e,wx/wd*e.spd*.35*dt,wy/wd*e.spd*.35*dt,false);e.moving=true;}else e.moving=false;
   }
   return;
  }
 }
  e.faceAng=Math.atan2(dy,dx);
  e.face=dx>=0?1:-1;
  e.moving=false;
  if(e.tactic==="recon"&&e.alert)alertNear(e.x,e.y,170);
  if(e.tell>0)e.tell-=dt;
  switch(e.type){
  case"guard":
   if(e.tell>0)break;
   seekBand(e,110,170,dt,e.spd);
   tryBurst(e,2,.17,1.5,function(){
    eShoot(e,e.faceAng+(Math.random()-.5)*.09,8,190);
    sfx("shoot");
   });
   if(e.cool<=0&&seen&&d<190&&e.tell<=0&&e.st!=="windup"){
    e.st="windup";e.stT=.4;e.tell=.4;e.tellMax=.4;e.chargeAng=e.faceAng;sfx("dash");
   }
   break;
  case"worker":
   if(e.st==="windup"){
    e.stT-=dt;
    moveEnt(e,Math.cos(e.faceAng)*60*dt,Math.sin(e.faceAng)*60*dt,false);
    if(e.stT<=0){
     if(d<30){hurtPlayer(12,e.faceAng);}
     e.st="idle";e.cool=.9;e.tell=0;
    }
   }else{
    moveEnt(e,dx/d*e.spd*dt,dy/d*e.spd*dt,false);e.moving=true;
    if(d<20&&e.cool<=0){e.st="windup";e.stT=.28;e.tell=.28;sfx("swing");}
    e.pd-=dt;
    if(d>90&&e.pd<=0&&seen){e.pd=2.8;eShoot(e,e.faceAng+(Math.random()-.5)*.06,6,150,"#f2f2f2");}
   }
   break;
  case"mgr":
  case"clone":
   if(e.tell>0)break;
   seekBand(e,130,210,dt,e.spd);
   e.cool-=dt;
   if(e.cool<=0&&seen&&d<240){
    e.tell=.8;e.tellMax=.8;e.cool=2.6;e.aimX=player.x;e.aimY=player.y-8;
    sfx("laser");
   }
   if(e.tell>0){
    e.aimX+=(player.x-e.aimX)*.06;e.aimY+=(player.y-8-e.aimY)*.06;
    e.faceAng=Math.atan2(e.aimY-(e.y-8),e.aimX-e.x);
    if(e.tell<=.18&&!e.firedLine){
     e.firedLine=true;
     eShoot(e,e.faceAng+(Math.random()-.5)*.05,e.type==="clone"?6:7,250,"#ffd166",2);
     sfx("shoot");
    }
    if(e.tell<=0){e.firedLine=false;e.strafe*=-1;}
    break;
   }
   tryBurst(e,2,.15,2.1,function(){
    eShoot(e,e.faceAng+(Math.random()-.5)*.07,e.type==="clone"?6:7,225);
    sfx("shoot");
   });
   break;
  case"drone":
   if(e.st==="aim"){
    e.stT-=dt;
    if(e.stT<=0){e.st="dive";e.tx=player.x;e.ty=player.y;sfx("dash");}
   }else if(e.st==="dive"){
    const ddx=e.tx-e.x,ddy=e.ty-e.y,dd=Math.hypot(ddx,ddy);
    if(dd<8){e.st="hover";e.cool=1.8;}
    else{
     const nx=e.x+ddx/dd*250*dt,ny=e.y+ddy/dd*250*dt;
     if(circleHitsSolid(nx,ny,e.r,true)){e.st="hover";e.cool=1.8;}
     else{e.x=nx;e.y=ny;}
    }
   }else{
    const ox=player.x+Math.cos(e.t*1.3)*36,oy=player.y+Math.sin(e.t*1.7)*24;
    const vx=ox-e.x,vy=oy-e.y,vd=Math.hypot(vx,vy)||1;
    moveEnt(e,vx/vd*e.spd*dt,vy/vd*e.spd*dt,true);e.moving=vd>8;
    e.cool-=dt;
    if(e.cool<=0&&seen){e.st="aim";e.stT=.55;e.tell=.55;e.tellMax=.55;}
   }
   break;
  case"printer":
   if(e.tell>0)break;
   if(seen&&d<270){
    e.cool-=dt;
    if(e.cool<=0){e.volley=3;e.vt=0;e.cool=2.4;e.tell=2.4;}
   }
   if(e.volley>0){
    e.vt-=dt;
    if(e.vt<=0){
     eShoot(e,e.faceAng+(Math.random()-.5)*.1,9,215,"#f2f2f2",2,true);
     e.volley--;e.vt=.13;sfx("smg");
    }
   }
   break;
  case"shield":
   if(e.tell>0)break;
   seekBand(e,80,120,dt,e.spd);
   tryBurst(e,4,.09,1.9,function(){
    eShoot(e,e.faceAng+(Math.random()-.5)*.12,5,200);
    sfx("smg");
   });
   break;
  case"cctv":
   if(!e.alert){e.faceAng+=dt*.6;break;}
   if(e.lock>0){
    e.lock-=dt;
    if(e.lock<=0){e.fire=.5;sfx("laserfire");e.tick=0;}
   }else if(e.fire>0){
    e.fire-=dt;
    e.tick-=dt;
    if(e.tick<=0){e.tick=.25;hurtPlayer(Math.round(9*DIFF().dmg),e.faceAng);}
    if(e.fire<=0)e.cool=1.6;
   }else{
    e.cool-=dt;
    if(e.cool<=0&&seen&&d<240){
     e.lock=.8;sfx("laser");
     if(FLOORS[floorIdx].alarm&&!alarmDone)triggerAlarm();
    }
   }
   break;
  case"chief":
   if(e.act){
    e.act.t+=dt;
    const A=e.act;
    if(A.name==="shell"){
     if(A.t>.35&&!A.fired){
      A.fired=true;sfx("shotgun");shake.t=.1;shake.m=2;
      for(let i=0;i<6;i++)eShoot(e,e.faceAng+(Math.random()-.5)*.55,6,240);
     }
     if(A.t>.55){e.act=null;e.cool=2;}
    }else if(A.name==="charge"){
     if(A.t<.4){A.ang=e.faceAng;e.tell=.4-A.t;e.chargeAng=A.ang;}
     else{
      e.tell=0;
      const nx=e.x+Math.cos(A.ang)*300*dt,ny=e.y+Math.sin(A.ang)*300*dt;
      if(circleHitsSolid(nx,ny,e.r,false)&&A.t>.5){
       e.act=null;e.cool=2;shake.t=.2;shake.m=3;sfx("boom");
      }else{
       e.x=nx;e.y=ny;
       if(!A.hit&&Math.hypot(player.x-e.x,player.y-e.y)<e.r+player.r+2){A.hit=true;hurtPlayer(18,A.ang);}
      }
     }
    }else if(A.name==="summon"){
     if(A.t>.3&&!A.fired){
      A.fired=true;sfx("roar");
      for(let i=0;i<2;i++){
       const g=spawnEnemy("guard",e.x+(i?26:-26),e.y+(i?-14:14));
       g.alert=true;
      }
     }
     if(A.t>.7){e.act=null;e.cool=2.4;}
    }
   }else{
    seekBand(e,100,170,dt,e.spd);
    e.cool-=dt;
    if(e.cool<=0){
     const guards=enemies.filter(function(x){return x.type==="guard"&&!x.dead}).length;
     if(e.summons>0&&guards<3&&Math.random()<.4){
      e.summons--;e.act={name:"summon",t:0,fired:false};
     }else if(Math.random()<.45){
      e.act={name:"charge",t:0,ang:e.faceAng,hit:false};sfx("dash");e.tell=.4;
     }else{
      e.act={name:"shell",t:0,fired:false};
     }
    }
   }
   break;
  case"exec":
   if(e.tell>0)break;
   seekBand(e,130,210,dt,e.spd);
   e.cool-=dt;
   if(e.cool<=0&&seen&&d<250){
    e.tell=1;e.tellMax=1;e.cool=3;e.aimX=player.x;e.aimY=player.y-8;
    sfx("laser");
   }
   if(e.tell>0){
    e.aimX+=(player.x-e.aimX)*.05;e.aimY+=(player.y-8-e.aimY)*.05;
    e.faceAng=Math.atan2(e.aimY-(e.y-8),e.aimX-e.x);
    if(e.tell<=.2&&!e.firedLine){
     e.firedLine=true;
     ringShot(e,6,220,8,"#ff9ff3");
     sfx("shotgun");
     shake.t=.1;shake.m=2;
    }
    if(e.tell<=0){e.firedLine=false;e.strafe*=-1;}
    break;
   }
   e.fd=(e.fd||5)-dt;
   if(e.fd<=0&&d<230){e.fd=5;ringShot(e,8,140,6);}
   break;
  }
  if(e.tell<=0&&e.st==="windup"){
   if(e.type==="guard"){
    e.st="charge";
    e.stT=.5;
    const nx=e.x+Math.cos(e.chargeAng)*300*dt,ny=e.y+Math.sin(e.chargeAng)*300*dt;
    if(circleHitsSolid(nx,ny,e.r,false)){e.st="idle";e.cool=1.6;}
    else{
     e.x=nx;e.y=ny;
     if(!e.chHit&&Math.hypot(player.x-e.x,player.y-e.y)<e.r+player.r+3){
      e.chHit=true;hurtPlayer(14,e.chargeAng);
     }
    }
    if(e.stT<=0){e.st="idle";e.chHit=false;e.cool=1.6;}
   }
  }
}

function summonClones(e){
 const alive=enemies.filter(function(x){return x.type==="clone"&&!x.dead}).length;
 let need=2-alive;
 if(need>0){
  spawnClone(50,40);
  need--;
 }
 if(need>0)spawnClone(VW-50,40);
}

function updateCEO(e,dt){
 e.invuln=Math.max(0,e.invuln-dt);
 const hpr=e.hp/e.maxhp;
 const ph=hpr<=.33?3:hpr<=.66?2:1;
 if(ph>e.phase){
  e.phase=ph;e.act=null;e.cool=1.4;e.invuln=.9;
  sfx("roar");shake.t=.3;shake.m=3;
  if(ph===2){e.heli=true;pushToast("구조조정 시작","#d93a3a");summonClones(e);}
  if(ph===3){pushToast("정직원입니다","#d93a3a");summonClones(e);}
 }
 const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;
 e.faceAng=Math.atan2(dy,dx);
 e.face=dx>=0?1:-1;
 e.moving=false;
 if(!e.act){
  e.vuln=1;
  let mx=0,my=0;
  if(d>120){mx=dx/d;my=dy/d;}
  else if(d<70){mx=-dx/d;my=-dy/d;}
  else{const s=Math.sin(e.t*2)*e.strafe;mx=-dy/d*s;my=dx/d*s;}
  moveEnt(e,mx*e.spd*dt,my*e.spd*dt,false);
  e.moving=Math.abs(mx)+Math.abs(my)>.05;
  e.cool-=dt;
  if(e.cool<=0){
   const pool=["fan","fan","dash","bomb"];
   if(e.phase>=2)pool.push("missile","dash");
   if(e.phase>=3)pool.push("spiral","fan");
   const name=pool[Math.floor(Math.random()*pool.length)];
   const dur={fan:.65,dash:1.05,bomb:1.15,missile:1.35,spiral:2.05}[name];
   e.act={name:name,t:0,dur:dur,fired:false,ang:e.faceAng,emit:0,hit:false,n:0};
   if(name==="dash")sfx("dash");
  }
  return;
 }
 const A=e.act;
 A.t+=dt;
 if(A.name==="fan"){
  if(A.t>.35&&!A.fired){
   A.fired=true;
   ringShot(e,e.phase===3?14:10,125+e.phase*15,8,"#f4c542");
   sfx("shotgun");
  }
 }else if(A.name==="dash"){
  if(A.t<.45){A.ang=e.faceAng;}
  else{
   const nx=e.x+Math.cos(A.ang)*330*dt,ny=e.y+Math.sin(A.ang)*330*dt;
   if(circleHitsSolid(nx,ny,e.r,false)&&A.t>.52){
    e.act={name:"stun",t:0,dur:.95};e.vuln=1.6;
    shake.t=.2;shake.m=3;sfx("boom");
    return;
   }
   e.x=nx;e.y=ny;
   if(!A.hit&&Math.hypot(player.x-e.x,player.y-e.y)<e.r+player.r+2){
    A.hit=true;hurtPlayer(22,A.ang);
   }
  }
 }else if(A.name==="bomb"){
  if(A.n<3&&A.t>.15+A.n*.3){
   A.n++;
   lobs.push({sx:e.x,sy:e.y-12,tx:clamp(player.x+(Math.random()-.5)*80,16,VW-16),
    ty:clamp(player.y+(Math.random()-.5)*60,16,VH-16),t:0,dur:.85});
  }
 }else if(A.name==="missile"){
  e.heli=true;
  if(!A.fired&&A.t>.25){
   A.fired=true;
   for(let i=0;i<5;i++)
    warns.push({x:clamp(player.x+(Math.random()-.5)*140,20,VW-20),
     y:clamp(player.y+(Math.random()-.5)*120,20,VH-20),t:.95+i*.07});
  }
 }else if(A.name==="spiral"){
  const px=-dy/d,py=dx/d;
  moveEnt(e,px*60*dt*e.strafe,py*60*dt*e.strafe,false);
  A.emit+=dt;
  if(A.emit>=.11){
   A.emit=0;A.ang+=.55;
   eShoot(e,A.ang,8,165,"#f4c542",2);
  }
 }else if(A.name==="stun"){
  if(A.t>A.dur){e.act=null;e.vuln=1;e.cool=.8;return;}
 }
 if(A.name!=="stun"&&A.t>A.dur){
  e.act=null;
  e.cool=1.4-e.phase*.15+Math.random()*.4;
 }
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

function separation(){
 for(let i=0;i<enemies.length;i++){
  const a=enemies[i];
  if(a.dead||a.fly||a.static||a.boss)continue;
  for(let j=i+1;j<enemies.length;j++){
   const b=enemies[j];
   if(b.dead||b.fly||b.static||b.boss)continue;
   const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),md=(a.r+b.r)*.9;
   if(d<md&&d>0){
    const push=(md-d)/2;
    moveEnt(a,-dx/d*push,-dy/d*push,false);
    moveEnt(b,dx/d*push,dy/d*push,false);
   }
  }
 }
}
function contactsPass(){
 for(const e of enemies){
  if(e.dead||e.static||e.touch<=0)continue;
  if(e.contactCd>0)continue;
  if(Math.hypot(player.x-e.x,player.y-e.y)<e.r+player.r+1){
   hurtPlayer(e.touch,Math.atan2(player.y-e.y,player.x-e.x));
   e.contactCd=.9;
  }
 }
}
