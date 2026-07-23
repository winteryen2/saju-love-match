"use strict";

// =============================================================================
// 기본 상수
// =============================================================================
const STEMS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const STEMS_KR=["갑","을","병","정","무","기","경","신","임","계"];
const BRANCHES=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const ELEM_NAMES=["木","火","土","金","水"];
const ELEM_KR=["목","화","토","금","수"];
const STEM_ELEM_IDX=[0,0,1,1,2,2,3,3,4,4];
const ELEM_COLOR={"木":"var(--mok)","火":"var(--hwa)","土":"var(--to)","金":"var(--geum)","水":"var(--su)"};
const GEN_ORDER=["木","火","土","金","水"];
const CTRL_ORDER=["木","土","水","火","金"];
const TERM_DAY={1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7};
const JIJANG=[9,5,0,1,4,2,3,5,6,7,4,8];
const LIUHE={0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
const SANHE=[[8,0,4],[11,3,7],[2,6,10],[5,9,1]];
const BANGHE=[[2,3,4],[5,6,7],[8,9,10],[11,0,1]];
const HAE={0:7,7:0,1:6,6:1,2:5,5:2,3:4,4:3,8:11,11:8,9:10,10:9};

// =============================================================================
// 가중치: 사용자 확정안
// =============================================================================
const CATEGORY_WEIGHT={
  tenGod:0.35,
  dayBranch:0.20,
  stemHarmony:0.15,
  elementBalance:0.15,
  bodySupport:0.10,
  hourBranch:0.05
};

const LOVE_TEN_GOD_SCORE={
  "정재":100,"정관":98,"편재":94,"편관":90,"정인":84,
  "식신":82,"비견":72,"편인":63,"상관":60,"겁재":48
};

// 사용자 성별에 따른 이성 인연 십신 가중치
// 여성: 관성(정관·편관), 남성: 재성(정재·편재)을 조금 더 반영합니다.
// 미선택 시 기존 성별 중립 점수를 그대로 사용합니다.
function genderTenGodMultiplier(userGender,god){
  if(userGender==="F"){
    if(god==="정관") return 1.25;
    if(god==="편관") return 1.10;
    if(god==="정재" || god==="편재") return 0.95;
  }
  if(userGender==="M"){
    if(god==="정재") return 1.25;
    if(god==="편재") return 1.10;
    if(god==="정관" || god==="편관") return 0.95;
  }
  return 1;
}

function adjustedTenGodScore(userGender,god){
  return Math.round(
    LOVE_TEN_GOD_SCORE[god] *
    genderTenGodMultiplier(userGender,god) *
    100
  ) / 100;
}

function genderInfluenceText(userGender,god){
  if(!userGender) return "";
  if(userGender==="F" && (god==="정관" || god==="편관")){
    return `여성의 이성 인연인 관성(${god}) 가중치가 적용됐어요.`;
  }
  if(userGender==="M" && (god==="정재" || god==="편재")){
    return `남성의 이성 인연인 재성(${god}) 가중치가 적용됐어요.`;
  }
  if(userGender==="F" && (god==="정재" || god==="편재")){
    return `여성 선택에 따라 재성(${god})은 중립보다 소폭 낮게 반영됐어요.`;
  }
  if(userGender==="M" && (god==="정관" || god==="편관")){
    return `남성 선택에 따라 관성(${god})은 중립보다 소폭 낮게 반영됐어요.`;
  }
  return "선택한 성별에 따른 직접적인 배우자성 보정은 없는 십신이에요.";
}


const BRANCH_SCORE={
  "육합":100,"삼합":91,"방합":79,"비화":74,"평":60,"해":37,"충":20
};

const BODY_SCORE={
  weak:{"인성":100,"비겁":86,"식상":55,"재성":38,"관성":25},
  strong:{"식상":100,"재성":88,"관성":82,"인성":43,"비겁":30},
  neutral:{"식상":80,"재성":80,"관성":80,"인성":75,"비겁":68}
};

const TEN_GOD_META={
  "정재":{fam:"재성",role:"안정적인 현실 연애형"},
  "정관":{fam:"관성",role:"책임감 있는 정석 연인형"},
  "편재":{fam:"재성",role:"눈길을 끄는 화려한 설렘형"},
  "편관":{fam:"관성",role:"강렬한 카리스마형"},
  "정인":{fam:"인성",role:"다정하게 돌봐주는 힐링형"},
  "식신":{fam:"식상",role:"편안하고 표현이 자연스러운 형"},
  "비견":{fam:"비겁",role:"친구 같은 연애형"},
  "편인":{fam:"인성",role:"신비롭지만 거리감 있는 형"},
  "상관":{fam:"식상",role:"자극적이고 티키타카가 강한 형"},
  "겁재":{fam:"비겁",role:"주도권 경쟁이 생기기 쉬운 형"}
};

let IDOLS=[];
let lastScored=[];

// =============================================================================
// 달력/사주 계산
// =============================================================================
function mod(n,m){return((n%m)+m)%m}
function jdn(y,m,d){
  const a=Math.floor((14-m)/12), y2=y+4800-a, m2=m+12*a-3;
  return d+Math.floor((153*m2+2)/5)+365*y2+Math.floor(y2/4)-Math.floor(y2/100)+Math.floor(y2/400)-32045;
}
function dayPillar(y,m,d){
  const j=jdn(y,m,d);
  return{stemIdx:mod(j+9,10),branchIdx:mod(j+1,12)};
}
function yearPillar(y,m,d){
  let yy=y;
  if(m<2||(m===2&&d<4))yy--;
  return{stemIdx:mod(yy-4,10),branchIdx:mod(yy-4,12)};
}
function monthPillar(y,m,d,yearStemIdx){
  const bIdx=(d>=TERM_DAY[m])?(m%12):((m%12+11)%12);
  const inStem=((yearStemIdx%5)*2+2)%10;
  return{stemIdx:mod(inStem+mod(bIdx-2,12),10),branchIdx:bIdx};
}
function hourPillar(dayStemIdx,hour){
  const branchIdx=Math.floor(mod(hour+1,24)/2);
  return{stemIdx:mod(dayStemIdx*2+branchIdx,10),branchIdx};
}
function generates(a,b){const i=GEN_ORDER.indexOf(a);return GEN_ORDER[(i+1)%5]===b}
function controls(a,b){const i=CTRL_ORDER.indexOf(a);return CTRL_ORDER[(i+1)%5]===b}
function stemYang(i){return i%2===0}

function godName(uSI,tSI){
  const ue=ELEM_NAMES[STEM_ELEM_IDX[uSI]],te=ELEM_NAMES[STEM_ELEM_IDX[tSI]];
  const same=stemYang(uSI)===stemYang(tSI);
  if(te===ue)return same?"비견":"겁재";
  if(generates(ue,te))return same?"식신":"상관";
  if(generates(te,ue))return same?"편인":"정인";
  if(controls(ue,te))return same?"편재":"정재";
  return same?"편관":"정관";
}
function ganHap(a,b){return(a+5)%10===b}

function branchRelation(a,b){
  if(a===b)return{name:"비화",reason:"감정과 생활 리듬이 비슷해 편안하지만 고집도 닮을 수 있어요."};
  if((a+6)%12===b)return{name:"충",reason:"강하게 신경 쓰이는 케미가 있지만 생활 충돌은 커질 수 있어요."};
  if(LIUHE[a]===b)return{name:"육합",reason:"서로의 빈틈을 자연스럽게 채우는 찰떡 관계예요."};
  if(SANHE.some(g=>g.includes(a)&&g.includes(b)))return{name:"삼합",reason:"같은 방향으로 에너지가 모여 함께할수록 시너지가 커져요."};
  if(HAE[a]===b)return{name:"해",reason:"큰 싸움보다 사소한 오해와 엇갈림이 반복될 수 있어요."};
  if(BANGHE.some(g=>g.includes(a)&&g.includes(b)))return{name:"방합",reason:"생활 분위기와 정서적 계절감이 비슷해 자연스럽게 어울려요."};
  return{name:"평",reason:"강한 합충은 없어 관계를 어떻게 만들어 가는지가 중요해요."};
}

function bodyStrength(pillars,dayElem){
  let support=0,total=0;
  pillars.forEach(({stem,branch,weight,isDay})=>{
    const elems=isDay
      ?[ELEM_NAMES[STEM_ELEM_IDX[JIJANG[branch]]]]
      :[ELEM_NAMES[STEM_ELEM_IDX[stem]],ELEM_NAMES[STEM_ELEM_IDX[JIJANG[branch]]]];
    elems.forEach(e=>{
      total+=weight;
      if(e===dayElem||generates(e,dayElem))support+=weight;
    });
  });
  const ratio=total?support/total:.5;
  const need=Math.max(-.4,Math.min(.4,.5-ratio));
  const state=need>.06?"weak":need<-.06?"strong":"neutral";
  return{need,state,ratio};
}

// =============================================================================
// 오행 밸런스
// =============================================================================
function elementVectorFromPillars(pillars){
  const v={"木":0,"火":0,"土":0,"金":0,"水":0};
  pillars.forEach(({stemIdx,branchIdx,weight=1})=>{
    v[ELEM_NAMES[STEM_ELEM_IDX[stemIdx]]]+=weight;
    v[ELEM_NAMES[STEM_ELEM_IDX[JIJANG[branchIdx]]]]+=weight;
  });
  return v;
}
function elementBalanceScore(userVec,targetVec){
  const elems=ELEM_NAMES;
  const userTotal=elems.reduce((s,e)=>s+userVec[e],0)||1;
  const targetTotal=elems.reduce((s,e)=>s+targetVec[e],0)||1;
  let benefit=0,overload=0;
  elems.forEach(e=>{
    const u=userVec[e]/userTotal;
    const t=targetVec[e]/targetTotal;
    const shortage=Math.max(0,.20-u);
    const excess=Math.max(0,u-.28);
    benefit+=shortage*t;
    overload+=excess*t;
  });
  const raw=60+benefit*240-overload*180;
  return Math.max(20,Math.min(100,Math.round(raw*100)/100));
}

// =============================================================================
// 데이터 및 점수
// =============================================================================
function parseDob(dob){
  const s=dob.replace(/\D/g,"");
  return{y:+s.slice(0,4),m:+s.slice(4,6),d:+s.slice(6,8)};
}
function idolPillars(idol){
  const {y,m,d}=parseDob(idol.dob);
  const yp=yearPillar(y,m,d);
  const mp=monthPillar(y,m,d,yp.stemIdx);
  const dp=dayPillar(y,m,d);
  return{yp,mp,dp};
}
function weightedTotal(parts){
  return Math.round((
    parts.tenGod*CATEGORY_WEIGHT.tenGod+
    parts.dayBranch*CATEGORY_WEIGHT.dayBranch+
    parts.stemHarmony*CATEGORY_WEIGHT.stemHarmony+
    parts.elementBalance*CATEGORY_WEIGHT.elementBalance+
    parts.bodySupport*CATEGORY_WEIGHT.bodySupport+
    parts.hourBranch*CATEGORY_WEIGHT.hourBranch
  )*100)/100;
}

function destinyBonus(parts,god,dayRel,hourRel){
  let bonus=0;
  const reasons=[];

  // 천간합 + 일지 육합이 동시에 성립하는 가장 강한 조합
  if(parts.stemHarmony===100 && dayRel==="육합"){
    bonus+=5;
    reasons.push("천간합과 일지 육합 동시 성립");
  }

  // 상대의 오행이 사용자의 부족한 오행을 매우 잘 채우는 경우
  if(parts.elementBalance>=90){
    bonus+=3;
    reasons.push("부족한 오행을 강하게 보완");
  }

  // 안정적 배우자성으로 해석한 정관·정재
  if(god==="정관" || god==="정재"){
    bonus+=3;
    reasons.push(`${god} 배우자성`);
  }

  // 사용자 시지와 상대 일지가 육합·삼합인 경우
  if(hourRel && ["육합","삼합"].includes(hourRel)){
    bonus+=2;
    reasons.push(`시지 ${hourRel}`);
  }

  return {bonus,reasons};
}

function matchTier(total){
  if(total>=106){
    return {cardClass:"soulmate",labelClass:"soulmate",label:"✦ SOULMATE"};
  }
  if(total>=100){
    return {cardClass:"destined",labelClass:"destined",label:"💜 DESTINED MATCH"};
  }
  if(total>=90){
    return {cardClass:"match-high",labelClass:"high",label:"💗 HIGH MATCH"};
  }
  return {cardClass:"",labelClass:"",label:""};
}

function chemistryType(god,fam,parts,dayRel){
  // 희귀하고 구체적인 조건을 먼저 판정합니다.
  if(parts.stemHarmony===100 && dayRel==="육합"){
    return {
      emoji:"❤️",
      name:"운명상",
      desc:"천간합과 일지 육합이 동시에 성립하는 강한 인연형이에요."
    };
  }

  if(god==="편관" && dayRel==="충"){
    return {
      emoji:"🔥",
      name:"치명상",
      desc:"강렬하게 끌리지만 긴장과 충돌도 큰 위험한 케미예요."
    };
  }

  if(god==="비견" && dayRel==="삼합"){
    return {
      emoji:"🌸",
      name:"친구에서 연인",
      desc:"닮은 결에 삼합 시너지가 더해져 자연스럽게 가까워지는 타입이에요."
    };
  }

  if(god==="식신" && parts.stemHarmony===100){
    return {
      emoji:"🦋",
      name:"첫사랑상",
      desc:"편안하고 풋풋한 식신 관계에 천간합의 특별한 끌림이 더해져요."
    };
  }

  if(fam==="인성" && parts.elementBalance>=80){
    return {
      emoji:"✨",
      name:"서로 성장형",
      desc:"정서적으로 채워 주면서 부족한 오행까지 보완하는 성장형 관계예요."
    };
  }

  if((god==="정관" || god==="정재") && parts.tenGod>=95){
    return {
      emoji:"💍",
      name:"결혼상",
      desc:"정관·정재의 안정적인 배우자성이 강하게 드러나는 장기 연애형이에요."
    };
  }

  // 위 조건에 해당하지 않을 때도 모든 카드에 케미 타입을 표시합니다.
  if(dayRel==="육합" || dayRel==="삼합"){
    return {
      emoji:"💕",
      name:"찰떡 연애상",
      desc:"지지의 합이 좋아 가까워질수록 편안한 시너지가 생기는 관계예요."
    };
  }

  if(parts.stemHarmony===100){
    return {
      emoji:"💘",
      name:"끌림형",
      desc:"천간합으로 서로를 의식하고 특별하게 느끼기 쉬운 관계예요."
    };
  }

  return {
    emoji:"🌙",
    name:"천천히 스며드는 상",
    desc:"강한 합충보다 서로 알아 가는 과정에서 케미가 만들어지는 타입이에요."
  };
}


function sparkScore(parts,god,dayRel){
  let score=
    parts.tenGod*.40+
    parts.stemHarmony*.30+
    parts.dayBranch*.20+
    parts.hourBranch*.10;
  if(["편재","편관","상관"].includes(god))score+=5;
  if(dayRel==="충")score+=8;
  return clampScore(score);
}
function stabilityScore(parts,god,dayRel){
  let score=
    parts.dayBranch*.35+
    parts.tenGod*.25+
    parts.elementBalance*.20+
    parts.bodySupport*.15+
    parts.hourBranch*.05;
  if(["정관","정재","정인"].includes(god))score+=4;
  if(dayRel==="충")score-=9;
  if(dayRel==="해")score-=5;
  return clampScore(score);
}
function tensionScore(parts,god,dayRel){
  let score=
    parts.stemHarmony*.32+
    parts.tenGod*.28+
    parts.dayBranch*.22+
    parts.hourBranch*.18;
  if(["편관","편재","상관"].includes(god))score+=7;
  if(dayRel==="충")score+=12;
  if(["정관","정인"].includes(god))score-=5;
  return clampScore(score);
}
function marriageScore(parts,god,dayRel){
  let score=
    parts.dayBranch*.30+
    parts.tenGod*.25+
    parts.elementBalance*.20+
    parts.bodySupport*.15+
    parts.hourBranch*.10;
  if(["정관","정재"].includes(god))score+=8;
  if(dayRel==="육합")score+=7;
  if(dayRel==="삼합")score+=4;
  if(dayRel==="충")score-=12;
  if(god==="편관")score-=5;
  return clampScore(score);
}
function clampScore(value){
  return Math.max(0,Math.min(100,Math.round(value*100)/100));
}
function relationshipFlow(parts,god,dayRel,spark,stability,tension,marriage){
  const first=clampScore(spark*.72+tension*.28);
  const closer=clampScore(stability*.42+parts.dayBranch*.35+parts.hourBranch*.23);
  const longTerm=clampScore(marriage*.55+stability*.45);
  const boredomRisk=clampScore(100-(stability*.50+parts.elementBalance*.25+parts.dayBranch*.25));
  const reunion=clampScore(parts.stemHarmony*.38+parts.dayBranch*.32+spark*.18+stability*.12);
  return {first,closer,longTerm,boredomRisk,reunion};
}

function scoreIdol(idol,user){
  const {yp,mp,dp}=idolPillars(idol);
  const targetStem=dp.stemIdx,targetBranch=dp.branchIdx;
  const god=godName(user.dp.stemIdx,targetStem);
  const meta=TEN_GOD_META[god];
  const dayRel=branchRelation(user.dp.branchIdx,targetBranch);
  const hourRel=user.hourBranch===null?null:branchRelation(user.hourBranch,targetBranch);

  const targetVec=elementVectorFromPillars([
    {stemIdx:yp.stemIdx,branchIdx:yp.branchIdx,weight:1},
    {stemIdx:mp.stemIdx,branchIdx:mp.branchIdx,weight:2},
    {stemIdx:dp.stemIdx,branchIdx:dp.branchIdx,weight:1}
  ]);

  const parts={
    tenGod:adjustedTenGodScore(user.userGender,god),
    dayBranch:BRANCH_SCORE[dayRel.name],
    stemHarmony:ganHap(user.dp.stemIdx,targetStem)?100:55,
    elementBalance:elementBalanceScore(user.elementVec,targetVec),
    bodySupport:BODY_SCORE[user.strength.state][meta.fam],
    hourBranch:hourRel?BRANCH_SCORE[hourRel.name]:60
  };

  const baseTotal=weightedTotal(parts);
  const destiny=destinyBonus(
    parts,
    god,
    dayRel.name,
    hourRel ? hourRel.name : null
  );
  const total=Math.round((baseTotal+destiny.bonus)*100)/100;
  const spark=sparkScore(parts,god,dayRel.name);
  const stability=stabilityScore(parts,god,dayRel.name);
  const tension=tensionScore(parts,god,dayRel.name);
  const marriage=marriageScore(parts,god,dayRel.name);
  const flow=relationshipFlow(parts,god,dayRel.name,spark,stability,tension,marriage);

  const tags=[];
  if(parts.stemHarmony===100)tags.push("일간 천간합");
  tags.push(`일지 ${dayRel.name}`);
  if(hourRel&&hourRel.name!=="평")tags.push(`시지 ${hourRel.name}`);

  const chemistry=chemistryType(
    god,
    meta.fam,
    parts,
    dayRel.name
  );
  const genderNote=genderInfluenceText(user.userGender,god);

  return{
    ...idol,
    pillar:STEMS[targetStem]+BRANCHES[targetBranch],
    elem:ELEM_NAMES[STEM_ELEM_IDX[targetStem]],
    god,role:meta.role,dayRel,hourRel,parts,
    baseTotal,
    destinyBonus:destiny.bonus,
    destinyReasons:destiny.reasons,
    chemistry,
    genderNote,
    userGender:user.userGender,
    total,spark,stability,tension,marriage,flow,tags
  };
}


function chemistryClass(name){
  return ({
    "결혼상":"type-marriage",
    "운명상":"type-destiny",
    "치명상":"type-fatal",
    "친구에서 연인":"type-friends",
    "첫사랑상":"type-firstlove",
    "서로 성장형":"type-growth",
    "찰떡 연애상":"type-perfect",
    "끌림형":"type-attraction",
    "천천히 스며드는 상":"type-slow"
  })[name]||"type-slow";
}
function analysisReasons(r){
  const reasons=[];
  if(r.parts.stemHarmony===100)reasons.push("일간끼리 천간합이 성립해 서로를 특별하게 의식하기 쉬워요.");
  if(["육합","삼합","방합"].includes(r.dayRel.name))reasons.push(`일지 ${r.dayRel.name}으로 정서적 관계의 시너지가 좋아요.`);
  if(r.dayRel.name==="충")reasons.push("일지 충으로 강한 끌림과 긴장감이 함께 나타나요.");
  if(r.parts.elementBalance>=80)reasons.push("상대가 부족한 오행을 보완해 관계의 균형을 도와줘요.");
  if(r.parts.bodySupport>=80)reasons.push("신강·신약 균형을 보완해 함께 있을 때 덜 지치기 쉬워요.");
  if(r.hourRel&&["육합","삼합","방합"].includes(r.hourRel.name))reasons.push(`시지 ${r.hourRel.name}으로 사적인 감정의 결도 잘 맞아요.`);
  if(r.userGender==="F"&&["정관","편관"].includes(r.god))reasons.push(`여성의 이성 인연인 관성(${r.god})이 반영됐어요.`);
  if(r.userGender==="M"&&["정재","편재"].includes(r.god))reasons.push(`남성의 이성 인연인 재성(${r.god})이 반영됐어요.`);
  if(!reasons.length)reasons.push("강한 합충보다 서로 알아 가는 과정에서 관계의 장점이 만들어지는 조합이에요.");
  return reasons.slice(0,5);
}
function starsFromScore(score){
  const filled=Math.max(1,Math.min(5,Math.round(score/20)));
  return "★".repeat(filled)+"☆".repeat(5-filled);
}

// =============================================================================
// UI
// =============================================================================
async function loadData(){
  try{
    const res=await fetch("./idols.json",{cache:"no-store"});
    if(!res.ok)throw new Error("idols.json을 불러오지 못했습니다.");
    const data=await res.json();
    if(!Array.isArray(data))throw new Error("idols.json 형식이 배열이 아닙니다.");
    IDOLS=data;
  }catch(err){
    document.getElementById("dataError").classList.remove("hidden");
    document.getElementById("dataError").innerHTML=
      "데이터를 불러오지 못했어요. GitHub Pages로 열었는지, <b>idols.json</b>이 index.html과 같은 위치에 있는지 확인해 주세요.<br>"+err.message;
  }
}
function validDate(y,m,d){
  const dt=new Date(y,m-1,d);
  return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d;
}
function calculate(){
  const calcBtn=document.getElementById("calcBtn");
  calcBtn.classList.add("loading");
  calcBtn.disabled=true;
  setTimeout(()=>{calcBtn.classList.remove("loading");calcBtn.disabled=false;},250);
  if(!IDOLS.length){alert("아이돌 데이터가 아직 로드되지 않았어요.");return}
  const raw=document.getElementById("bdate").value.replace(/\D/g,"");
  if(raw.length!==8){alert("생년월일을 8자리로 입력해 주세요.");return}
  const y=+raw.slice(0,4),m=+raw.slice(4,6),d=+raw.slice(6,8);
  if(!validDate(y,m,d)){alert("올바른 날짜를 입력해 주세요.");return}

  const yp=yearPillar(y,m,d);
  const mp=monthPillar(y,m,d,yp.stemIdx);
  const dp=dayPillar(y,m,d);
  const elem=ELEM_NAMES[STEM_ELEM_IDX[dp.stemIdx]];
  const time=document.getElementById("btime").value;
  let hourBranch=null,hp=null;
  if(time){
    const h=+time.split(":")[0];
    hp=hourPillar(dp.stemIdx,h);
    hourBranch=hp.branchIdx;
  }

  const pillars=[
    {stem:yp.stemIdx,branch:yp.branchIdx,weight:1},
    {stem:mp.stemIdx,branch:mp.branchIdx,weight:2},
    {stem:dp.stemIdx,branch:dp.branchIdx,weight:1,isDay:true}
  ];
  if(hp)pillars.push({stem:hp.stemIdx,branch:hp.branchIdx,weight:1});
  const strength=bodyStrength(pillars,elem);

  const elementVec=elementVectorFromPillars([
    {stemIdx:yp.stemIdx,branchIdx:yp.branchIdx,weight:1},
    {stemIdx:mp.stemIdx,branchIdx:mp.branchIdx,weight:2},
    {stemIdx:dp.stemIdx,branchIdx:dp.branchIdx,weight:1},
    ...(hp?[{stemIdx:hp.stemIdx,branchIdx:hp.branchIdx,weight:1}]:[])
  ]);

  const userGender=document.getElementById("userGender").value;
  const user={yp,mp,dp,hourBranch,strength,elementVec,userGender};
  lastScored=IDOLS.map(x=>scoreIdol(x,user)).sort((a,b)=>b.total-a.total);

  document.getElementById("badge").textContent=STEMS[dp.stemIdx];
  document.getElementById("badge").style.background=ELEM_COLOR[elem];
  const stateText=strength.state==="weak"?"신약":strength.state==="strong"?"신강":"중화";
  document.getElementById("dmTitle").textContent=
    `일간 ${STEMS[dp.stemIdx]}(${STEMS_KR[dp.stemIdx]}) · ${ELEM_KR[STEM_ELEM_IDX[dp.stemIdx]]}(${elem}) · ${stateText}`;
  const genderLabel=userGender==="F"
    ?"여성 · 관성 가중"
    :userGender==="M"
      ?"남성 · 재성 가중"
      :"성별 중립";

  document.getElementById("dmDesc").textContent=
    `년주 ${STEMS[yp.stemIdx]}${BRANCHES[yp.branchIdx]} · 월주 ${STEMS[mp.stemIdx]}${BRANCHES[mp.branchIdx]} · 일주 ${STEMS[dp.stemIdx]}${BRANCHES[dp.branchIdx]}`+
    (hp?` · 시주 ${STEMS[hp.stemIdx]}${BRANCHES[hp.branchIdx]}`:" · 출생시간 미입력")+
    ` · ${genderLabel}`;

  populateFilters();
  renderHeroSummary();
  render();
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("result").scrollIntoView({behavior:"smooth",block:"start"});
}
function populateFilters(){
  const agency=document.getElementById("agency"),group=document.getElementById("group");
  const agencies=[...new Set(lastScored.map(x=>x.agency))].sort();
  const groups=[...new Set(lastScored.map(x=>x.group))].sort();
  agency.innerHTML='<option value="">모든 소속사</option>'+agencies.map(x=>`<option>${escapeHtml(x)}</option>`).join("");
  group.innerHTML='<option value="">모든 그룹</option>'+groups.map(x=>`<option>${escapeHtml(x)}</option>`).join("");
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function filtered(){
  const q=document.getElementById("search").value.trim().toLowerCase();
  const agency=document.getElementById("agency").value;
  const group=document.getElementById("group").value;
  const gender=document.getElementById("gender").value;
  return lastScored.filter(x=>
    (!q||x.name.toLowerCase().includes(q)||x.group.toLowerCase().includes(q))&&
    (!agency||x.agency===agency)&&(!group||x.group===group)&&(!gender||x.gender===gender)
  );
}
function metric(label,value,cls=""){
  return `<div class="metric ${cls}"><small>${label}</small><b>${Number(value).toFixed(2)}</b></div>`;
}
function renderHeroSummary(){
  if(!lastScored.length)return;
  const love=lastScored[0];
  const spark=lastScored.slice().sort((a,b)=>b.spark-a.spark)[0];
  const stable=lastScored.slice().sort((a,b)=>b.stability-a.stability)[0];
  document.getElementById("heroSummary").innerHTML=`
    <div class="hero-pick"><div class="hero-label">💘 설렘 1위</div><strong>${escapeHtml(spark.name)}</strong><span>${spark.spark.toFixed(2)}</span></div>
    <div class="hero-pick"><div class="hero-label">🤝 안정 1위</div><strong>${escapeHtml(stable.name)}</strong><span>${stable.stability.toFixed(2)}</span></div>
    <div class="hero-pick"><div class="hero-label">💕 종합 1위</div><strong>${escapeHtml(love.name)}</strong><span>${love.total.toFixed(2)}</span></div>`;
}
function flowHtml(flow){
  const items=[
    ["첫인상",flow.first],
    ["친해질수록",flow.closer],
    ["장기연애",flow.longTerm],
    ["권태기 위험",flow.boredomRisk],
    ["재회 가능성",flow.reunion]
  ];
  return `<div class="flow-box">
    <div class="flow-title">💕 앞으로의 관계 흐름</div>
    <div class="flow-list">${items.map(([label,value])=>`
      <div class="flow-row">
        <span>${label}</span>
        <div class="flow-track"><div class="flow-fill" style="width:${value}%"></div></div>
        <span class="flow-stars">${starsFromScore(value)}</span>
      </div>`).join("")}</div>
  </div>`;
}
function card(r,i){
  const hourName=r.hourRel?r.hourRel.name:"미입력";
  const tier=matchTier(r.total);
  const tierLabel=tier.label?`<span class="match-label ${tier.labelClass}">${tier.label}</span>`:"";
  const typeClass=chemistryClass(r.chemistry.name);

  const breakdown=[
    ["연애 십신"+(r.userGender?" · 성별 보정":" · 중립"),r.parts.tenGod,"35%",""],
    ["일지 궁합",r.parts.dayBranch,"20%",""],
    ["천간합",r.parts.stemHarmony,"15%",""],
    ["오행 밸런스",r.parts.elementBalance,"15%",""],
    ["신강·신약 보완",r.parts.bodySupport,"10%",""],
    ["시주 궁합",r.parts.hourBranch,"5%",""],
    ["기본 종합점수",r.baseTotal,"",""],
    ["운명 보너스",r.destinyBonus,"추가점수","bonus"]
  ];

  const destinyHtml=r.destinyBonus>0?`<div class="destiny-box"><b>✦ 운명 보너스 +${r.destinyBonus}점</b><br>${r.destinyReasons.map(escapeHtml).join(" · ")}</div>`:"";
  const genderHtml=r.genderNote?`<div class="gender-boost">♀♂ ${escapeHtml(r.genderNote)}</div>`:"";
  const reasons=analysisReasons(r);

  return `<article class="card ${i<3?"top":""} ${tier.cardClass} ${typeClass}" style="animation-delay:${Math.min(i,12)*40}ms">
    <div class="rank">${i+1}</div>
    <div>
      <div class="name">${escapeHtml(r.name)}
        <span class="group">${escapeHtml(r.group)}</span>
        <span class="pill">${r.pillar} · ${r.elem}</span>${tierLabel}
      </div>
      <div class="summary">${r.god} · ${r.role} · 일지 ${r.dayRel.name} · 시지 ${hourName}</div>
      <div class="reason">${r.dayRel.reason}${r.parts.stemHarmony===100?" 일간끼리 천간합도 성립해 특별한 끌림이 더해져요.":""}</div>
      ${genderHtml}
      <div class="chemistry-box">
        <div class="chemistry-title"><span>${r.chemistry.emoji}</span><span>${escapeHtml(r.chemistry.name)}</span></div>
        <div class="chemistry-desc">${escapeHtml(r.chemistry.desc)}</div>
      </div>
      ${destinyHtml}
      <div class="metrics">
        ${metric("💘 설렘",r.spark)}
        ${metric("🤝 안정",r.stability)}
        ${metric("🔥 텐션",r.tension,"tension")}
        ${metric("💍 결혼",r.marriage,"marriage")}
        ${metric("💕 종합",r.total,"total-m")}
      </div>
      <div class="analysis-box">
        <div class="analysis-title">✨ 분석</div>
        <div class="analysis-list">${reasons.map(x=>`<div class="analysis-item">${escapeHtml(x)}</div>`).join("")}</div>
      </div>
      ${flowHtml(r.flow)}
      <details>
        <summary>점수 상세 보기</summary>
        <div class="breakdown">${breakdown.map(([n,v,w,cls])=>`<div class="break-row ${cls}"><span>${n}${w?` · ${w}`:""}</span><b>${Number(v).toFixed(2)}</b></div>`).join("")}</div>
      </details>
    </div>
    <div class="total"><strong>${r.total.toFixed(2)}</strong><span>${r.total>=106?"SOULMATE":r.total>=100?"DESTINED MATCH":"LOVE MATCH"}</span></div>
  </article>`;
}
function render(){
  const list=filtered();
  document.getElementById("resultCount").textContent=`${list.length}명`;
  document.getElementById("cards").innerHTML=list.length?list.map(card).join(""):'<div class="panel">조건에 맞는 인물이 없어요.</div>';
}
function drawShareCard(r){
  const canvas=document.createElement("canvas");
  canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext("2d");
  const bg=ctx.createLinearGradient(0,0,1080,1350);
  bg.addColorStop(0,"#241a48");bg.addColorStop(1,"#0e0a1f");
  ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle="#ff4d97";ctx.font="32px sans-serif";ctx.fillText("SAJU LOVE MATCH",80,105);
  ctx.fillStyle="#f3edff";ctx.font="bold 68px sans-serif";ctx.fillText(r.name,80,220);
  ctx.fillStyle="#ab9fce";ctx.font="30px sans-serif";ctx.fillText(r.group,80,270);
  ctx.font="58px sans-serif";ctx.fillStyle="#f3edff";ctx.fillText(`${r.chemistry.emoji} ${r.chemistry.name}`,80,390);
  ctx.font="bold 92px sans-serif";ctx.fillStyle="#ff80b6";ctx.fillText(`${r.total.toFixed(2)}`,80,530);
  ctx.font="28px sans-serif";ctx.fillStyle="#ab9fce";ctx.fillText("LOVE SCORE",80,575);
  const rows=[["💘 설렘도",r.spark],["🤝 안정감",r.stability],["🔥 텐션",r.tension],["💍 결혼 가능성",r.marriage]];
  rows.forEach(([label,value],idx)=>{
    const y=690+idx*115;
    ctx.fillStyle="#f3edff";ctx.font="34px sans-serif";ctx.fillText(label,90,y);
    ctx.textAlign="right";ctx.fillText(value.toFixed(2),990,y);ctx.textAlign="left";
    ctx.fillStyle="#ffffff18";ctx.fillRect(90,y+25,900,18);
    const grad=ctx.createLinearGradient(90,0,990,0);grad.addColorStop(0,"#ff4d97");grad.addColorStop(1,"#8b5cf6");
    ctx.fillStyle=grad;ctx.fillRect(90,y+25,900*value/100,18);
  });
  ctx.fillStyle="#6b5f96";ctx.font="24px sans-serif";ctx.fillText("오락용 사주 궁합 콘텐츠",80,1280);
  return canvas;
}
async function shareTopResult(){
  if(!lastScored.length)return;
  const canvas=drawShareCard(lastScored[0]);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
  if(!blob)return;
  const file=new File([blob],"saju-love-match.png",{type:"image/png"});
  if(navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:"Saju Love Match"});return;}catch(e){if(e.name==="AbortError")return;}
  }
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=file.name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

document.getElementById("calcBtn").addEventListener("click",calculate);
document.getElementById("shareBtn").addEventListener("click",shareTopResult);
["search","agency","group","gender"].forEach(id=>document.getElementById(id).addEventListener("input",render));
document.getElementById("bdate").addEventListener("input",e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,8));
document.getElementById("bdate").addEventListener("keydown",e=>{if(e.key==="Enter")calculate()});
loadData();
