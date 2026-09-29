let scanPat=null,vigCv=null,TW=[],elevOpen=0;
let lightCv=null,lightCtx=null,SKYA=[],SKYB=[],STARS=[],heliBeam={x:200,y:120};
let uiCv=null,uiCtx=null,uiQ=4;

function buildFX(){
 const sc=document.createElement("canvas");sc.width=1;sc.height=2;
 const sg=sc.getContext("2d");
 sg.fillStyle="rgba(0,0,0,.16)";sg.fillRect(0,1,1,1);
 scanPat=ctx.createPattern(sc,"repeat");
 vigCv=document.createElement("canvas");vigCv.width=VW;vigCv.height=VH;
 const vg=vigCv.getContext("2d");
 const g=vg.createRadialGradient(VW/2,VH/2,VH*.42,VW/2,VH/2,VH*.78);
 g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.42)");
 vg.fillStyle=g;vg.fillRect(0,0,VW,VH);
 for(let r=0;r<8;r++)for(let c=0;c<6;c++)TW.push(Math.random()<.55);
 lightCv=document.createElement("canvas");lightCv.width=VW;lightCv.height=VH;
 lightCtx=lightCv.getContext("2d");
 uiCv=document.createElement("canvas");uiCv.width=VW*uiQ;uiCv.height=VH*uiQ;
 uiCtx=uiCv.getContext("2d");
 let sx=0;
 while(sx<VW+40){
  const w1=18+Math.random()*30,h1=40+Math.random()*70;
  SKYA.push({x:sx,w:w1,h:h1});
  sx+=w1+4+Math.random()*10;
 }
 sx=-20;
 while(sx<VW+40){
  const w2=26+Math.random()*44,h2=80+Math.random()*90;
  const wins=[];
  const cols=Math.max(2,Math.floor(w2/9)),rows=Math.max(3,Math.floor(h2/12));
  for(let i=0;i<cols*rows;i++)wins.push(Math.random()<.4);
  SKYB.push({x:sx,w:w2,h:h2,wins:wins,cols:cols,rows:rows});
  sx+=w2+6+Math.random()*16;
 }
 for(let i=0;i<50;i++)STARS.push({x:Math.random()*VW,y:Math.random()*90,a:.2+Math.random()*.5,tw:Math.random()*7});
}
function cutL(g,x,y,r,a){
 if(r<=0)return;
 const gr=g.createRadialGradient(x,y,0,x,y,r);
 gr.addColorStop(0,"rgba(0,0,0,"+a+")");gr.addColorStop(1,"rgba(0,0,0,0)");
 g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();
}
function cutCone(g,x,y,ang,len,half,a){
 g.save();g.translate(x,y);g.rotate(ang);
 const gr=g.createLinearGradient(0,0,len,0);
 gr.addColorStop(0,"rgba(0,0,0,"+a+")");gr.addColorStop(1,"rgba(0,0,0,0)");
 g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.arc(0,0,len,-half,half);g.closePath();g.fill();
 g.restore();
}
function renderLights(){
 if(!lightCtx)return;
 const lg=lightCtx;
 lg.setTransform(1,0,0,1,0,0);
 lg.globalCompositeOperation="source-over";
 lg.clearRect(0,0,VW,VH);
 const th=THEMES[FLOORS[floorIdx].theme];
 const base=th.dark!=null?th.dark:.45;
 lg.fillStyle="rgba(6,8,14,"+(alarmActive?base*.55:base)+")";
 lg.fillRect(0,0,VW,VH);
 lg.globalCompositeOperation="destination-out";
 cutL(lg,player.x,player.y-6,98,.95);
 if(player.muzzle>0)
  cutL(lg,player.x+Math.cos(player.aim)*20,player.y-12+Math.sin(player.aim)*20,64,.9);
 for(const v of vendList)if(!v.used)cutL(lg,v.x,v.y-4,36,.8);
 if(exitTiles.length){
  const top=Math.min.apply(null,exitTiles.map(function(t){return t.ty}))*TS;
  cutL(lg,VW-10,top+16,42,hasKey?.85:.5);
 }
 for(const p of pickups){
  if(p.kind==="key")cutL(lg,p.x,p.y,28+.8*Math.sin(tGlobal*5),.85);
  else if(p.kind==="med")cutL(lg,p.x,p.y,20,.45);
  else if(p.kind==="wpn")cutL(lg,p.x,p.y,26,.7);
 }
 for(const f of flashes){
  const fr=f.t/.24;
  cutL(lg,f.x,f.y,60+(1-fr)*70,.95*fr);
 }
 for(const e of enemies){
  if(!e.dead&&e.type==="ceo"&&e.alert)cutL(lg,e.x,e.y-10,70,.9);
 }
 if(bossRef&&!bossRef.dead&&bossRef.heli){
  const hx=64,hy=44;
  heliBeam.x+=(clamp(player.x,120,VW)-heliBeam.x)*.02;
  heliBeam.y+=(clamp(player.y,60,VH-40)-heliBeam.y)*.02;
  const ang=Math.atan2(heliBeam.y-hy,heliBeam.x-hx);
  const len=Math.hypot(heliBeam.x-hx,heliBeam.y-hy);
  cutCone(lg,hx,hy+6,ang,len,.16,.75);
 }
}
function fmtTime(t){
 const m=Math.floor(t/60),s=Math.floor(t%60);
 return m+":"+String(s).padStart(2,"0");
}
function txt(s,x,y,size,col,align,bold){
 ctx.font=(bold?"bold ":"")+size+"px monospace";
 ctx.fillStyle=col;ctx.textAlign=align||"left";
 ctx.fillText(s,x,y);ctx.textAlign="left";
}
function wrapText(s,x,y,maxW,lh,col,size){
 ctx.font=size+"px monospace";ctx.fillStyle=col;
 let line="";
 for(const ch of s){
  const test=line+ch;
  if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line,x,y);y+=lh;line=ch;}
  else line=test;
 }
 if(line)ctx.fillText(line,x,y);
 return y+lh;
}
function panel(x,y,w,h){
 ctx.fillStyle="rgba(10,12,18,.75)";ctx.fillRect(x,y,w,h);
 ctx.strokeStyle="rgba(244,197,66,.35)";ctx.lineWidth=1;
 ctx.strokeRect(x+.5,y+.5,w-1,h-1);
}

