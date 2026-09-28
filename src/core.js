"use strict";
const VW=480,VH=272,TS=16,MW=30,MH=17;
const CHS=1.5;
let EID=0;
const cv=document.getElementById("cv");
cv.width=VW;cv.height=VH;
const ctx=cv.getContext("2d");
ctx.imageSmoothingEnabled=false;
let RS=1;
window.addEventListener("error",function(ev){
 try{
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle="#2a090c";ctx.fillRect(0,0,cv.width,cv.height);
  ctx.font="bold 11px monospace";ctx.fillStyle="#ff9090";
  var m="ERROR: "+(ev.message||"unknown")+"  line "+(ev.lineno||"?");
  for(var i=0;i<m.length;i+=58)ctx.fillText(m.substr(i,58),10,24+i/58*14);
  ctx.fillStyle="#caa53a";
  ctx.fillText("F12 > Console 탭에서 상세 확인 가능",10,70);
  document.title="ERR "+(ev.message||"").slice(0,50);
 }catch(e){}
});

function resize(){
  const dpr=window.devicePixelRatio||1;
  const fit=Math.min(window.innerWidth/VW,window.innerHeight/VH);
  let k=Math.floor(fit*dpr);
  if(!(k>=1))k=1;
  if(k>6)k=6;
  RS=k;
  cv.width=VW*k;cv.height=VH*k;
  cv.style.width=(cv.width/dpr)+"px";
  cv.style.height=(cv.height/dpr)+"px";
  ctx.imageSmoothingEnabled=false;
}

let state="title",tGlobal=0,floorIdx=0,kills=0,deaths=0,playTime=0;
let hasKey=false,alarmActive=false,alarmDone=false,bossActive=false,bossRef=null;
let enemies=[],bullets=[],parts=[],pickups=[],lobs=[],warns=[],toasts=[];
let exitTiles=[],vendList=[],grid=null,glassHp=null,floorCv=null,floorCtx=null;
let shake={t:0,m:0},hitStop=0,whiteFlash=0,paused=false,exiting=false,winT=0,rfIntroDone=false;
let motes=[],flashes=[],beams=[],transLabel=null,transDing=false;
let wpn={pistol:true,shotgun:false,smg:false,case:false,card:true};