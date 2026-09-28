let AC=null,master=null,muted=false,nbuf=null;
function initAudio(){
 if(AC)return;
 try{
  AC=new (window.AudioContext||window.webkitAudioContext)();
  master=AC.createGain();master.gain.value=.5;master.connect(AC.destination);
  const conv=AC.createConvolver();
  const len=Math.floor(AC.sampleRate*.7);
  const ir=AC.createBuffer(2,len,AC.sampleRate);
  for(let c=0;c<2;c++){
   const d=ir.getChannelData(c);
   for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);
  }
  conv.buffer=ir;
  revIn=AC.createGain();revIn.gain.value=.18;
  revIn.connect(conv);conv.connect(master);
  if(state==="title")setMusic("title");
 }catch(e){AC=null;}
}
function getNoise(){
 if(!nbuf){
  nbuf=AC.createBuffer(1,AC.sampleRate/2|0,AC.sampleRate);
  const d=nbuf.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 }
 return nbuf;
}
function env(g,t,a,d,v){
 g.gain.setValueAtTime(0.0001,t);
 g.gain.linearRampToValueAtTime(v,t+a);
 g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);
}
function osc(type,f0,f1,dur,vol,delay){
 if(!AC||muted)return;
 delay=delay||0;
 const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();
 o.type=type;o.frequency.setValueAtTime(Math.max(1,f0),t);
 if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
 env(g,t,.005,dur,vol);
 o.connect(g);g.connect(master);if(revIn)g.connect(revIn);
 o.start(t);o.stop(t+dur+.05);
}
function noiseHit(dur,vol,fq,q,delay,type){
 if(!AC||muted)return;
 delay=delay||0;q=q||1;
 const t=AC.currentTime+delay,s=AC.createBufferSource();
 s.buffer=getNoise();s.loop=true;
 const f=AC.createBiquadFilter();f.type=type||"bandpass";f.frequency.value=fq;f.Q.value=q;
 const g=AC.createGain();env(g,t,.003,dur,vol);
 s.connect(f);f.connect(g);g.connect(master);if(revIn)g.connect(revIn);
 s.start(t);s.stop(t+dur+.05);
}
function sfx(n){
 if(!AC||muted)return;
 switch(n){
 case"shoot":osc("square",520,140,.09,.14);noiseHit(.05,.09,2500);break;
 case"smg":osc("square",480,160,.06,.1);noiseHit(.04,.07,2600);break;
 case"shotgun":noiseHit(.28,.32,900,.7);osc("square",180,50,.18,.18);break;
 case"card":osc("triangle",900,1500,.07,.11);break;
 case"swing":noiseHit(.12,.16,700,2);break;
 case"reflect":osc("square",1200,400,.08,.13);break;
 case"glass":noiseHit(.15,.2,3800,2);break;
 case"hit":noiseHit(.06,.14,1400,1.5);break;
 case"hurt":osc("sawtooth",220,80,.18,.22);noiseHit(.1,.13,800);break;
 case"die":osc("sawtooth",300,60,.25,.17);noiseHit(.15,.1,600);break;
 case"boom":noiseHit(.5,.4,300,.5);osc("sine",110,30,.4,.32);break;
 case"pick":osc("square",660,0,.06,.11);osc("square",990,0,.08,.11,.06);break;
 case"key":osc("square",523,0,.09,.12);osc("square",659,0,.09,.12,.07);osc("square",784,0,.09,.12,.14);osc("square",1047,0,.12,.12,.21);break;
 case"elev":osc("sine",880,0,.5,.16);osc("sine",1318,0,.5,.09,.02);break;
 case"alarm":for(let i=0;i<3;i++){osc("square",760,0,.14,.13,i*.32);osc("square",520,0,.14,.13,i*.32+.16);}break;
 case"laser":osc("sawtooth",200,900,.5,.07);break;
 case"laserfire":osc("sawtooth",1000,200,.3,.17);break;
 case"dash":noiseHit(.2,.16,400,1);break;
 case"roar":osc("sawtooth",90,40,.7,.26);noiseHit(.4,.16,200);break;
 case"heal":osc("triangle",520,780,.15,.13);break;
 case"vend":noiseHit(.15,.16,300);osc("square",200,120,.12,.11);break;
 case"ui":osc("square",700,0,.05,.07);break;
 case"swap":osc("square",420,0,.05,.09);break;
 case"stap":osc("square",900,300,.05,.12);noiseHit(.03,.06,3000);break;
 case"mag":osc("sawtooth",170,40,.22,.26);noiseHit(.15,.2,700);break;
 case"spray":noiseHit(.09,.08,1100,.6);break;
 case"clack":noiseHit(.05,.13,1800,2);break;
 case"home":osc("triangle",620,940,.09,.1);break;
 case"pen":osc("sawtooth",1300,180,.2,.24);noiseHit(.12,.16,1600);break;
 case"perf":osc("triangle",1100,1700,.1,.12);break;
 case"skill":osc("square",500,900,.12,.14);osc("square",750,1350,.12,.12,.06);break;
 }
}