function drawGlass(){
 for(const ks in glassHp){
  const k=+ks,tx=k%MW,ty=Math.floor(k/MW);
  const px=tx*TS,py=ty*TS;
  ctx.fillStyle="rgba(87,200,232,.20)";ctx.fillRect(px,py,TS,TS);
  ctx.strokeStyle="rgba(140,225,245,.5)";ctx.strokeRect(px+.5,py+.5,TS-1,TS-1);
  const cracks=3-glassHp[k];
  for(let c=0;c<cracks;c++){
   seedV=k*31+c*7+3;
   ctx.strokeStyle="rgba(200,240,250,.6)";
   ctx.beginPath();
   ctx.moveTo(px+2+srnd()*4,py+2+srnd()*12);
   ctx.lineTo(px+6+srnd()*8,py+4+srnd()*8);
   ctx.stroke();
  }
 }
}
function drawVends(){
 for(const v of vendList){
  ctx.save();ctx.translate(v.x,v.y+8);
  ctx.drawImage(SPR.vend,-SPR.vend.width/2,-SPR.vend.height);
  if(!v.used){
   ctx.fillStyle="rgba(87,200,232,"+(.06+.04*Math.sin(tGlobal*4))+")";
   ctx.fillRect(-10,-20,20,24);
  }else{
   ctx.fillStyle="rgba(0,0,0,.55)";ctx.fillRect(-5,-14,10,12);
   txt("품절",-0,-6,6,"#8b91a0","center");
  }
  ctx.restore();
 }
}
function drawElevator(){
 if(!exitTiles.length)return;
 const top=Math.min.apply(null,exitTiles.map(function(t){return t.ty}))*TS;
 const h=exitTiles.length*TS,dx=VW-18;
 const near=hasKey&&player.x>VW-70&&player.y>top-10&&player.y<top+h+10;
 const target=near?1:0;
 elevOpen+=clamp(target-elevOpen,-.06,.06);
 ctx.fillStyle="#20242c";ctx.fillRect(dx,top,16,h);
 ctx.fillStyle="#31363f";
 ctx.fillRect(dx+1+elevOpen*6,top+2,6,h-4);
 ctx.fillRect(dx+9-elevOpen*6,top+2,6,h-4);
 ctx.fillStyle="#101018";
 ctx.fillRect(dx+7,top+2,2,h-4);
 const lampCol=hasKey?(Math.sin(tGlobal*6)>0?"#3aa66a":"#1d5c38"):(Math.sin(tGlobal*6)>0?"#d93a3a":"#5c1420");
 ctx.fillStyle=lampCol;ctx.fillRect(dx+6,top-4,4,3);
 if(hasKey&&near){
  txt("▲",dx+8,top-10,8,"#f4c542","center",true);
 }
}
function drawPickups(){
 for(const p of pickups){
  const bob=Math.sin(p.t*4)*1.5;
  ctx.save();ctx.translate(p.x,p.y+bob);
  if(p.kind==="key"){
   ctx.drawImage(SPR.key,-4,-2);
   ctx.globalAlpha=.4+.4*Math.sin(p.t*6);
   ctx.fillStyle="#f4c542";ctx.fillRect(-1,-7,2,2);ctx.fillRect(-6,0,2,2);
   ctx.globalAlpha=1;
  }else if(p.kind==="med"){
   ctx.drawImage(SPR.med,-2,-4);
 }else if(p.kind==="doc"){
  docsRun++;
  player.maxhp+=10;player.hp=Math.min(player.maxhp,player.hp+10);
  sfx("key");
  pushToast("N-13 서류 조각 ("+Math.min(docsRun,5)+"/5) — 최대 체력 +10","#b887ff");
 }else if(p.kind==="ammo"){
   ctx.drawImage(SPR.ammo,-2,-3);
  }else{
   ctx.translate(0,bob*0);
   if(p.sub==="shotgun"){
    ctx.fillStyle="#6b5638";ctx.fillRect(-6,0,4,3);
    ctx.fillStyle="#585d6b";ctx.fillRect(-3,-2,9,2);
   }else if(p.sub==="smg"){
    ctx.fillStyle="#22252c";ctx.fillRect(-5,-2,10,3);
    ctx.fillStyle="#585d6b";ctx.fillRect(0,1,2,4);
   }else{
    ctx.fillStyle="#6b4a2e";ctx.fillRect(-6,-3,12,7);
    ctx.fillStyle="#3e2c1a";ctx.fillRect(-2,-4,4,2);
   }
   ctx.globalAlpha=.5+.4*Math.sin(p.t*5);
   ctx.fillStyle="#fff";ctx.fillRect(-1,-8,2,1);
   ctx.globalAlpha=1;
  }
  ctx.restore();
 }
}
function drawWarns(){
 for(const w of warns){
  const r=22*(0.85+0.15*Math.sin(tGlobal*22));
  ctx.strokeStyle="rgba(217,58,58,.8)";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(w.x,w.y,r,0,7);ctx.stroke();
  ctx.fillStyle="rgba(217,58,58,.14)";
  ctx.beginPath();ctx.arc(w.x,w.y,r,0,7);ctx.fill();
 }
}
function drawLobs(){
 for(const l of lobs){
  const x=l.sx+(l.tx-l.sx)*l.t,y=l.sy+(l.ty-l.sy)*l.t-Math.sin(l.t*Math.PI)*26;
  ctx.fillStyle="rgba(0,0,0,.3)";
  ctx.beginPath();ctx.ellipse(l.tx,l.ty,4-l.t*2,2,0,0,7);ctx.fill();
  ctx.fillStyle="#15181f";
  ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.fill();
  ctx.fillStyle="#ffb347";ctx.fillRect(x+1,y-4,1,1);
 }
}
function drawBullets(){
 ctx.save();
 ctx.imageSmoothingEnabled=true;
 ctx.globalCompositeOperation="lighter";
 for(const b of bullets){
  const core=b.from==="p"?(b.crit?"#ffd166":"#ffe9a8"):"#ff5964";
  // motion streak behind the round
  const sp=Math.hypot(b.vx,b.vy)||1;
  const ux=b.vx/sp,uy=b.vy/sp;
  const len=Math.min(20,sp*.055);
  ctx.strokeStyle=hexA(core,.30);
  ctx.lineWidth=b.size*1.1;
  ctx.beginPath();
  ctx.moveTo(b.x-ux*len,b.y-uy*len);
  ctx.lineTo(b.x,b.y);
  ctx.stroke();
  const img=glow(core,b.crit?12:9);
  ctx.drawImage(img,b.x-img.width/2,b.y-img.height/2);
 }
 for(const l of lobs){
  const x=l.sx+(l.tx-l.sx)*l.t,y=l.sy+(l.ty-l.sy)*l.t-Math.sin(l.t*Math.PI)*26;
  const img=glow("#ffb347",9);
  ctx.drawImage(img,x-img.width/2,y-img.height/2);
 }
 for(const b of bullets)if(b.chair){
  const img=glow("#e0a458",10);
  ctx.drawImage(img,b.x-img.width/2,b.y-img.height/2);
 }
 ctx.restore();
 for(const b of bullets){
  if(b.chair){
   ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot||0);
   ctx.fillStyle="#7a5230";ctx.fillRect(-6,-2,12,4);
   ctx.fillStyle="#54371e";ctx.fillRect(-2,-9,4,7);
   ctx.fillStyle="#8b91a0";ctx.fillRect(-6,-1,2,4);ctx.fillRect(4,-1,2,4);
   ctx.restore();
   continue;
  }
  ctx.fillStyle=b.color;
  if(b.crit)ctx.fillRect(b.x-1.5,b.y-1.5,3,3);
  else ctx.fillRect(b.x-b.size/2,b.y-b.size/2,b.size,b.size);
 }
}
function drawBeams(){
 for(const bm of beams){
  const a=Math.min(1,bm.t/.14);
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  ctx.strokeStyle="rgba(255,209,102,"+(a*.85)+")";ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(bm.x0,bm.y0);ctx.lineTo(bm.x1,bm.y1);ctx.stroke();
  ctx.strokeStyle="rgba(255,255,255,"+a+")";ctx.lineWidth=1.6;
  ctx.beginPath();ctx.moveTo(bm.x0,bm.y0);ctx.lineTo(bm.x1,bm.y1);ctx.stroke();
  ctx.restore();
 }
}
function drawParts(){
 for(const p of parts){
  if(p.ring){
   const frac=1-p.life/.32;
   ctx.strokeStyle=p.col;ctx.globalAlpha=Math.min(1,p.life*3);
   ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1,frac*p.sz),0,7);ctx.stroke();
   ctx.globalAlpha=1;
  }else if(p.k==="smoke"){
   const f=1-p.life/1.2;
   ctx.fillStyle=p.col;ctx.globalAlpha=p.life*.5;
   ctx.beginPath();ctx.arc(p.x,p.y,p.sz*(1+f*1.8),0,7);ctx.fill();
   ctx.globalAlpha=1;
  }else if(p.k==="ember"){
   const img=glow(p.col,6);
   ctx.globalAlpha=Math.min(1,p.life*2.5);
   ctx.save();ctx.imageSmoothingEnabled=true;
   ctx.drawImage(img,p.x-img.width/2,p.y-img.height/2);
   ctx.restore();
   ctx.globalAlpha=1;
   p.vy-=40*dtSafe();
  }else{
   ctx.fillStyle=p.col;ctx.globalAlpha=Math.min(1,p.life*3);
   ctx.fillRect(p.x-p.sz/2,p.y-p.sz/2,p.sz,p.sz);
   ctx.globalAlpha=1;
  }
 }
}
function drawHeli(){
 if(!bossRef||bossRef.dead||!bossRef.heli)return;
 const hx=64,hy=44+Math.sin(tGlobal*2)*2;
 ctx.save();ctx.translate(hx,hy);
 ctx.fillStyle="#20242c";
 ctx.beginPath();ctx.ellipse(0,0,16,7,0,0,7);ctx.fill();
 ctx.fillRect(12,-2,16,3);
 const rw=Math.cos(tGlobal*24)*22;
 ctx.strokeStyle="#8b91a0";ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(-rw,-9);ctx.lineTo(rw,-9);ctx.stroke();
 ctx.strokeStyle="#585d6b";ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(-14,7);ctx.lineTo(14,7);ctx.stroke();
 if(Math.sin(tGlobal*8)>0){ctx.fillStyle="#d93a3a";ctx.fillRect(26,-6,2,2);}
 ctx.restore();
}

