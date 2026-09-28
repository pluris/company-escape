let ammo={shotgun:0,smg:0,stapler:0,revolver:0,toner:0,homing:0,pen:0},curWpn="pistol";
let wpnLv={pistol:1,shotgun:1,smg:1,stapler:1,revolver:1,case:1,ext:1,chair:1,card:1,toner:1,homing:1,pen:1};
const WPN_ORDER=["pistol","shotgun","smg","stapler","revolver","case","ext","chair","card","toner","homing","pen"];
// lv scales dmg/rate; trait adds a passive identity per weapon
const WPN={
 pistol:{rate:.22,dmg:14,spd:310,spread:.035,pellets:1,name:"권총",trait:"기본"},
 shotgun:{rate:.75,dmg:7,spd:270,spread:.3,pellets:6,life:.34,name:"산탄총",trait:"고관력"},
 smg:{rate:.085,dmg:8,spd:300,spread:.07,pellets:1,name:"SMG",trait:"기본"},
 stapler:{rate:.5,dmg:9,name:"스테이플러",trait:"관통"},
 revolver:{rate:.62,dmg:45,spd:430,name:"황금 리볼버",trait:"처치 연쇄"},
 case:{rate:.45,dmg:26,name:"서류가방",trait:"반사"},
 ext:{rate:.055,dmg:2,spread:.55,drain:16,name:"소화기",trait:"밀침"},
 chair:{rate:.85,dmg:34,name:"회전의자",trait:"되돌아옴"},
 card:{rate:.4,dmg:10,spd:400,spread:.01,pellets:1,name:"명함",trait:"치명타"},
 toner:{rate:.95,dmg:32,name:"토너 폭탄",trait:"광역"},
 homing:{rate:.55,dmg:16,spd:150,name:"에어컨 리모컨",trait:"유도"},
 pen:{rate:.8,dmg:60,name:"강만재 만년필",trait:"관통"}
};
function wlv(w){return wpnLv[w]||1;}
function dmgOf(w){return Math.round(WPN[w].dmg*(1+0.25*(wlv(w)-1)));}
function rateOf(w){return WPN[w].rate*Math.pow(0.87,wlv(w)-1);}
let player=null;

let stats={guns:0,rolls:0,heals:0,crits:0};
let lastKillSrc="other",curShotSrc=null;
let comboN=0,comboT=0,caffeineT=0,skillFlash=0;
let docsRun=0,hardMode=false,cleared=false,epiT=-1,epiWave=0,trickleT=0,epiRetry=false;
const GUNSET=["pistol","shotgun","smg","stapler","revolver","card","homing","pen"];
const SKILLS=[
 {id:"caffeine",name:"카페인 오버도즈",short:"카",stat:"heals",need:5,cd:22,desc:"6초간 이속·연사 대폭 상승"},
 {id:"storm",name:"서류 폭풍",short:"서",stat:"rolls",need:25,cd:11,desc:"전방향 서류 탄환 + 순간 무적"},
 {id:"sign",name:"최종 서명",short:"사",stat:"crits",need:10,cd:15,desc:"강력한 관통 사인 빔"}
];
let skillState={};
let floats=[];
let perks=[];
let hoverPerk=-1;