const mus={kind:null,next:0,step:0};
function setMusic(kind){mus.kind=kind;mus.step=0;if(AC)mus.next=AC.currentTime+.1;}

const NOTE_IDX={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nm(s){
 if(!s||s==="."||s==="-")return s==="."?null:s;
 const m=/^([A-G])(#?)(\d)$/.exec(s);
 if(!m)return null;
 return 12*(parseInt(m[3])+1)+NOTE_IDX[m[1]]+(m[2]?1:0);
}
function seq(str){return str.trim().split(/\s+/).map(nm);}
const TRACKS={
 title:{bpm:78,bt:"triangle",lt:"triangle",
  bass:seq("A1 . . . . . . . F1 . . . . . . . C2 . . . . . . . G1 . . . . . E1 ."),
  lead:seq(". . . . E4 . . . . . C4 . . . A3 . . . . . . . . B3 . . G3 . . . . ."),
  pad:["A2","F2","C3","G2"],
  drums:"................................"},
 floor:{bpm:96,bt:"square",lt:"triangle",
  bass:seq("A1 . . . A1 . E1 . G1 . . . G1 . D1 . A1 . . . A1 . E1 . G1 . . . B1 . C2 ."),
  lead:seq(". . E4 . . . D4 . . . . . C4 . . . . . A3 . . . C4 . . . . . E4 . D4 . . ."),
  pad:["A2","G2"],
  drums:"k.h.s.h.k.h.s.hh.k.h.s.h.k.hks.hh"},
 tense:{bpm:112,bt:"square",lt:"triangle",shift:12,
  bass:seq("A1 A1 . A1 . A1 E1 . G1 G1 . G1 . G1 D1 . A1 A1 . A1 . A1 E1 . G1 G1 B1 . C2 . C2 ."),
  lead:seq("A4 . . E4 . . . . G4 . . . . . D4 . A4 . . E4 . . . . G4 . . B4 . C5 . . ."),
  pad:["A2","F2"],
  drums:"k.hks.hkk.h.s.hh.k.hks.hkk.hks.hhs"},
 boss:{bpm:132,bt:"sawtooth",lt:"square",
  bass:seq("A1 A1 A2 A1 G1 G1 G2 G1 F1 F1 F2 F1 E1 E1 E2 E1 A1 A1 A2 A1 G1 G1 G2 G1 F1 F1 F2 F1 E2 E2 D2 C2"),
  lead:seq("A3 . C4 . E4 . . . G4 . . A4 . . G4 . E4 . C4 . A3 . . . . . . . . . . ."),
  pad:["A2","A2","G2","F2"],
  drums:"kh.hks.hkkhhks.hhkh.hks.hkkhhks.hs"}
};
let revIn=null;
function note(type,midi,t,dur,vol){
 const o=AC.createOscillator(),g=AC.createGain();
 o.type=type;o.frequency.value=440*Math.pow(2,(midi-69)/12);
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 o.connect(g);g.connect(master);if(revIn)g.connect(revIn);
 o.start(t);o.stop(t+dur+.02);
}
function hat(t,vol,snare){
 const s=AC.createBufferSource();s.buffer=getNoise();s.loop=true;
 const f=AC.createBiquadFilter();f.type="highpass";f.frequency.value=snare?1800:6000;
 const g=AC.createGain();
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+.06);
 s.connect(f);f.connect(g);g.connect(master);if(revIn)g.connect(revIn);
 s.start(t);s.stop(t+.1);
}
function kick(t,vol){
 const o=AC.createOscillator(),g=AC.createGain();
 o.type="sine";o.frequency.setValueAtTime(120,t);
 o.frequency.exponentialRampToValueAtTime(38,t+.12);
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+.14);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+.16);
}
function snare(t,vol){
 const s=AC.createBufferSource();s.buffer=getNoise();s.loop=true;
 const f=AC.createBiquadFilter();f.type="bandpass";f.frequency.value=1800;f.Q.value=.8;
 const g=AC.createGain();
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+.09);
 s.connect(f);f.connect(g);g.connect(master);if(revIn)g.connect(revIn);
 s.start(t);s.stop(t+.12);
 osc("triangle",190,120,.07,vol*.7,t);
}
function drumHit(d,t){
 if(d==="k")kick(t,.42);
 else if(d==="s")snare(t,.22);
 else if(d==="h")hat(t,.09,false);
 else if(d==="H")hat(t,.13,true);
}
function padChord(rootM,t,dur){
 const iv=[0,(rootM%12===9?3:4),7];
 for(const i of iv)note("triangle",rootM+i,t,dur,.038);
}
setInterval(function(){
 if(!AC||!mus.kind||muted)return;
 const T=TRACKS[mus.kind];if(!T)return;
 const sps=60/T.bpm/4;
 if(mus.next<AC.currentTime)mus.next=AC.currentTime+.05;
 while(mus.next<AC.currentTime+.28){
  const s=mus.step++;
  const b=T.bass[s%T.bass.length];
  if(b!=null)note(T.bt,b,mus.next,sps*2.6,.07);
  let l=T.lead[s%T.lead.length];
  if(l!=null){
   if(T.shift)l+=T.shift;
   note(T.lt,l,mus.next,sps*1.8,.05);
  }
  if(T.pad&&s%16===0){
   const pm=nm(T.pad[(s/16)%T.pad.length]);
   if(pm!=null)padChord(pm,mus.next,sps*15);
  }
  if(T.drums){
   const d=T.drums[s%T.drums.length];
   if(d&&d!==".")drumHit(d,mus.next);
  }
  if(mus.kind==="boss"&&bossRef&&!bossRef.dead&&bossRef.heli&&s%4===2)
   kick(mus.next,.16);
  if(player&&player.hp>0&&player.hp<player.maxhp*.3&&s%8===0){
   kick(mus.next,.3);kick(mus.next+sps*1.2,.18);
  }
  if(epiT>0&&s%16===8){
   const dly=Math.max(0,mus.next-AC.currentTime);
   osc("square",(Math.floor(mus.step/16)%2)?720:540,0,.25,.05,dly);
  }
  mus.next+=sps;
 }
},90);
function sting(kind){
 if(!AC||muted)return;
 const t=AC.currentTime+.02;
 if(kind==="win"){
  const n=[69,73,76,81];
  for(let i=0;i<n.length;i++)note("square",n[i],t+i*.11,.18,.12);
  padChord(69,t+n.length*.11,1.4);
 }else{
  const n=[57,53,50,45];
  for(let i=0;i<n.length;i++)note("sawtooth",n[i],t+i*.16,.3,.11);
  kick(t,.5);
 }
}