function animFrame(name,phase,moving){
 const f=SPRF[name];
 if(!f||!f.length||!moving)return null;
 return f[(Math.floor(phase)&1)];
}
function flashOf(name,img){
 if(FLASHF[name]&&FLASHF[name].length)return null;
 return FLASH[name]||null;
}
function drawEntity(e){
 const isClone=e.type==="clone";
 const nm=isClone?"clone":spriteNameOf(e);
 const spr=SPR[nm]||SPR.guard;
 const s=e.type==="chief"?1.1:e.type==="ceo"?1.2:1;
 const fl=FLASH[nm]||FLASH.guard;
 ctx.save();
 if(isClone)ctx.globalAlpha=e.alpha;
 ctx.fillStyle="rgba(0,0,0,.34)";
 ctx.beginPath();ctx.ellipse(e.x,e.y+1,e.r*s*1.1,4,0,0,7);ctx.fill();
 if(e.elite){
  const pl=.5+.5*Math.sin(tGlobal*5+e.id);
  const g=ctx.createRadialGradient(e.x,e.y-14,2,e.x,e.y-14,26);
  g.addColorStop(0,"rgba(255,209,102,"+(0.14+0.08*pl)+")");
  g.addColorStop(1,"rgba(255,209,102,0)");
  ctx.fillStyle=g;ctx.fillRect(e.x-26,e.y-40,52,52);
 }
 if(e.type==="ceo"&&e.alert){
  const g=ctx.createRadialGradient(e.x,e.y-18,2,e.x,e.y-18,38);
  g.addColorStop(0,"rgba(255,209,102,"+(0.12+0.06*Math.sin(tGlobal*5))+")");
  g.addColorStop(1,"rgba(255,209,102,0)");
  ctx.fillStyle=g;ctx.fillRect(e.x-38,e.y-56,76,76);
 }
 const af=animFrame(nm,(e.t*7),e.moving);
 const img=af||spr;
 ctx.translate(e.x,e.y);
 // squash-and-stretch on hit
 const ht=e.hitT>0?(e.hitT/.12):0;
 const sx2=1+ht*.22,sy2=1-ht*.18;
 ctx.scale(e.face*s*CHS*sx2,s*CHS*sy2);
 const bobY=e.moving?Math.abs(Math.sin(e.bob||e.t*9))*1.2:0;
 const lean=e.moving?Math.sin(e.t*7)*0.02:0;
 if(lean)ctx.rotate(lean*e.face);
 ctx.drawImage(img,-img.width/2,-img.height+2+bobY);
 if(e.flash>0){
  ctx.globalAlpha=.9;
  const afl=af?(FLASHF[nm]&&FLASHF[nm][(Math.floor(e.t*7)&1)]):null;
  ctx.drawImage(afl||fl,-(afl||fl).width/2,-(afl||fl).height+2+bobY);
  ctx.globalAlpha=isClone?e.alpha:1;
 }
 ctx.restore();
  if(e.tell>0&&!e.static){
   const prog=1-e.tell/(e.tellMax||.8);
   if(e.tactic==="brute"){
    ctx.save();
    ctx.strokeStyle="rgba(255,71,87,"+(.35+.5*prog)+")";
    ctx.lineWidth=2+prog*2;
    ctx.setLineDash([5,4]);
    ctx.beginPath();
    ctx.moveTo(e.x,e.y-8);
    ctx.lineTo(e.x+Math.cos(e.chargeAng)*90,e.y-8+Math.sin(e.chargeAng)*90);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle="rgba(255,71,87,"+(.3+.5*prog)+")";
    ctx.beginPath();ctx.arc(e.x,e.y-8,4+prog*4,0,7);ctx.fill();
   }else if(e.aimX){
    ctx.save();
    ctx.strokeStyle="rgba(255,71,87,"+(.3+.55*prog)+")";
    ctx.lineWidth=1.5;
    ctx.setLineDash([4,3]);
    ctx.beginPath();
    ctx.moveTo(e.x,e.y-8);
    ctx.lineTo(e.aimX,e.aimY);
    ctx.stroke();
    ctx.restore();
    const r=4+prog*3;
    ctx.strokeStyle="rgba(255,71,87,.8)";ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(e.aimX,e.aimY,r,0,7);ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.aimX-r-3,e.aimY);ctx.lineTo(e.aimX+r+3,e.aimY);
    ctx.moveTo(e.aimX,e.aimY-r-3);ctx.lineTo(e.aimX,e.aimY+r+3);
    ctx.stroke();
   }
  }
  if(e.elite){
   const pl=.5+.5*Math.sin(tGlobal*5+e.id);
   ctx.strokeStyle="rgba(255,209,102,"+(.6+.35*pl)+")";
   ctx.lineWidth=1.6;
   ctx.beginPath();
   ctx.ellipse(e.x,e.y+1,e.r*s*1.1+3,6,0,0,7);
   ctx.stroke();
   for(let i=0;i<3;i++){
    const a=tGlobal*1.5+i*2.1+e.id;
    ctx.fillStyle="rgba(255,209,102,.8)";
    ctx.fillRect(e.x+Math.cos(a)*(e.r+6)-1,e.y+1+Math.sin(a)*4-1,2,2);
   }
  }
  if(!e.static&&isArmed(e)){
  ctx.save();
  ctx.translate(e.x,e.y-12);ctx.rotate(e.faceAng);
  ctx.fillStyle="#15181f";ctx.fillRect(2,-1,7,2);
  ctx.restore();
 }
 if(e.type==="shield"){
  ctx.save();ctx.translate(e.x,e.y-12);ctx.rotate(e.faceAng);
  ctx.fillStyle="#33507a";ctx.fillRect(7,-9,5,18);
  ctx.strokeStyle="#4dd7fe";ctx.strokeRect(7.5,-8.5,4,17);
  ctx.restore();
 }
 if(e.type==="drone"){
  const rw=Math.cos(e.t*40)*9;
  ctx.strokeStyle="#c3cad6";ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(e.x-rw,e.y-17);ctx.lineTo(e.x+rw,e.y-17);ctx.stroke();
 }
 if(e.type==="printer"){
  ctx.save();ctx.translate(e.x,e.y-9);ctx.rotate(e.faceAng);
  ctx.fillStyle="#585d6b";ctx.fillRect(4,-1,9,2);
  ctx.restore();
 }
 if(e.type==="cctv"){
  if(e.lock>0){
   const ep=rayEnd(e.x,e.y-8,e.faceAng,240);
   ctx.save();ctx.setLineDash([3,3]);
   ctx.strokeStyle="rgba(255,91,74,.5)";ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(e.x,e.y-8);ctx.lineTo(ep.x,ep.y);ctx.stroke();
   ctx.restore();
  }
  if(e.fire>0){
   const ep=rayEnd(e.x,e.y-8,e.faceAng,240);
   ctx.strokeStyle="#ff5b4a";ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(e.x,e.y-8);ctx.lineTo(ep.x,ep.y);ctx.stroke();
   ctx.strokeStyle="#fff";ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(e.x,e.y-8);ctx.lineTo(ep.x,ep.y);ctx.stroke();
   parts.push({x:ep.x,y:ep.y,vx:(Math.random()-.5)*50,vy:-Math.random()*30,g:80,life:.2,col:"#ff5b4a",sz:1});
  }
 }
 if(!e.boss&&e.hp<e.maxhp){
  const byy=e.type==="printer"?18:24;
  ctx.fillStyle="rgba(0,0,0,.6)";ctx.fillRect(e.x-8,e.y-byy-2,16,3);
  ctx.fillStyle="#ff4757";ctx.fillRect(e.x-7,e.y-byy-1,Math.max(0,14*e.hp/e.maxhp),1);
 }
}
function spriteNameOf(e){return e.type;}
function isArmed(e){
 return["guard","mgr","shield","chief","exec","clone","ceo"].includes(e.type);
}

