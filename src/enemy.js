// radii tuned to the new larger sprites
const ESTATS={
 guard:{hp:34,r:8,spd:62,tactic:"brute"},
 worker:{hp:22,r:6,spd:84,touch:12,tactic:"brute"},
 mgr:{hp:46,r:7,spd:58,tactic:"sniper"},
 drone:{hp:26,r:7,spd:80,touch:14,fly:true,tactic:"recon"},
 printer:{hp:50,r:9,static:true,tactic:"artillery"},
 shield:{hp:70,r:8,spd:46,touch:8,tactic:"brute"},
 cctv:{hp:30,r:7,static:true,tactic:"recon"},
 chief:{hp:300,r:10,spd:70,touch:14,tactic:"brute"},
 exec:{hp:190,r:7,spd:66,tactic:"sniper"},
 intern:{hp:26,r:5,spd:96,touch:9,tactic:"brute"},
 clone:{hp:55,r:7,spd:64,tactic:"sniper"},
 ceo:{hp:950,r:12,spd:40,touch:14,boss:true,tactic:"sniper"}
};

// elite variants: one per floor, gold outline, 2.5x hp
let eliteBudget=0,eliteRate=0;
function rollElite(){
 eliteBudget=1;
 eliteRate=FLOORS[floorIdx]&&FLOORS[floorIdx].boss?0:0.22;
}
function parseFloor(i){
 const f=FLOORS[i];
 grid=new Uint8Array(MW*MH);glassHp={};
 eliteBudget=0;eliteRate=0;
 exitTiles=[];vendList=[];enemies=[];bullets=[];parts=[];pickups=[];lobs=[];warns=[];toasts=[];
 bossRef=null;bossActive=false;hasKey=false;alarmActive=false;alarmDone=false;
 exiting=false;winT=0;rfIntroDone=false;paused=false;
 epiT=-1;epiWave=0;trickleT=0;
 player={x:40,y:40,hp:100,maxhp:100,r:7,speed:100,
  roll:0,rollCd:0,rx:0,ry:0,inv:0,fireCd:0,swing:0,swingCd:0,muzzle:0,recoil:0,
  face:1,aim:0,bob:0,flashRed:0,rollFx:0,pend:[],pressure:100};
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  const ch=f.map[y][x],px=x*TS+8,py=y*TS+8;
  if(ch==="#")grid[y*MW+x]=1;
  else if(ch==="C")grid[y*MW+x]=2;
  else if(ch==="G"){grid[y*MW+x]=3;glassHp[y*MW+x]=3;}
  else if(ch==="V"){grid[y*MW+x]=4;vendList.push({x:px,y:y*TS+8,used:false});}
  else if(ch==="E")exitTiles.push({tx:x,ty:y});
  else if(ch==="P"){player.x=px;player.y=py;}
  else if(ch==="k")pickups.push({kind:"key",x:px,y:py,t:0});
  else if(ch==="h")pickups.push({kind:"med",x:px,y:py,t:Math.random()*6});
  else if(ch==="a")pickups.push({kind:"ammo",x:px,y:py,t:Math.random()*6});
  else if(ch==="A")pickups.push({kind:"wpn",sub:"shotgun",x:px,y:py,t:0});
  else if(ch==="U")pickups.push({kind:"wpn",sub:"smg",x:px,y:py,t:0});
  else if(ch==="q")pickups.push({kind:"wpn",sub:"case",x:px,y:py,t:0});
  else if(ch==="T")pickups.push({kind:"wpn",sub:"stapler",x:px,y:py,t:0});
  else if(ch==="F")pickups.push({kind:"wpn",sub:"ext",x:px,y:py,t:0});
  else if(ch==="J")pickups.push({kind:"wpn",sub:"chair",x:px,y:py,t:0});
  else if(ch==="W")pickups.push({kind:"wpn",sub:"revolver",x:px,y:py,t:0});
  else if(ch==="N")pickups.push({kind:"wpn",sub:"toner",x:px,y:py,t:0});
  else if(ch==="H")pickups.push({kind:"wpn",sub:"homing",x:px,y:py,t:0});
  else if(ch==="Y")pickups.push({kind:"wpn",sub:"pen",x:px,y:py,t:0});
  else if(ch==="D")pickups.push({kind:"doc",x:px,y:py,t:0});
  else if(ch==="g")spawnEnemy("guard",px,py);
  else if(ch==="w")spawnEnemy("worker",px,py);
  else if(ch==="i")spawnEnemy("intern",px,py);
  else if(ch==="m")spawnEnemy("mgr",px,py);
  else if(ch==="d")spawnEnemy("drone",px,py);
  else if(ch==="p")spawnEnemy("printer",px,py);
  else if(ch==="s")spawnEnemy("shield",px,py);
  else if(ch==="c")spawnEnemy("cctv",px,py);
  else if(ch==="Z")spawnEnemy("chief",px,py);
  else if(ch==="X")spawnEnemy("exec",px,py);
  else if(ch==="@"){bossRef=spawnEnemy("ceo",px,py);}
 }
  prerenderFloor(f.theme,f.map);
  rollElite();
  motes=[];
 for(let i=0;i<14;i++)motes.push({x:Math.random()*VW,y:Math.random()*VH,s:.4+Math.random()*1.1,p:Math.random()*7});
 if(!WPN_ORDER.includes(curWpn))curWpn="pistol";
}
function spawnEnemy(type,x,y){
 const S=ESTATS[type];
 const DF=DIFF();
 const e={id:++EID,type,x,y,hp:Math.round(S.hp*DF.hp),maxhp:Math.round(S.hp*DF.hp),r:S.r,
  spd:(S.spd||0)*DF.spd,touch:S.touch?Math.round(S.touch*DF.dmg):0,
  fly:!!S.fly,static:!!S.static,boss:!!S.boss,tactic:S.tactic||"brute",
  elite:false,eliteHp:1,x0:x,y0:y,
  face:1,faceAng:0,alert:false,st:"idle",stT:0,t:Math.random()*6,
  cool:1+Math.random(),burst:0,bt:0,pd:2+Math.random()*2,flash:0,contactCd:0,
  strafe:Math.random()<.5?1:-1,lock:0,fire:0,tick:0,summons:2,phase:1,
  act:null,emit:0,invuln:0,vuln:1,alpha:1,heli:false,
  tell:0,chargeAng:0,chHit:false,aimX:0,aimY:0};
 if(!S.boss&&!S.static&&eliteBudget>0&&Math.random()<eliteRate){
  e.elite=true;
  e.hp=Math.round(e.hp*2.5);e.maxhp=e.hp;
  if(e.touch)e.touch=Math.round(e.touch*1.5);
  e.spd*=1.1;
  eliteBudget--;
 }
 enemies.push(e);return e;
}