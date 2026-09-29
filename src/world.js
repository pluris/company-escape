function drawSurface(g,th,t){
 // each theme gets a believable floor material instead of a flat checker
 if(th==="parking"){
  g.fillStyle=t.f1;g.fillRect(0,0,VW,VH);
  for(let y=0;y<VH;y+=3){
   g.fillStyle=(y/3)%2?"rgba(255,255,255,.012)":"rgba(0,0,0,.03)";
   g.fillRect(0,y,VW,1);
  }
  g.fillStyle="rgba(0,0,0,.16)";
  for(let i=0;i<20;i++){g.beginPath();g.ellipse(srnd()*VW,srnd()*VH,4+srnd()*10,2+srnd()*5,srnd()*3,0,7);g.fill();}
 }else if(th==="office"||th==="top"||th==="exec"){
  // carpet tiles with directional weave + seam grid
  g.fillStyle=t.f1;g.fillRect(0,0,VW,VH);
  for(let ty=0;ty<MH;ty++)for(let tx=0;tx<MW;tx++){
   if((tx+ty)%2){
    g.fillStyle=t.f2;g.fillRect(tx*TS,ty*TS,TS,TS);
   }
  }
  g.strokeStyle="rgba(0,0,0,.14)";g.lineWidth=1;
  for(let x=0;x<=VW;x+=TS){g.beginPath();g.moveTo(x+.5,0);g.lineTo(x+.5,VH);g.stroke();}
  for(let y=0;y<=VH;y+=TS){g.beginPath();g.moveTo(0,y+.5);g.lineTo(VW,y+.5);g.stroke();}
  g.fillStyle="rgba(255,255,255,.022)";
  for(let y=2;y<VH;y+=4)g.fillRect(0,y,VW,1);
 }else if(th==="lobby"){
  // polished marble with veining
  g.fillStyle=t.f1;g.fillRect(0,0,VW,VH);
  g.strokeStyle="rgba(0,0,0,.20)";g.lineWidth=1;
  for(let x=0;x<=VW;x+=64){g.beginPath();g.moveTo(x+.5,0);g.lineTo(x+.5,VH);g.stroke();}
  for(let y=0;y<=VH;y+=64){g.beginPath();g.moveTo(0,y+.5);g.lineTo(VW,y+.5);g.stroke();}
  for(let i=0;i<26;i++){
   g.strokeStyle="rgba(255,255,255,.05)";g.lineWidth=1;
   g.beginPath();
   let vx=srnd()*VW,vy=srnd()*VH;
   g.moveTo(vx,vy);
   for(let s=0;s<4;s++){vx+=(srnd()-.5)*60;vy+=(srnd()-.5)*40;g.lineTo(vx,vy);}
   g.stroke();
  }
  g.fillStyle="rgba(160,40,48,.30)";
  g.fillRect(206,0,68,VH);
  g.fillStyle="rgba(255,209,102,.10)";
  g.fillRect(206,0,2,VH);g.fillRect(272,0,2,VH);
 }else if(th==="rnd"){
  // lab floor: epoxy with grid seams and drain channels
  g.fillStyle=t.f1;g.fillRect(0,0,VW,VH);
  g.strokeStyle="rgba(67,232,160,.10)";g.lineWidth=1;
  for(let x=0;x<=VW;x+=TS*2){g.beginPath();g.moveTo(x+.5,0);g.lineTo(x+.5,VH);g.stroke();}
  for(let y=0;y<=VH;y+=TS*2){g.beginPath();g.moveTo(0,y+.5);g.lineTo(VW,y+.5);g.stroke();}
  g.fillStyle="rgba(0,0,0,.22)";
  for(let x=8;x<VW;x+=TS*4)g.fillRect(x,VH-14,TS*2,8);
  g.fillStyle="rgba(67,232,160,.06)";g.fillRect(0,VH-12,VW,4);
 }else if(th==="sec"){
  // dark server-room floor with cable runs
  g.fillStyle=t.f1;g.fillRect(0,0,VW,VH);
  g.fillStyle="rgba(255,71,87,.05)";
  for(let i=0;i<7;i++)g.fillRect(0,20+i*38,VW,2);
  g.fillStyle="rgba(0,0,0,.25)";
  for(let y=0;y<VH;y+=TS){g.fillRect(0,y,VW,1);}
 }else if(th==="roof"){
  g.fillStyle=t.f1;g.fillRect(0,0,VW,VH);
  g.fillStyle="rgba(0,0,0,.18)";
  for(let x=0;x<VW;x+=TS*3)g.fillRect(x,0,2,VH);
  for(let y=0;y<VH;y+=TS*3)g.fillRect(0,y,VW,2);
  g.fillStyle="rgba(255,255,255,.02)";
  for(let i=0;i<30;i++)g.fillRect(srnd()*VW,srnd()*VH,3+srnd()*8,1);
 }else{
  g.fillStyle=t.f1;g.fillRect(0,0,VW,VH);
  for(let ty=0;ty<MH;ty++)for(let tx=0;tx<MW;tx++)
   if((tx+ty)%2){g.fillStyle=t.f2;g.fillRect(tx*TS,ty*TS,TS,TS);}
 }
}