function drawGun(px,py){
 const w=curWpn,a=player.aim;
 ctx.save();
 ctx.translate(px,py-17);ctx.rotate(a);
 ctx.translate(-player.recoil,0);
 ctx.scale(CHS,CHS);
 if(w==="case"){
  if(player.swing>0){
   const pr=1-player.swing/.16;
   ctx.rotate(-.9+pr*1.8);
   ctx.fillStyle="rgba(107,74,46,.85)";
   ctx.beginPath();ctx.moveTo(4,0);ctx.arc(4,0,20,-.55,.55);ctx.closePath();ctx.fill();
   ctx.fillStyle="#6b4a2e";ctx.fillRect(14,-4,8,8);
  }else{
   ctx.rotate(-.4);
   ctx.fillStyle="#6b4a2e";ctx.fillRect(2,-3,9,7);
   ctx.fillStyle="#3e2c1a";ctx.fillRect(5,-4,3,2);
  }
 }else if(w==="card"){
  ctx.fillStyle="#f5f6fa";
  ctx.fillRect(3,-2,4,3);
 }else if(w==="stapler"){
  ctx.fillStyle="#c92a3a";ctx.fillRect(3,-2.5,8,4);
  ctx.fillStyle="#15181f";ctx.fillRect(9,-1,3,2);
  ctx.fillStyle="#8b91a0";ctx.fillRect(4,1.5,4,1);
 }else if(w==="revolver"){
  ctx.fillStyle="#ffd166";ctx.fillRect(3,-1.5,9,3);
  ctx.fillStyle="#caa53a";ctx.fillRect(3,1,4,4);
  ctx.fillStyle="#8a6a1f";ctx.fillRect(5,-3.5,3,2);
 }else if(w==="ext"){
  ctx.fillStyle="#c92a3a";ctx.fillRect(0,-4,6,10);
  ctx.fillStyle="#e8ecef";ctx.fillRect(1,-6,4,2);
  ctx.fillStyle="#15181f";ctx.fillRect(6,-3,8,2);
  ctx.fillStyle="#585d6b";ctx.fillRect(13,-2,2,4);
 }else if(w==="chair"){
  ctx.rotate(.45);
  ctx.fillStyle="#7a5230";ctx.fillRect(-2,-2,10,3);
  ctx.fillStyle="#54371e";ctx.fillRect(4,-8,2,6);
  ctx.strokeStyle="#3e2c1a";ctx.lineWidth=1;ctx.strokeRect(-2,-2,10,3);
 }else{
  const len=w==="shotgun"?11:w==="smg"?8:7;
  ctx.fillStyle="#15181f";ctx.fillRect(3,-1.5,len,3);
  ctx.fillStyle="#585d6b";ctx.fillRect(3+len-3,-1.5,3,1.5);
  if(w==="shotgun"){ctx.fillStyle="#6b4a2e";ctx.fillRect(4,1,4,2);}
 }
 if(player.muzzle>0&&curWpn!=="case"&&curWpn!=="ext"&&curWpn!=="chair"){
  ctx.fillStyle="#ffe9a8";
  ctx.beginPath();
  ctx.moveTo(12,0);ctx.lineTo(17,-3);ctx.lineTo(17,3);ctx.closePath();ctx.fill();
 }
 ctx.restore();
}

function drawPlayer(){
 const p=player;
 ctx.save();
 if(p.inv>0&&p.roll<=0)ctx.globalAlpha=.5+.35*Math.sin(tGlobal*30);
 ctx.fillStyle="rgba(0,0,0,.34)";
 ctx.beginPath();ctx.ellipse(p.x,p.y+1,9,4,0,0,7);ctx.fill();
 const af=animFrame("player",p.bob*0.55,p.moving);
 const img=af||SPR.player;
 ctx.translate(p.x,p.y);
 if(p.roll>0)ctx.scale(1.1,.8);
 ctx.scale(p.face*CHS,CHS);
 const bobY=p.moving?Math.abs(Math.sin(p.bob))*1.2:0;
 if(p.moving)ctx.rotate(Math.sin(p.bob*0.5)*0.02*p.face);
 ctx.drawImage(img,-img.width/2,-img.height+2+bobY);
 ctx.restore();
 drawGun(p.x,p.y);
}

function drawWorld(){
 const sm=shake.m*shakeM;
 const sx=shake.t>0?(Math.random()-.5)*sm*2:0;
 const sy=shake.t>0?(Math.random()-.5)*sm*2:0;
 // subtle zoom punch on impact decays back to 1
 const zoom=1+Math.min(0.035,sm*.008)+Math.max(0,(shake.t-.1)*.05);
 ctx.save();
 if(zoom!==1){
  ctx.translate(VW/2,VH/2);
  ctx.scale(zoom,zoom);
  ctx.translate(-VW/2,-VH/2);
 }
 ctx.translate(Math.round(sx),Math.round(sy));
 if(floorCv)ctx.drawImage(floorCv,0,0);
 drawGlass();drawVends();drawElevator();drawPickups();
 drawWarns();drawHeli();
 const list=[];
 for(const e of enemies)if(!e.dead)list.push({y:e.y,e:e});
 list.push({y:player.y,p:true});
 list.sort(function(a,b){return a.y-b.y});
 for(const it of list){if(it.p)drawPlayer();else drawEntity(it.e);}
  drawLobs();drawBullets();drawBeams();drawParts();
  for(const m of motes){
   ctx.fillStyle="rgba(200,220,255,"+(0.04+0.05*Math.sin(tGlobal*1.5+m.p))+")";
   ctx.fillRect(m.x,m.y,Math.max(1,m.s*1.6),Math.max(1,m.s*1.6));
  }
  for(const f2 of floats){
   ctx.globalAlpha=Math.min(1,f2.t*2);
   txt(f2.txt,f2.x,f2.y,8,f2.col,"center",true);
   ctx.globalAlpha=1;
  }
  for(const d of dmgNums){
   const a=Math.min(1,d.t*2.4);
   ctx.globalAlpha=a;
   ctx.font="bold 7px monospace";
   ctx.textAlign="center";
   ctx.fillStyle="rgba(0,0,0,.6)";
   ctx.fillText(d.v,d.x+1,d.y+1);
   ctx.fillStyle=d.col;
   ctx.fillText(d.v,d.x,d.y);
   ctx.textAlign="left";
   ctx.globalAlpha=1;
  }
  ctx.restore();
}

