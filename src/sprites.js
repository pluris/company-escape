const PAL={"0":"#0b0d13","W":"#f5f6fa","S":"#eebd9a","H":"#232028","B":"#262a36","b":"#3d4454","T":"#ff4757","N":"#33507a","n":"#4a6da8","Y":"#ffd166","G":"#37d67a","K":"#585d6b","k":"#8b91a0","O":"#e07b39","R":"#ff5964","C":"#4dd7fe","M":"#6b3fa0","F":"#ffe9a8","L":"#c3cad6","D":"#15181f"};

function bake(rows){
 let w=0;for(const r of rows)w=Math.max(w,r.length);
 const h=rows.length,c=document.createElement("canvas");
 c.width=w;c.height=h;const g=c.getContext("2d");
 for(let y=0;y<h;y++){const r=rows[y];
  for(let x=0;r&&x<r.length;x++){const ch=r[x];if(ch==="."||ch===" ")continue;
   g.fillStyle=PAL[ch]||"#ff00ff";g.fillRect(x,y,1,1);}}
 return c;
}
function whited(img){
 const c=document.createElement("canvas");c.width=img.width;c.height=img.height;
 const g=c.getContext("2d");g.drawImage(img,0,0);
 g.globalCompositeOperation="source-in";g.fillStyle="#ffffff";g.fillRect(0,0,c.width,c.height);
 return c;
}

const SPR={};
SPR.player=bake([
"...0000...",
"..0HHHH0..",
".0HHHHHH0.",
".0HSSSSH0.",
".0S0SS0S0.",
".0SSSSSS0.",
"..0SSSS0..",
".0BBBBBB0.",
"0BbBBBBbB0",
"0BbBYTYbB0",
"0BBBTYBBB0",
".0BBBBBB0.",
".0KB..BK0.",
".0KK..KK0.",
"..00..00.."]);
SPR.guard=bake([
"...NNNN...",
"..NNNNNN..",
".0nnnnnn0.",
".0NSSSSN0.",
".0S0SS0S0.",
"..0SSSS0..",
"..0NNNN0..",
".0NNNNNN0.",
"0NnNNNNnN0",
"0NNNYYNNN0",
".0NNNNNN0.",
".0DD..DD0.",
".0KK..KK0."]);
SPR.worker=bake([
"...0HH0...",
"..0HHHH0..",
".0HSSSSH0.",
".0S0SS0S0.",
"..0SSSS0..",
".0WWWWWW0.",
"0WWWTWWWW0",
"0WWWTWWWW0",
".0WWWWWW0.",
".0GG..GG0.",
".0KK..KK0."]);
SPR.mgr=bake([
"...0HH0...",
"..0KKKK0..",
".0KSSSSK0.",
".0S0SS0S0.",
"..0SSSS0..",
".0bbbbbb0.",
"0BbbTTbbB0",
"0BbbTTbbB0",
".0bbbbbb0.",
".0KK..KK0."]);
SPR.shield=bake([
"...0000...",
"..0NNNN0..",
".0NCCCCN0.",
"..0NNNN0..",
".0NNNNNN0.",
"0NnNNNNnN0",
"0NNNNNNNN0",
".0NNNNNN0.",
".0DD..DD0."]);
SPR.exec=bake([
"...0LL0...",
"..0LLLL0..",
".0LSSSSL0.",
".0S0SS0S0.",
"..0SSSS0..",
".0MMMMMM0.",
"0MMmYYmMM0",
"0MMMYYMMM0",
".0MMMMMM0.",
".0KK..KK0."]);
SPR.chief=bake([
"..YYYYYY..",
".0NNNNNN0.",
".0NSSSSN0.",
".0S0SS0S0.",
"..0SSSS0..",
".0NNNNNN0.",
"0NnNNNNnN0",
"0NNNRRNNN0",
".0NNNNNN0.",
".0DD..DD0."]);
SPR.drone=bake([
"0.0.....0.0",
"..0KKKKK0..",
".0KkRRRkK0.",
"..0KKKKK0..",
"....0Y0...."]);
SPR.printer=bake([
"0KKKKKKKKKK0",
"0KkkkkkkkkK0",
"0KWCCCCCCWK0",
"0KkkkkkkkkK0",
"0KKGKKKGGKK0",
"0KKKKKKKKKK0",
".0KK....KK0."]);
SPR.cctv=bake([
"...0KK0...",
"..0KkkK0..",
".0KCCCCK0.",
".0K0RR0K0.",
"..0KKKK0..",
"....0K0....",
"....0K0....",
"...0KKK0..."]);
SPR.ceo=bake([
"....0LLLL....",
"...0LLLLLL...",
"..0LLLLLLLL..",
"..0LSSSSSL0..",
"..0SDDDDSS0..",
"..0SSSSSSS0..",
"...0SSSSS0...",
"..0BBBBBBB0..",
".0BBbYYYbBB0.",
".0BbBYTYBbB0.",
"0BBbBYTYbBBB0",
"0BBBYYYYBBB0",
".0BBBBBBB0...",
".0BB...BB0...",
".0KK...KK0..."]);
SPR.vend=bake([
"0KKKKKKKKKK0",
"0KRRRRRRRRK0",
"0KRCWWWWCRK0",
"0KRCWWWWCRK0",
"0KRRRRRRRRK0",
"0KYYYYYYYYK0",
"0KkkkkkkkkK0",
"0KRKRRRRKRK0",
"0KkkkkkkkkK0",
"0K0KKKKKK0K0",
"0KKKKKKKKKK0"]);
SPR.key=bake([
".0YYYY0.",
"0YYRRYY0",
"0YYYYYY0",
".000000."]);
SPR.med=bake([
"WWWWW",
"WRRRW",
"WRRRW",
"WWWWW"]);
SPR.ammo=bake([
"KKKKK",
"KYYYK",
"KKKKK"]);

const FLASH={};
for(const k in SPR)FLASH[k]=whited(SPR[k]);

function hexA(h,a){
 const n=parseInt(h.slice(1),16);
 return"rgba("+(n>>16&255)+","+(n>>8&255)+","+(n&255)+","+a+")";
}
const GLOWS={};
function glow(col,r){
 const key=col+"_"+r;
 if(GLOWS[key])return GLOWS[key];
 const c=document.createElement("canvas");c.width=r*2;c.height=r*2;
 const g=c.getContext("2d");
 const gr=g.createRadialGradient(r,r,0,r,r,r);
 gr.addColorStop(0,hexA(col,.9));gr.addColorStop(.45,hexA(col,.32));gr.addColorStop(1,"rgba(0,0,0,0)");
 g.fillStyle=gr;g.fillRect(0,0,r*2,r*2);
 GLOWS[key]=c;return c;
}

let seedV=12345;
function srnd(){seedV=(seedV*1103515245+12345)&0x7fffffff;return seedV/0x7fffffff;}