function prerenderFloor(th,map){
 floorCv=document.createElement("canvas");floorCv.width=VW;floorCv.height=VH;
 floorCtx=floorCv.getContext("2d");
 seedV=999+floorIdx*77;
 const t=THEMES[th];
 drawSurface(floorCtx,th,t);
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  const px=x*TS,py=y*TS;
  if(srnd()<.16){floorCtx.fillStyle="rgba(255,255,255,.035)";floorCtx.fillRect(px+Math.floor(srnd()*14),py+Math.floor(srnd()*14),2,1);}
  if(srnd()<.10){floorCtx.fillStyle="rgba(0,0,0,.06)";floorCtx.fillRect(px+Math.floor(srnd()*14),py+Math.floor(srnd()*14),1,2);}
 }
 if(th==="parking"){
  floorCtx.strokeStyle="#c8c8cc";floorCtx.lineWidth=1;
  for(let i=0;i<6;i++){const yy=30+i*40;floorCtx.beginPath();floorCtx.moveTo(0,yy);floorCtx.lineTo(VW,yy);floorCtx.stroke();}
  floorCtx.fillStyle="#caa53a";
  for(let i=0;i<14;i++)floorCtx.fillRect(10+srnd()*450,10+srnd()*250,2,6);
 }else if(th==="roof"){
  floorCtx.strokeStyle="#e8c93a";floorCtx.lineWidth=3;
  floorCtx.beginPath();floorCtx.arc(VW/2,80,52,0,7);floorCtx.stroke();
  floorCtx.font="bold 40px monospace";floorCtx.fillStyle="#e8c93a";
  floorCtx.textAlign="center";floorCtx.fillText("H",VW/2,94);floorCtx.textAlign="left";
 }else if(th==="lobby"){
  floorCtx.fillStyle="rgba(160,40,48,.35)";floorCtx.fillRect(200,0,80,VH);
 }else if(th==="rnd"){
  floorCtx.strokeStyle="rgba(90,180,150,.15)";
  for(let x=0;x<=MW;x+=3){floorCtx.beginPath();floorCtx.moveTo(x*TS,0);floorCtx.lineTo(x*TS,VH);floorCtx.stroke();}
  for(let y=0;y<=MH;y+=3){floorCtx.beginPath();floorCtx.moveTo(0,y*TS);floorCtx.lineTo(VW,y*TS);floorCtx.stroke();}
 }else if(th==="exec"){
  floorCtx.fillStyle="rgba(244,197,66,.12)";
  for(let x=0;x<MW;x++)if(x%5===0)floorCtx.fillRect(x*TS,0,2,VH);
 }
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  const ch=map[y][x],px=x*TS,py=y*TS;
  if(ch==="#"){
   // wall block: darker base, lit cap, deep bottom edge
   const openBelow=map[y+1]&&map[y+1][x]!=="#";
   floorCtx.fillStyle=t.w;floorCtx.fillRect(px,py,TS,TS);
   floorCtx.fillStyle=t.wt;floorCtx.fillRect(px,py,TS,3);
   floorCtx.fillStyle="rgba(255,255,255,.05)";floorCtx.fillRect(px,py+3,TS,1);
   if(openBelow){
    floorCtx.fillStyle="rgba(0,0,0,.30)";floorCtx.fillRect(px,py+TS-3,TS,3);
   }else{
    floorCtx.fillStyle="rgba(0,0,0,.16)";floorCtx.fillRect(px,py+TS-2,TS,2);
   }
  }
 }
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  if(map[y][x]!=="C")continue;
  let w=1,h=1;
  while(x+w<MW&&map[y][x+w]==="C")w++;
  outer:while(y+h<MH){for(let k=0;k<w;k++)if(map[y+h][x+k]!=="C")break outer;h++;}
  drawCover(floorCtx,x*TS,y*TS,w*TS,h*TS,t.cov);
 }
 for(let y=1;y<MH;y++)for(let x=0;x<MW;x++){
  if(map[y][x]==="#"||map[y-1][x]!=="#")continue;
  const px=x*TS,py=y*TS;
  const gr=floorCtx.createLinearGradient(0,py,0,py+7);
  gr.addColorStop(0,"rgba(0,0,0,.34)");gr.addColorStop(1,"rgba(0,0,0,0)");
  floorCtx.fillStyle=gr;floorCtx.fillRect(px,py,TS,7);
 }
 decorate(floorCtx,th,map);
}
function decorate(g,th,map){
 seedV=(floorIdx+3)*333;
 if(th==="parking"){
  g.fillStyle="rgba(0,0,0,.22)";
  for(let i=0;i<5;i++){g.beginPath();g.ellipse(30+srnd()*420,40+srnd()*200,6+srnd()*8,3+srnd()*4,srnd()*3,0,7);g.fill();}
  g.strokeStyle="#caa53a";g.lineWidth=2;
  for(let i=0;i<5;i++){const x0=20+i*90,y0=52;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0,y0+26);g.stroke();}
 }else if(th==="lobby"){
  g.strokeStyle="rgba(255,255,255,.05)";g.lineWidth=1;
  for(let i=0;i<6;i++){
   g.beginPath();g.moveTo(srnd()*VW,0);
   g.bezierCurveTo(srnd()*VW,VH*.3,srnd()*VW,VH*.6,srnd()*VW,VH);
   g.stroke();
  }
  g.fillStyle="rgba(255,89,100,.10)";
  g.fillRect(196,16,88,4);g.fillRect(196,VH-24,88,4);
 }else if(th==="rnd"){
  g.fillStyle="rgba(67,232,160,.10)";
  g.font="bold 6px monospace";
  g.fillText("R&D LAB-04",10,12);g.fillText("SPECIMEN",VW-58,VH-8);
  g.strokeStyle="rgba(255,209,102,.25)";
  for(let i=0;i<4;i++){const yy=60+i*50;for(let xx=0;xx<VW;xx+=12){g.fillStyle=(xx/12)%2?"rgba(255,209,102,.18)":"rgba(0,0,0,.25)";g.fillRect(xx,yy,6,3);}}
 }else if(th==="sec"){
  g.font="bold 6px monospace";
  for(let i=0;i<4;i++){
   g.fillStyle="rgba(255,71,87,.28)";
   g.fillText("SEC-0"+(i+1)+" :: LOCKED",24+i*70,14+(i%2)*(VH-24));
  }
 }else if(th==="exec"){
  g.strokeStyle="rgba(184,135,255,.16)";g.lineWidth=1;
  g.strokeRect(10.5,10.5,VW-21,VH-21);
  g.strokeStyle="rgba(255,209,102,.12)";
  g.strokeRect(14.5,14.5,VW-29,VH-29);
 }else if(th==="roof"){
  g.fillStyle="#3a3f48";
  const units=[[30,VH-46],[VW-58,VH-46],[30,26]];
  for(const u of units){
   g.fillRect(u[0],u[1],26,18);
   g.fillStyle="#22252c";g.beginPath();g.arc(u[0]+13,u[1]+9,6,0,7);g.fill();
   g.strokeStyle="#565d68";g.strokeRect(u[0]+.5,u[1]+.5,25,17);
   g.fillStyle="#3a3f48";
  }
  g.fillStyle="rgba(255,209,102,.08)";g.fillRect(VW/2-56,26,112,108);
 }else if(th==="top"){
  g.strokeStyle="rgba(224,164,88,.14)";g.lineWidth=1;
  for(let i=0;i<3;i++){g.strokeRect(20+i*150+.5,20+.5,110,VH-41);}
 }
}
function drawCover(g,px,py,w,h,style){
 if(style==="car"){
  const hue=["#7a3030","#30557a","#3a6e3f","#6e6230"][Math.floor(srnd()*4)];
  g.fillStyle=hue;roundRect(g,px+1,py+4,w-2,h-8,5);g.fill();
  g.fillStyle="#1a2530";roundRect(g,px+6,py+7,w-14,h-14,3);g.fill();
  g.fillStyle="#57c8e8";g.fillRect(px+8,py+9,(w-20)/2,h-18);
  g.fillStyle="rgba(255,255,255,.15)";g.fillRect(px+1,py+4,w-2,3);
 }else if(style==="cube"){
  g.fillStyle="#3d6a72";g.fillRect(px,py,w,h-4);
  g.fillStyle="#2c4d53";g.fillRect(px,py+h-8,w,4);
  g.fillStyle="rgba(255,255,255,.08)";g.fillRect(px,py,w,2);
  g.fillStyle="#57c8e8";g.fillRect(px+3,py+4,4,3);
  g.fillStyle="#8b91a0";g.fillRect(px,py+h-6,w,2);
 }else if(style==="desk"){
  g.fillStyle="#5c5046";g.fillRect(px,py+2,w,6);
  g.fillStyle="#3e362e";g.fillRect(px+1,py+8,w-2,h-10);
  g.fillStyle="#786a5c";g.fillRect(px,py+2,w,2);
 }else if(style==="mach"){
  g.fillStyle="#22332f";g.fillRect(px,py,w,h);
  g.fillStyle="#182420";g.fillRect(px+2,py+2,w-4,h-4);
  g.fillStyle="#3aa66a";g.fillRect(px+3,py+3,3,3);
  g.fillStyle="#d93a3a";g.fillRect(px+w-6,py+3,3,3);
 }else{
  g.fillStyle="#6b5638";g.fillRect(px+1,py+1,w-2,h-2);
  g.fillStyle="#57452c";g.fillRect(px+1,py+1,w-2,3);g.fillRect(px+1,py+h-4,w-2,3);
  g.strokeStyle="#3e3220";g.lineWidth=1;
  g.beginPath();g.moveTo(px+2,py+2);g.lineTo(px+w-2,py+h-2);
  g.moveTo(px+w-2,py+2);g.lineTo(px+2,py+h-2);g.stroke();
 }
}
function roundRect(g,x,y,w,h,r){
 g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);
 g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
}