function pill(x,y,w,h,acc){
 ctx.fillStyle="rgba(10,13,20,.8)";
 roundRect(ctx,x,y,w,h,5);ctx.fill();
 if(acc){
  ctx.strokeStyle=hexA(acc,.55);ctx.lineWidth=1;
  roundRect(ctx,x+.5,y+.5,w-1,h-1,4);ctx.stroke();
 }
}
function drawWpnIcon(name,cx,cy,col){
 ctx.fillStyle=col;
 if(name==="pistol"){ctx.fillRect(cx-5,cy-2,9,3);ctx.fillRect(cx-3,cy+1,3,5);}
 else if(name==="shotgun"){ctx.fillRect(cx-7,cy-1,13,2);ctx.fillRect(cx+1,cy+1,4,2);ctx.fillRect(cx-7,cy-2,3,4);}
 else if(name==="smg"){ctx.fillRect(cx-6,cy-2,10,4);ctx.fillRect(cx-2,cy+2,2,4);ctx.fillRect(cx-6,cy+2,2,3);ctx.fillRect(cx+4,cy-1,3,2);}
 else if(name==="case"){ctx.fillRect(cx-6,cy-3,12,8);ctx.fillStyle="rgba(0,0,0,.35)";ctx.fillRect(cx-2,cy-5,4,2);}
 else if(name==="card"){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.35);ctx.fillRect(-3,-4,6,8);ctx.fillStyle="rgba(0,0,0,.3)";ctx.fillRect(-3,-1,6,1);ctx.restore();}
 else if(name==="toner"){ctx.fillStyle="#6b3fa0";ctx.fillRect(cx-5,cy-4,10,9);ctx.fillStyle="#482a70";ctx.fillRect(cx-5,cy-6,10,3);ctx.fillStyle="#b887ff";ctx.fillRect(cx-3,cy-1,6,2);}
 else if(name==="homing"){ctx.fillStyle="#4dd7fe";ctx.fillRect(cx-5,cy-2,10,6);ctx.fillStyle="#f5f6fa";ctx.fillRect(cx+3,cy-7,1,5);ctx.fillStyle="#0b0d13";ctx.fillRect(cx-3,cy,6,1);}
 else{ctx.fillStyle="#ffd166";ctx.beginPath();ctx.moveTo(cx,cy+6);ctx.lineTo(cx-2,cy-2);ctx.lineTo(cx+2,cy-2);ctx.closePath();ctx.fill();ctx.fillRect(cx-1,cy-8,2,6);}
}
function drawHUD(){
 const acc=THEMES[FLOORS[floorIdx].theme].acc;
 pill(6,6,124,18,acc);
 txt(FLOORS[floorIdx].name+" · "+FLOORS[floorIdx].sub,14,18,8,"#f5f6fa",null,true);
 if(hasKey){
  pill(134,6,46,18,"#ffd166");
  ctx.drawImage(SPR.key,140,11);
  txt("KEY",158,18,7,"#ffd166",null,true);
 }
 if(docsRun>0){
  pill(184,6,70,18,"#b887ff");
  txt("N-13 "+Math.min(docsRun,5)+"/5",219,18,8,"#d9c2ff","center");
 }
 if(epiT>0){
  pill(VW/2-74,6,148,18,"#ff4757");
  txt("검찰 도착 "+Math.ceil(epiT)+"초 전",VW/2,19,9,"#ffd166","center",true);
 }
 pill(VW-118,6,52,16,null);
 txt("KILL "+kills,VW-92,17,8,"#c3cad6","center");
 pill(VW-62,6,56,16,null);
 txt(fmtTime(playTime),VW-34,17,8,"#c3cad6","center");
 const pct=Math.max(0,player.hp/player.maxhp);
 const hpCol=pct>.55?"#37d67a":pct>.25?"#ffd166":(Math.sin(tGlobal*9)>0?"#ff4757":"#7a1420");
 pill(8,VH-24,110,15,null);
 ctx.fillStyle="rgba(255,255,255,.06)";
 roundRect(ctx,11,VH-21,104,9,3);ctx.fill();
 ctx.fillStyle=hpCol;
 if(pct>0){roundRect(ctx,11,VH-21,Math.max(2,104*pct),9,3);ctx.fill();}
 ctx.fillStyle="rgba(0,0,0,.28)";
 for(let i=1;i<10;i++)ctx.fillRect(11+i*10.4,VH-21,1,9);
 txt(""+Math.ceil(player.hp),122,VH-13,8,"#f5f6fa",null,true);
 ctx.fillStyle="#ff4757";ctx.fillRect(114,VH-19,2,2);ctx.fillRect(113,VH-18,4,1);
 const order=WPN_ORDER,bw2=26;
 for(let i=0;i<order.length;i++){
  const wname=order[i],x=VW-8-(order.length-i)*bw2+2,y=VH-26;
  const owned=wpn[wname],act=wname===curWpn;
  ctx.globalAlpha=owned?1:.22;
  pill(x,y,23,20,act?acc:null);
  if(act){ctx.fillStyle=hexA(acc,.14);roundRect(ctx,x+1,y+1,21,18,4);ctx.fill();}
  drawWpnIcon(wname,x+11.5,y+9,!owned?"#585d6b":act?"#f5f6fa":"#8b91a0");
  if(!owned)txt("×",x+17,y+8,7,"#ff4757","center");
  ctx.globalAlpha=1;
  if(act){
   if(wname==="ext"){
    txt(Math.round(player.pressure)+"%",x+11,y+29,7,player.pressure>25?"#9fd9ea":"#ff4757","center");
   }else{
    const am={pistol:"∞",card:"∞",case:"∞",chair:"∞"}[wname];
    txt(am!==undefined?am:String(ammo[wname]),x+11,y+29,7,am!==undefined?"#ffd166":"#f5f6fa","center");
   }
  }
 }
 if(bossRef&&!bossRef.dead&&bossRef.alert){
  const bw=200,bx=(VW-bw)/2;
  pill(bx,8,bw,20,"#ff4757");
  txt("CEO 강만재",VW/2,20,9,"#ffd166","center",true);
  ctx.fillStyle="rgba(255,255,255,.08)";
  ctx.fillRect(bx+8,22,bw-16,4);
  const hpw=(bw-16)*Math.max(0,bossRef.hp)/bossRef.maxhp;
  ctx.fillStyle="#ffd166";ctx.fillRect(bx+8,22,hpw,4);
  ctx.fillStyle="#ff4757";ctx.fillRect(bx+8,26,hpw,1);
  const shx=bx+8+((tGlobal*70)%(bw-16));
  ctx.fillStyle="rgba(255,255,255,.35)";ctx.fillRect(shx,22,8,4);
  for(let i=0;i<3;i++){
   const px2=bx+bw-30-i*11;
   ctx.save();ctx.translate(px2,13);ctx.rotate(Math.PI/4);
   ctx.fillStyle=bossRef.phase>i?"#ff4757":"#33363b";
   ctx.fillRect(-3,-3,6,6);ctx.restore();
  }
 }
 let ty=44;
 for(const t of toasts){
  ctx.globalAlpha=Math.min(1,t.t);
  const wch=t.txt.length*5+18;
  pill((VW-wch)/2,ty-8,wch,13,t.col);
  ctx.fillStyle=t.col;ctx.fillRect((VW-wch)/2+4,ty-4,2,5);
  txt(t.txt,(VW-wch)/2+11,ty+2,7,"#f5f6fa");
  ctx.globalAlpha=1;ty+=16;
 }
 for(const v of vendList){
  if(!v.used&&Math.hypot(v.x-player.x,v.y-player.y)<24){
   pill(v.x-24,v.y-30,48,13,"#4dd7fe");
   txt("[E] 커피",v.x,v.y-20,7,"#4dd7fe","center");
  }
 }
 for(let i=0;i<SKILLS.length;i++){
  const S=SKILLS[i],st=skillState[S.id];
  if(!st)continue;
  const x=VW/2-72+i*50,y=VH-52;
  if(!st.u){
   ctx.globalAlpha=.8;
   pill(x,y,46,18,null);
   txt(S.short,x+9,y+12,8,"#585d6b",null,true);
   txt(Math.min(stats[S.stat],S.need)+"/"+S.need,x+29,y+12,6,"#8b91a0","center");
   ctx.globalAlpha=1;
  }else{
   const ready=st.cd<=0;
   const colr=ready?"#ffd166":"#585d6b";
   pill(x,y,46,18,colr);
   if(st.cd>0){
    ctx.fillStyle="rgba(255,255,255,.13)";
    ctx.fillRect(x+2,y+2,42*Math.min(1,st.cd/S.cd),14);
   }
   txt(String(i+1),x+9,y+12,8,ready?colr:"#585d6b",null,true);
   txt(S.short,x+27,y+12,8,ready?"#f5f6fa":"#8b91a0","center");
   if(st.cd>0)txt(Math.ceil(st.cd),x+27,y+21,6,"#ff8090","center");
  }
 }
 if(caffeineT>0){
  pill(VW/2-40,VH-72,80,13,"#ffd166");
  txt("카페인 "+caffeineT.toFixed(1)+"s",VW/2,VH-62,7,"#ffd166","center",true);
 }
 if(comboN>=2&&comboT>0){
  ctx.globalAlpha=Math.min(1,comboT);
  txt("COMBO x"+comboN,VW-10,28,9,"#ffd166","right",true);
  ctx.globalAlpha=1;
 }
}
function drawCrosshair(){
 const r=4+player.recoil;
 const col=THEMES[FLOORS[floorIdx].theme].acc;
 ctx.strokeStyle=hexA(col,.9);ctx.lineWidth=1;
 ctx.beginPath();ctx.arc(mouse.x,mouse.y,r,0,7);ctx.stroke();
 ctx.fillStyle="#f5f6fa";ctx.fillRect(mouse.x-.5,mouse.y-.5,1,1);
}