// floor-clear bonus: pick 1 of 3
const PERKS=[
 {id:"vital",name:"직원 건강",short:"체력",desc:"최대 체력 +25",col:"#37d67a",apply:function(p){p.maxhp+=25;p.hp+=25;}},
 {id:"haste",name:"야근 특례",short:"속도",desc:"이동속도 +12%",col:"#4dd7fe",apply:function(){pHaste+=0.12;}},
 {id:"power",name:"인사료 협상",short:"공격",desc:"모든 무기 데미지 +12%",col:"#ff5964",apply:function(){pPower+=0.12;}},
 {id:"swift",name:"정규 속도",short:"연사",desc:"연사속도 +10%",col:"#ffd166",apply:function(){pSwift+=0.10;}},
 {id:"fortune",name:"야근수당",short:"행운",desc:"픽업 드롭률 상승",col:"#b887ff",apply:function(){pLuck+=0.15;}},
 {id:"greed",name:"정보 수집",short:"수집",desc:"탄약 +40%, 서류 조각 드롭 상승",col:"#43e8a0",apply:function(){pAmmo+=0.4;}},
 {id:"regen",name:"정신건강",short:"회복",desc:"체력 1.5초마다 1 회복",col:"#ff9ff3",apply:function(){pRegen+=1;}},
 {id:"revenge",name:"복수심",short:"처치",desc:"처치 시 8% 피해 버프",col:"#e07b39",apply:function(){pKills+=0.08;}}
];
let pHaste=0,pPower=0,pSwift=0,pLuck=0,pAmmo=0,pRegen=0,pKills=0;
let perkPick=null;
let meta={runs:0,bosses:0,bestRank:"-",startSkill:null};
let OPT={vol:0.5,shake:1,crt:1};
function setOpt(){
 if(OPT.vol>=1)muted=true;else muted=false;
 if(master)master.gain.value=OPT.vol;
 shakeM=OPT.shake;
 crtOn=!!OPT.crt;
}
let shakeM=1,crtOn=true;
let settingsPrev="title";
function loadOpts(){
 OPT.vol=parseFloat(sget("nr_vol"));if(isNaN(OPT.vol))OPT.vol=0.5;
 OPT.shake=parseFloat(sget("nr_shake"));if(isNaN(OPT.shake))OPT.shake=1;
 OPT.crt=sget("nr_crt")==="0"?0:1;
}

const INTRO=[
 ["도혁","베넷 컴퍼니 8년차. 직급 없는 전업킬러."],
 ["도혁","회사가 준 건 많았다. 이름, 목적지, 그리고 총."],
 ["도혁","아내는 연구소에서 장부를 봤다. 나는 그걸 몰랐다."],
 ["도혁","어느 날 그녀는 '퇴근'했다. 회사가 처리한 퇴근."],
 ["도혁","나는 도망쳤다. 지하 출구 앞에서... 돌아섰다."],
 ["도혁","오늘 CEO에게 두 가지를 전달한다."],
 ["도혁","사표 한 장. 그리고 영장 한 장."]
];
const EXIT0=[
 ["도혁","지하에서 옥상까지. 아홉 개의 층."],
 ["도혁","전 동료들이 날 막겠지. 좋아."],
 ["도혁","엘리베이터, 위로 올려줘."]
];
const MID_STORY=[
 ["도혁","연구소 문호에 적혀 있었다. N-13."],
 ["도혁","아내가 마지막으로 만진 프로젝트. 매출의 3할이 지워진 장부."],
 ["도혁","그걸 발견한 게 그녀였다. 그래서 '퇴근'당했다."],
 ["CEO 강만재","(무전) 도혁. 감정은 성과의 적이야. 가르쳤을 텐데."],
 ["도혁","...이제 와서 조언은 됐습니다."]
];
const BOSS_INTRO=[
 ["CEO 강만재","왔냐 도혁. 퇴근은 참으라고 했을 텐데."],
 ["도혁","N-13 장부. 당신이 지운 이유를 가져왔어요."],
 ["CEO 강만재","장부 한 권에 이 회사가 무너지냐? 그래, 그래서 네 아내를—"],
 ["도혁","사표예요. 그리고 검찰 송치장."],
 ["CEO 강만재","네 연봉은 방탄조끼로 주겠다. 들어와 봐."]
];
const WIN_LINES=[
 ["CEO 강만재","하하... 이게... 퇴사란 거구나."],
 ["도혁","수고하셨습니다, 사장님. 검문소까지 걸어가세요."],
 ["도혁","장부는 이미 검찰에 갔다. 늦었어요."],
 ["도혁","나는 이제... 진짜로 퇴근한다."]
];