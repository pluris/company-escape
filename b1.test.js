const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('b1.html','utf8');
const src=html.match(/<script>([\s\S]*?)<\/script>/)[1];

const ctxStub=new Proxy({},{get:(t,k)=>
  k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
const cv={width:0,height:0,style:{},getContext:()=>ctxStub,
  addEventListener:()=>{},getBoundingClientRect:()=>({left:0,top:0,width:480,height:280})};
const L={};
const sb={document:{getElementById:id=>id==='cv'?cv:{textContent:""}},
  addEventListener:(t,f)=>{(L[t]=L[t]||[]).push(f)},
  requestAnimationFrame:()=>0,performance:{now:()=>0},console,
  Math,Object,Array,Uint8Array,JSON,Set,Map,String,Number,Boolean};
sb.window=sb;sb.globalThis=sb;
vm.createContext(sb);
try{vm.runInContext(src,sb,{filename:'b1.html'});}catch(e){
  console.log('FAIL  load  '+e.message);process.exit(1);}
const B=sb.__b1,P=B.pl,E=B.bl,ST=B.step,SN=B.stepN;
const key=(c,d)=>L[d?'keydown':'keyup'][0]({code:c,preventDefault(){}});
const keys=()=>['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']
  .forEach(c=>key(c,false));
let ok=0,bad=0;
const T=(n,c,x)=>{c?(ok++,console.log('PASS  '+n+(x?'   '+x:'')))
                 :(bad++,console.log('FAIL  '+n+(x?'   '+x:'')));};

console.log('=== MAP INTEGRITY ===');
const w=B.MW,h=B.MH;
T('row count == MH',B.MAP.length===h,B.MAP.length+'/'+h);
const rw=B.MAP.map((r,i)=>[i,r.length]).filter(([i,l])=>l!==w);
T('all rows == MW ('+w+')',rw.length===0,
  rw.length?('bad rows '+rw.map(([i,l])=>i+':'+l).join(' ')):'ok');
T('border sealed',B.MAP[0]===B.MAP[0].replace(/[^#]/g,'#')&&
  B.MAP[h-1]===B.MAP[h-1].replace(/[^#]/g,'#'));
T('spawn tile is open',B.solid(11,7)!==1);

console.log('\n=== SPAWN ===');
const en0=E();
const cnt=k=>en0.filter(e=>e.k===k).length;
T('sniper present',cnt('sniper')>0,'x'+cnt('sniper'));
T('breaker present',cnt('breaker')>0,'x'+cnt('breaker'));
T('flanker present',cnt('flanker')>0,'x'+cnt('flanker'));
T('chasers present',cnt('chaser')>0,'x'+cnt('chaser'));
// floor connectivity. Cover is destructible, so it must NOT be treated as a
// wall here -- but no *floor* tile may depend on breaking cover to reach.
T('every floor tile reachable without breaking cover',(()=>{
  B.reset();const p=P(),TS=B.TS;
  const st=[Math.floor(p.x/TS)+','+Math.floor(p.y/TS)],seen=new Set(st);
  while(st.length){const[a,c]=st.pop().split(',').map(Number);
    for(const[da,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const na=a+da,nc=c+dc,k=na+','+nc;
      if(na<0||nc<0||na>=w||nc>=h||seen.has(k))continue;
      if(B.solid(na,nc)===1||B.solid(na,nc)===2)continue;   // walls + pillars only
      seen.add(k);st.push(k);}}
  const missed=[];
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const v=B.solid(x,y);
    if(v===1||v===2)continue;                                // wall/pillar
    if(!seen.has(x+','+y))missed.push(x+','+y+'('+['.','c'][v]+')');
  }
  return missed.length===0||(T('  offenders',false,missed.join(' ')),false);
})(),'no floor pocket needs a pickaxe');

console.log('\n=== CLAIM 1: standing still must be punished ===');
B.reset();const p=P();p.hp=p.maxhp=6;p.inv=0;p.roll=0;
keys();E().forEach(e=>{e.alert=true;});
const hp0=p.hp;ST(60*15);
T('camping costs HP',p.hp<hp0,'hp '+hp0+' -> '+p.hp+' in 15s of doing nothing');

console.log('\n=== CLAIM 2: cover is a real sight blocker ===');
B.reset();
T('LOS blocked across the map by walls',!B.los(11*20+10,1*20+10,20*20+10,20*20+10));
T('LOS clear across open floor',B.los(2*20+10,8*20+10,20*20+10,8*20+10));

console.log('\n=== CLAIM 3: cover is destructible, not permanent ===');
B.reset();
const before=B.stats().coverLeft;
T('map ships destructible cover',before>0,before+' tiles');
for(let k=0;k<3;k++){
  let done=false;
  for(let y=1;y<h-1&&!done;y++)for(let x=1;x<w-1&&!done;x++)
    if(B.solid(x,y)===3){B.damageCover(x,y);done=true;}
}
T('3 hits destroy one cover tile',B.stats().coverLeft===before-1,
  before+' -> '+B.stats().coverLeft);

console.log('\n=== CLAIM 4: fixed timestep is frame-rate independent ===');
function run(stepCount,dt){
  B.reset();const q=P();q.hp=q.maxhp=99;q.inv=99;q.roll=99;
  key('KeyD',true);SN(stepCount,dt);key('KeyD',false);
  return q.x;
}
const a=run(60,1/60),b=run(600,1/600),c=run(120,1/120);
T('1.0s walk identical @60/120/600Hz',
  Math.abs(a-b)<0.5&&Math.abs(a-c)<0.5,
  [a,b,c].map(v=>v.toFixed(2)).join(' / ')+'  (old engine drifted 42.5px)');
T('and it actually moved',a>30,a.toFixed(1)+'px');

console.log('\n=== CLAIM 5: input buffer ===');
B.reset();const q=P();q.rollCd=0;q.roll=0;
key('Space',true);key('Space',false);ST(1);
T('buffered roll fires on the step it was pressed',q.rollCd>0,'cd='+q.rollCd.toFixed(2));
T('roll grants i-frames',q.inv>0,'inv='+q.inv.toFixed(2));

console.log('\n=== STABILITY ===');
B.reset();const s=P();s.hp=s.maxhp=99;s.inv=999;
let err=null;try{ST(60*120);}catch(e){err=e.message;}
T('120s unattended, no crash',!err,err||'ok');
T('no NaN positions',E().every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y))&&
  Number.isFinite(P().x)&&Number.isFinite(P().y));
T('entity count bounded',E().length<400,E().length+' entities');

console.log('\n'+(bad?'FAILED':'ALL PASS')+'   '+ok+' passed, '+bad+' failed');
process.exit(bad?1:0);