const SPK_COL={"도혁":"#4dd7fe","CEO 강만재":"#ff4757"};
function rrU(g,x,y,w,h,r){
 g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);
 g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
}
const UI_FONT="'Segoe UI','Apple SD Gothic Neo','Malgun Gothic',sans-serif";
function wrapU(g,s,x,y,maxW,lh){
 let line="";
 for(const ch of s){
  const t=line+ch;
  if(g.measureText(t).width>maxW&&line){g.fillText(line,x,y);y+=lh;line=ch;}
  else line=t;
 }
 if(line)g.fillText(line,x,y);
 return y+lh;
}
function drawDialog(){
 ctx.fillStyle="rgba(4,6,10,.5)";ctx.fillRect(0,0,VW,VH);
 if(!uiCtx)return;
 const g=uiCtx,Q=uiQ;
 g.setTransform(Q,0,0,Q,0,0);
 g.clearRect(0,0,VW,VH);
 const spk=dlg.lines[dlg.idx][0],line=dlg.lines[dlg.idx][1];
 const col=SPK_COL[spk]||"#ffd166";
 const bx=18,by=VH-96,bw=VW-36,bh=80;
 g.fillStyle="rgba(0,0,0,.45)";
 rrU(g,bx+4,by+6,bw,bh,14);g.fill();
 const grad=g.createLinearGradient(0,by,0,by+bh);
 grad.addColorStop(0,"rgba(22,28,42,.97)");grad.addColorStop(1,"rgba(12,15,24,.98)");
 g.fillStyle=grad;
 rrU(g,bx,by,bw,bh,13);g.fill();
 g.strokeStyle=hexA(col,.65);g.lineWidth=1.5;
 rrU(g,bx+.75,by+.75,bw-1.5,bh-1.5,12);g.stroke();
 g.fillStyle=hexA(col,.3);
 rrU(g,bx+16,by+7,bw-32,2,1);g.fill();
 g.fillStyle="rgba(255,255,255,.06)";
 rrU(g,bx+16,by+20,48,48,9);g.fill();
 g.strokeStyle=hexA(col,.75);g.lineWidth=1;
 rrU(g,bx+16.5,by+20.5,47,47,8.5);g.stroke();
 g.font="bold 24px "+UI_FONT;
 g.textAlign="center";g.textBaseline="middle";
 g.fillStyle=col;g.fillText(spk[0],bx+40,by+45);
 g.textAlign="left";g.textBaseline="alphabetic";
 g.font="bold 11px "+UI_FONT;
 const nw=g.measureText(spk).width;
 g.fillStyle=col;
 rrU(g,bx+76,by+13,nw+20,18,7);g.fill();
 g.fillStyle="#0b0d13";g.fillText(spk,bx+86,by+26);
 g.font="500 12px "+UI_FONT;
 g.fillStyle="#eef2f8";
 wrapU(g,line.slice(0,Math.floor(dlg.ch)),bx+78,by+52,bw-116,15);
 if(dlg.ch>=line.length){
  g.globalAlpha=.45+.55*Math.sin(tGlobal*7);
  g.fillStyle=col;
  g.beginPath();
  g.moveTo(bx+bw-30,by+bh-20);g.lineTo(bx+bw-18,by+bh-20);g.lineTo(bx+bw-24,by+bh-12);
  g.closePath();g.fill();
  g.globalAlpha=1;
 }
 g.setTransform(1,0,0,1,0,0);
 ctx.imageSmoothingEnabled=true;
 ctx.drawImage(uiCv,0,0,VW,VH);
 ctx.imageSmoothingEnabled=false;
}
function drawSettings(){
 ctx.fillStyle="rgba(4,6,10,.85)";ctx.fillRect(0,0,VW,VH);
 txt("설정",VW/2,44,16,"#f5f6fa","center",true);
 ctx.strokeStyle="rgba(255,209,102,.4)";
 ctx.beginPath();ctx.moveTo(VW/2-40,54.5);ctx.lineTo(VW/2+40,54.5);ctx.stroke();
 const rows=[
  {k:"vol",name:"볼륨",val:OPT.vol<=0?"MUTE":Math.round(OPT.vol*100)+"%"},
  {k:"shake",name:"화면 흔들림",val:OPT.shake<=0?"OFF":Math.round(OPT.shake*100)+"%"},
  {k:"crt",name:"CRT 스캔라인",val:crtOn?"ON":"OFF"}
 ];
 let y=84;
 for(let i=0;i<rows.length;i++){
  const r=rows[i];
  pill(VW/2-110,y,220,20,r.k==="vol"?"#4dd7fe":r.k==="shake"?"#ff5964":"#b887ff");
  txt(r.name,VW/2-100,y+13,8,"#c3cad6",null,true);
  txt(r.val,VW/2+96,y+13,8,"#f5f6fa","right",true);
  if(r.k==="vol"||r.k==="shake"){
   const bw=90,bx=VW/2-6;
   ctx.fillStyle="rgba(255,255,255,.1)";ctx.fillRect(bx,y+8,bw,4);
   const fv=r.k==="vol"?OPT.vol:OPT.shake;
   ctx.fillStyle=rows[i].col||"#ffd166";ctx.fillRect(bx,y+8,bw*Math.min(1,fv),4);
  }
  txt("[ "+(i+1)+" ]",VW/2+92,y+13,7,"#585d6b",null,true);
  y+=28;
 }
 txt("ESC : 닫기",VW/2,196,8,"#8b91a0","center");
 txt("변경사항은 자동 저장됩니다",VW/2,212,7,"#585d6b","center");
}
function drawPerkPick(){
 ctx.fillStyle="rgba(4,6,10,.72)";ctx.fillRect(0,0,VW,VH);
 txt("층 클리어 보너스",VW/2,60,10,"#ffd166","center",true);
 if(perkPick.label)txt("NEXT  "+perkPick.label,VW/2,74,7,"#8b91a0","center");
 txt("하나를 선택하세요",VW/2,90,7,"#8b91a0","center");
 const opts=perkPick.opts;
 const cw=118,chh=96,gap=10;
 const totalW=opts.length*cw+(opts.length-1)*gap;
 let x0=(VW-totalW)/2;
 for(let i=0;i<opts.length;i++){
  const pk=opts[i],x=x0+i*(cw+gap),y=110;
  const hov=hoverPerk===i;
  ctx.fillStyle=hov?"rgba(255,255,255,.08)":"rgba(10,13,20,.85)";
  roundRect(ctx,x,y,cw,chh,8);ctx.fill();
  ctx.strokeStyle=hov?pk.col:"rgba(140,150,170,.35)";
  ctx.lineWidth=hov?2:1;
  roundRect(ctx,x+.5,y+.5,cw-1,chh-1,8);ctx.stroke();
  ctx.fillStyle=pk.col;
  ctx.beginPath();ctx.arc(x+cw/2,y+26,16,0,7);ctx.fill();
  ctx.font="bold 13px monospace";ctx.textAlign="center";
  ctx.fillStyle="#0b0d13";ctx.fillText(pk.short,x+cw/2,y+30);ctx.textAlign="left";
  ctx.font="bold 9px monospace";
  ctx.fillStyle=hov?"#f5f6fa":"#c3cad6";ctx.textAlign="center";
  ctx.fillText(pk.name,x+cw/2,y+58);ctx.textAlign="left";
  ctx.font="7px monospace";
  ctx.fillStyle="#8b91a0";
  const dw=ctx.measureText(pk.desc).width;
  wrapText(pk.desc,x+cw/2-dw/2,y+74,dw+2,9,"#8b91a0",7);
  txt(String(i+1),x+7,y+11,7,"#585d6b",null,true);
 }
 txt("마우스 클릭 또는 1/2/3",VW/2,222,7,"#585d6b","center");
 if(perks.length)
  txt("획득: "+perks.join(" · "),VW/2,VH-12,7,"#b887ff","center");
}
function drawTitle(){
 const g=ctx.createLinearGradient(0,0,0,VH);
 g.addColorStop(0,"#070a14");g.addColorStop(.6,"#0d1220");g.addColorStop(1,"#141a2b");
 ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
 for(const s of STARS){
  ctx.fillStyle="rgba(200,220,255,"+(s.a*(0.6+0.4*Math.sin(tGlobal*2+s.tw)))+")";
  ctx.fillRect(s.x,s.y,1,1);
 }
 ctx.fillStyle="#e8e4d8";
 ctx.beginPath();ctx.arc(408,32,11,0,7);ctx.fill();
 ctx.fillStyle="#0d1220";
 ctx.beginPath();ctx.arc(413,28,9,0,7);ctx.fill();
 for(const b of SKYA){
  ctx.fillStyle="#10141f";
  ctx.fillRect(b.x,VH-58-b.h,b.w,b.h);
 }
 for(const b of SKYB){
  ctx.fillStyle="#151b2c";
  ctx.fillRect(b.x,VH-30-b.h,b.w,b.h+30);
  for(let r=0;r<b.rows;r++)for(let c2=0;c2<b.cols;c2++){
   const on=b.wins[r*b.cols+c2]&&Math.sin(tGlobal*.7+r*3+c2*5)>-.85;
   ctx.fillStyle=on?"rgba(255,209,102,.75)":"rgba(90,110,150,.12)";
   ctx.fillRect(b.x+3+c2*(b.w-5)/b.cols,VH-26-b.h+r*11,3,4);
  }
 }
 ctx.fillStyle="#05070d";ctx.fillRect(0,VH-14,VW,14);
 ctx.fillStyle="rgba(77,215,254,.10)";ctx.fillRect(0,VH-14,VW,1);
 const word="BENNETT CO.";
 ctx.font="bold 9px monospace";
 let nx=VW-34;
 for(let i=word.length-1;i>=0;i--){
  const ch=word[i],yy=34+i*12;
  const lit=Math.sin(i*1.7+tGlobal*(i%3+2))>-.7;
  if(ch===" "){nx+=0;continue;}
  if(lit){
   ctx.fillStyle="rgba(255,71,87,.22)";
   ctx.fillRect(nx-7,yy-8,11,11);
   txt(ch,nx-1.5,yy,8,"#ff8090","center",true);
  }else{
   txt(ch,nx-1.5,yy,8,"#3a2030","center");
  }
 }
 txt("EST. 1988",VW-52,180,6,"rgba(255,128,144,.35)","center");
 ctx.fillStyle="#ff4757";
 roundRect(ctx,(VW-228)/2,44,228,38,4);ctx.fill();
 ctx.strokeStyle="rgba(255,255,255,.15)";
 roundRect(ctx,(VW-228)/2+.5,44.5,227,37,4);ctx.stroke();
 txt("퇴사는 없다",VW/2,72,27,"#f5f6fa","center",true);
 const sw=((tGlobal*70)%(VW+120))-60;
 const sg=ctx.createLinearGradient(sw-30,0,sw+30,0);
 sg.addColorStop(0,"rgba(255,209,102,0)");sg.addColorStop(.5,"rgba(255,209,102,.9)");sg.addColorStop(1,"rgba(255,209,102,0)");
 ctx.fillStyle=sg;ctx.fillRect((VW-228)/2+8,84,212,2);
 txt("NO RESIGNATION : MODERN PIXEL REVENGE",VW/2,98,7,"#8b91a0","center");
 if(Math.sin(tGlobal*5)>-.2){
  ctx.font="bold 10px monospace";
  ctx.fillStyle="#ffd166";
  ctx.fillText("- CLICK OR PRESS ENTER -",VW/2-78,126);
 }
 const rows=[
  ["WASD 이동","마우스 조준 · 발사"],
  ["SPACE 구르기","Q 무기 교체"],
  ["E 상호작용","ESC 정지 / M 음소거"]
 ];
 let ry=146;
 for(const r of rows){
  pill(VW/2-118,ry-8,112,13,"#4dd7fe");
  pill(VW/2+6,ry-8,112,13,null);
  txt(r[0],VW/2-62,ry+1,7,"#9fd9ea","center");
  txt(r[1],VW/2+62,ry+1,7,"#c3cad6","center");
  ry+=17;
 }
 const story=["지하 B1에서 옥상 RF까지 아홉 개의 층.","층의 사원증을 찾아 엘리베이터를 열고,","옥상의 CEO에게 사표를 직접 전하세요."];
 let sy=204;
 for(const s of story){txt(s,VW/2,sy,8,"#7f8899","center");sy+=11;}
 if(cleared)txt("CLEAR 배지 — HARD MODE 해방",VW/2,236,8,"#ffd166","center",true);
 txt("[H] HARD MODE : "+(hardMode?"ON":"OFF"),VW/2,VH-30,8,hardMode?"#ff4757":"#585d6b","center",true);
 ctx.strokeStyle="rgba(255,71,87,.4)";ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(VW/2-60,VH-20.5);ctx.lineTo(VW/2+60,VH-20.5);ctx.stroke();
 txt("모티브: 영화 <회사원> (2012) - Fan Game",VW/2,VH-8,7,"#585d6b","center");
 ctx.strokeStyle="rgba(160,190,230,.20)";ctx.lineWidth=1;
 ctx.beginPath();
 for(let i=0;i<70;i++){
  const rx=(i*97+tGlobal*(70+(i%3)*25))%(VW+60)-30;
  const ryy=(i*53+tGlobal*(260+(i%4)*50))%(VH+30)-15;
  ctx.moveTo(rx,ryy);ctx.lineTo(rx-2,ryy+7);
 }
 ctx.stroke();
}
function drawOver(){
 ctx.fillStyle="rgba(10,4,7,.93)";ctx.fillRect(0,0,VW,VH);
 ctx.fillStyle="#2a0d12";
 roundRect(ctx,VW/2-92,74,184,44,5);ctx.fill();
 ctx.strokeStyle="rgba(255,71,87,.55)";
 roundRect(ctx,VW/2-91.5,74.5,183,43,5);ctx.stroke();
 txt("계약 해지",VW/2,105,27,"#ff4757","center",true);
 txt("사원증이 회수되었습니다.",VW/2,138,9,"#c3cad6","center");
 pill(VW/2-104,152,208,16,null);
 txt(FLOORS[floorIdx].name+" 도달 · KILL "+kills+" · 사망 "+deaths,VW/2,163,8,"#8b91a0","center");
 if(Math.sin(tGlobal*5)>-.2)txt("[ R ] 재도전 또는 클릭",VW/2,196,10,"#ffd166","center",true);
}
function drawWin(){
 const g=ctx.createLinearGradient(0,0,0,VH);
 g.addColorStop(0,"rgba(16,13,6,.95)");g.addColorStop(1,"rgba(24,18,8,.97)");
 ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
 ctx.fillStyle="#8c6a1f";
 roundRect(ctx,VW/2-96,62,192,42,5);ctx.fill();
 ctx.strokeStyle="rgba(255,209,102,.7)";
 roundRect(ctx,VW/2-95.5,62.5,191,41,5);ctx.stroke();
 txt("퇴사 완료",VW/2,91,26,"#ffd166","center",true);
 const shx=((tGlobal*60)%220)-40;
 const sg=ctx.createLinearGradient(shx-20,0,shx+20,0);
 sg.addColorStop(0,"rgba(255,209,102,0)");sg.addColorStop(.5,"rgba(255,236,180,.8)");sg.addColorStop(1,"rgba(255,209,102,0)");
 ctx.fillStyle=sg;ctx.fillRect(VW/2-100,106,200,2);
 txt("강만재 CEO는 정리해고 되었습니다.",VW/2,124,9,"#c3cad6","center");
 pill(VW/2-116,138,232,16,null);
 txt("KILL "+kills+" · DEATH "+deaths+" · "+fmtTime(playTime),VW/2,149,8,"#f5f6fa","center");
 pill(VW/2-116,158,232,14,null);
 txt("N-13 서류 "+Math.min(docsRun,5)+"/5"+(hardMode?" · HARD MODE":""),VW/2,168,7,"#d9c2ff","center");
 const rk=rankCalc();
 const rc={S:"#ffd166",A:"#4dd7fe",B:"#f5f6fa",C:"#8b91a0"}[rk];
 txt("RANK",VW/2,184,7,"#585d6b","center");
 ctx.font="bold 30px monospace";
 ctx.fillStyle=rc;ctx.textAlign="center";
 ctx.fillText(rk,VW/2,212);ctx.textAlign="left";
 const cred=[["김도혁","자유"],["베넷 컴퍼니","폐업"],["당신","퇴근"]];
 let y=226;
 for(const c of cred){
  pill(VW/2-70,y-9,140,13,"#ffd166");
  txt(c[0]+" — "+c[1],VW/2,y+1,8,"#e8cf8a","center");
  y+=14;
 }
 if(Math.sin(tGlobal*5)>-.2)txt("[ R ] 처음부터 또는 클릭",VW/2,VH-12,9,"#ffd166","center",true);
}
function rankCalc(){
 let sc=10000-Math.floor(playTime)*8-deaths*800+kills*15+Math.min(docsRun,5)*400;
 if(hardMode)sc+=1500;
 return sc>=9500?"S":sc>=7500?"A":sc>=5500?"B":"C";
}
function drawPause(){
 ctx.fillStyle="rgba(4,6,10,.66)";ctx.fillRect(0,0,VW,VH);
 txt("PAUSED",VW/2,104,20,"#f5f6fa","center",true);
 ctx.strokeStyle="rgba(255,209,102,.4)";
 ctx.beginPath();ctx.moveTo(VW/2-40,114.5);ctx.lineTo(VW/2+40,114.5);ctx.stroke();
 const ls=[["ESC","계속하기"],["Q","무기 교체"],["SPACE","구르기 (무적)"],["E","상호작용"],["M","음소거"]];
 let y=136;
 for(const l of ls){
  pill(VW/2-86,y-9,168,14,null);
  txt(l[0],VW/2-74,y+1,8,"#ffd166",null,true);
  txt(l[1],VW/2+40,y+1,8,"#9aa3b2","center");
  y+=19;
 }
}