function tileAt(tx,ty){
 if(tx<0||ty<0||tx>=MW||ty>=MH)return 1;
 return grid[ty*MW+tx];
}
function solidForMove(tx,ty,flying){
 const t=tileAt(tx,ty);
 if(t===1||t===4)return true;
 if(flying)return false;
 return t===2||t===3;
}
function circleHitsSolid(x,y,r,flying){
 const off=[[-r*.7,-r*.7],[r*.7,-r*.7],[-r*.7,r*.7],[r*.7,r*.7],[r,0],[-r,0],[0,r],[0,-r]];
 for(const o of off){
  if(solidForMove(Math.floor((x+o[0])/TS),Math.floor((y+o[1])/TS),flying))return true;
 }
 return false;
}
function moveEnt(e,dx,dy,flying){
 if(dx!==0){const nx=e.x+dx;if(!circleHitsSolid(nx,e.y,e.r,flying))e.x=nx;}
 if(dy!==0){const ny=e.y+dy;if(!circleHitsSolid(e.x,ny,e.r,flying))e.y=ny;}
 e.x=Math.max(8,Math.min(VW-8,e.x));
 e.y=Math.max(10,Math.min(VH-6,e.y));
}
function los(x0,y0,x1,y1){
 const d=Math.hypot(x1-x0,y1-y0),steps=Math.ceil(d/6);
 for(let i=1;i<steps;i++){
  const tt=i/steps,tx=Math.floor((x0+(x1-x0)*tt)/TS),ty=Math.floor((y0+(y1-y0)*tt)/TS);
  const t=tileAt(tx,ty);
  if(t===1||t===4)return false;
 }
 return true;
}
function rayEnd(x0,y0,ang,max){
 const cx=Math.cos(ang),cy=Math.sin(ang);
 for(let d=4;d<max;d+=4){
  const tx=Math.floor((x0+cx*d)/TS),ty=Math.floor((y0+cy*d)/TS);
  if(tileAt(tx,ty)>=1)return{x:x0+cx*d,y:y0+cy*d};
 }
 return{x:x0+cx*max,y:y0+cy*max};
}