function render(){
 ctx.setTransform(RS,0,0,RS,0,0);
 ctx.fillStyle="#000";ctx.fillRect(0,0,VW,VH);
 if(state==="title"){drawTitle();return;}
 if(player&&floorCv)drawWorld();
 if(player&&floorCtx){
  renderLights();
  ctx.save();ctx.imageSmoothingEnabled=true;
  ctx.drawImage(lightCv,0,0,VW,VH);
  ctx.restore();
  if(alarmActive){
   ctx.fillStyle="rgba(255,40,40,"+(0.05+0.05*Math.sin(tGlobal*7))+")";
   ctx.fillRect(0,0,VW,VH);
  }
  if(vigCv){ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(vigCv,0,0,VW,VH);ctx.restore();}
  if(scanPat&&crtOn){ctx.fillStyle=scanPat;ctx.fillRect(0,0,VW,VH);}
  if(player.flashRed>0){
   ctx.fillStyle="rgba(200,30,30,"+player.flashRed*.8+")";
   ctx.fillRect(0,0,VW,VH);
  }
  drawHUD();
  if(state==="play"&&!paused)drawCrosshair();
 }
 if(paused&&state==="play")drawPause();
 if(state==="settings")drawSettings();
 if(state==="perk"&&perkPick)drawPerkPick();
 if(state==="dialog"&&dlg)drawDialog();
 if(state==="over")drawOver();
 if(state==="win")drawWin();
 if(whiteFlash>0){
  ctx.fillStyle="rgba(255,255,255,"+Math.min(.4,whiteFlash*3)+")";
  ctx.fillRect(0,0,VW,VH);
 }
 if(transT>=0){
  const tt=transT,c=tt<1?tt:Math.max(0,2-tt);
  const e2=c*c*(3-2*c);
  const off=e2*(VW/2+12);
  for(const side of[0,1]){
   const x0=side?VW-off:0;
   ctx.fillStyle="#242a36";ctx.fillRect(x0,0,off,VH);
   ctx.fillStyle="rgba(255,255,255,.04)";
   for(let yy=6;yy<VH;yy+=18)ctx.fillRect(x0+4,yy,Math.max(0,off-8),1);
   ctx.fillStyle="#151922";ctx.fillRect(side?VW-off:off-4,0,4,VH);
   for(let yy=0;yy<VH;yy+=12){
    ctx.fillStyle=(yy/12)%2?"#ffd166":"#151922";
    ctx.fillRect(side?VW-off-10:off+4,yy,6,12);
   }
  }
  ctx.fillStyle="rgba(5,7,12,"+(.35*e2)+")";ctx.fillRect(0,0,VW,VH);
  if(transLabel&&tt>.92&&tt<1.14){
   ctx.fillStyle="#10141c";ctx.fillRect(VW/2-90,VH/2-26,180,44);
   ctx.strokeStyle="#ffd166";ctx.strokeRect(VW/2-89.5,VH/2-25.5,179,43);
   txt(transLabel,VW/2,VH/2+2,13,"#ffd166","center",true);
   txt("UP",VW/2,VH/2+14,7,"#8b91a0","center");
  }
 }
}

window.__hook={
 load:function(i){parseFloor(i);state="play";},
 begin:function(i,r){beginFloor(i,r);},
 st:function(){return state;},
 setState:function(s){state=s;},
 pl:function(){return player;},
 en:function(){return enemies;},
 boss:function(){return bossRef;},
 adv:function(){dlgNext=true;},
 key:function(c,v){keys[c]=v;},
 md:function(v){mouse.down=v;},
 mm:function(x,y){mouse.x=x;mouse.y=y;},
  hurt:hurtPlayer,
  start:startRun,
  retry:retryFloor,
  stat:function(k,v){stats[k]=(v===undefined)?999:v;},
  skill:function(i){trySkill(i);},
  skState:function(){return skillState;},
  epi:function(v){epiT=v;},
  docs:function(n){docsRun=n;},
  hard:function(v){hardMode=v;},
  key_:function(v){hasKey=v;},
  click_:function(){tryPickByMouse();},
  exit_:function(){gotoNextFloor();},
  perks:function(){return perks.slice();},
  wlv:function(w){return wlv(w);},
  setOpt_:setOpt,
  opt:function(k,v){OPT[k]=v;setOpt();},
  give:function(sub){
   wpn[sub]=true;curWpn=sub;
   if(ammo[sub]!==undefined)ammo[sub]=99;
   if(player){player.pressure=100;player.pend=[];}
  },
 bossOn:function(){bossActive=true;if(bossRef)bossRef.alert=true;setMusic("boss");},
 pump:function(n){for(let i=0;i<n;i++)frame(0.016);}
};

bindInput();
window.addEventListener("resize",resize);
resize();
cv.style.cursor="none";
buildFX();
cleared=sget("nr_cleared")==="1";
hardMode=sget("nr_hard")==="1";
loadMeta();
loadOpts();
setOpt();
requestAnimationFrame(loop);
