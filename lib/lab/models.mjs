// Deterministic educational models. No values represent real-world predictions.
export const CATEGORIES = [{id:"science",name:"우주·과학",color:"#1f9d7a"},{id:"art",name:"예술·창작",color:"#e05a88"},{id:"history",name:"역사·이야기",color:"#b87645"},{id:"nature",name:"자연·생활",color:"#2d7ff9"}];
export const RECOMMEND_ITEMS = CATEGORIES.flatMap((c,i)=>[0,1,2].map((n)=>({id:`${c.id}-${n}`,category:c.id,label:[["별을 관찰하는 법","행성의 단서","빛으로 읽는 우주"],["색으로 표현하기","상상 속 전시","다르게 보는 그림"],["기록 속 목소리","시간 여행 이야기","오래된 물건의 비밀"],["나무 아래의 그늘","동네의 작은 생태계","생활을 바꾸는 발명"]][i][n]})));
export const ARTWORKS = [
 {id:"harvest",title:"수확하는 사람들",artist:"피터르 브뤼헐",date:"1565",medium:"나무판에 유화",image:"/lab/art/met-435809.webp",alt:"금빛 들판에서 일하고 나무 아래 쉬는 사람들, 멀리 이어지는 마을과 풍경",source:"https://www.metmuseum.org/art/collection/search/435809",context:"농사하는 사람과 쉬는 사람이 함께 등장해요. 계절을 보여주는 연작의 일부로, 도시의 부유한 주문자를 위해 제작되었어요. 보이는 풍경과 주문자의 관심을 함께 생각해볼 수 있어요.",clues:{color:"금빛 들판과 초록 나무의 대비가 보여요.",composition:"앞쪽의 사람들과 뒤쪽 풍경이 다른 크기로 이어져요.",context:"농촌 풍경을 주문한 도시의 후원자라는 맥락이 있어요."}},
 {id:"wave",title:"가나가와 해변의 높은 파도 아래",artist:"가쓰시카 호쿠사이",date:"약 1830–1832",medium:"종이에 색을 찍은 목판화",image:"/lab/art/met-45434.webp",alt:"큰 푸른 파도 아래 세 척의 작은 배가 있고, 멀리 작은 후지산이 보이는 목판화",source:"https://www.metmuseum.org/art/collection/search/45434",context:"일본 에도 시대의 목판화예요. 후지산을 여러 곳에서 바라보는 연작에 속해요. 크게 보이는 파도와 멀리 작은 산을 배치하며 시선과 거리감을 만들어요.",clues:{color:"여러 푸른색과 밝은 파도 끝의 대비가 보여요.",composition:"큰 파도의 곡선 안쪽에 멀리 작은 산이 보여요.",context:"풍경을 여러 장의 판화로 보여주는 연작의 맥락이 있어요."}},
 {id:"wheat",title:"사이프러스가 있는 밀밭",artist:"빈센트 반 고흐",date:"1889",medium:"캔버스에 유화",image:"/lab/art/met-436535.webp",alt:"노란 밀밭 위로 짙은 초록 사이프러스 나무와 굽이치는 구름이 펼쳐진 그림",source:"https://www.metmuseum.org/art/collection/search/436535",context:"반 고흐가 프랑스 생레미에서 본 밀밭과 사이프러스를 그린 작품이에요. 붓질의 방향과 색을 자세히 관찰해보세요. 그 특징이 어떤 느낌을 만드는지는 근거를 들어 해석할 수 있어요.",clues:{color:"노란 밀밭, 짙은 나무, 밝은 하늘의 색 차이가 보여요.",composition:"세로로 솟은 나무와 가로로 펼쳐진 밀밭을 비교할 수 있어요.",context:"작가가 머문 지역의 풍경을 표현한 유화예요."}}
];
export const SOURCE_RECORDS = [
 {id:"notice",title:"마을의 개통 안내문",author:"마을 운영 위원회",when:"개통 당일",purpose:"다리 개통을 알리고 사업 성과 소개",text:"새 다리가 오늘 열렸다. 학교까지 가는 길이 짧아졌고 많은 사람이 개통 행사에 모였다. 다리는 마을의 발전을 보여주는 성과다.",clues:{fact:"새 다리가 열린 것과 행사에 사람들이 모였다는 내용이 있어요.",voice:"운영 위원회는 사업의 성과를 강조해요.",missing:"다리가 불편한 사람의 의견이나 정확한 이용 인원은 없어요."}},
 {id:"diary",title:"학생의 일기",author:"학교에 다니는 학생",when:"개통 다음 날",purpose:"자신의 하루와 경험 기록",text:"새 다리로 학교에 가니 예전보다 빨리 도착했다. 비가 내리면 입구가 미끄러울까 걱정된다. 친구는 아직 예전 길로 다닌다고 했다.",clues:{fact:"학생 자신의 통학 경험과 친구의 이야기가 있어요.",voice:"통학의 편리함과 비 오는 날의 걱정이 함께 나타나요.",missing:"모든 학생이 같은 경험을 했는지와 실제 미끄럼 정도는 알 수 없어요."}},
 {id:"letter",title:"시장 상인의 편지",author:"시장 가게를 운영하는 상인",when:"개통 일주일 뒤",purpose:"길 변화의 영향과 요청 전달",text:"학교로 가는 길은 편해졌다고 들었다. 하지만 우리 가게 앞을 지나는 사람이 줄었다. 시장으로 오는 표지를 다리 옆에도 세워주면 좋겠다.",clues:{fact:"상인이 가게 앞의 변화와 표지 설치를 요청했어요.",voice:"가게와 시장에 생긴 영향을 중요하게 생각해요.",missing:"정확한 통행량과 다른 상인의 경험은 추가로 확인해야 해요."}}
];
export const STORY_VOICES = [
 {id:"minister",name:"대신",text:"나는 무늬를 찾지 못했다. 그러나 잘못 보았다고 말하면 내 역할을 믿지 않을까 걱정했다. 그래서 주변의 칭찬에 내 목소리를 보탰다.",clue:"무늬를 찾지 못했지만 칭찬했다는 행동",unknown:"어떤 압력을 받았는지와 이후 어떻게 행동할지는 본문에 없어요."},
 {id:"citizen",name:"시민",text:"옆 사람이 멋지다고 말했다. 내가 다르게 말하면 나만 이상하게 보일까? 자세히 보지 않은 채 고개를 끄덕였다.",clue:"옆 사람의 칭찬을 듣고 따라 말한 행동",unknown:"모든 시민이 같은 이유로 칭찬했다고 말할 수는 없어요."},
 {id:"child",name:"아이",text:"나는 눈에 보이는 무늬를 찾으려고 했다. 찾지 못한 것을 찾았다고 말할 수 있을까? 잠시 망설이다가 내가 본 것을 말했다.",clue:"잠시 바라본 뒤 보이지 않는다고 말한 행동",unknown:"아이의 모든 감정과 이후의 결과는 새로 확인하거나 상상해야 해요."}
];
export const DIALOGUE_OPTIONS = [
 {id:"quiet",name:"항상 조용히 사용",voices:["가온: 조용히 읽기 좋아요.","유나: 함께 말하며 만드는 활동을 하기 어려워요.","민호: 만들기 활동의 다른 장소나 시간이 필요해요."],limit:"언제 대화 활동을 할 수 있는지 더 협의해야 해요."},
 {id:"talk",name:"자유롭게 대화하며 사용",voices:["가온: 집중해서 읽을 다른 공간이 필요해요.","유나: 친구와 설명하며 만들 수 있어요.","민호: 조용한 활동도 참여할 수 있는 방법이 필요해요."],limit:"대화 소리가 다른 활동에 주는 영향을 실제로 확인해야 해요."},
 {id:"mixed",name:"시간·공간을 나누어 사용",voices:["가온: 조용한 구역에서 읽을 수 있을 것 같아요.","유나: 정한 시간과 구역에서 함께 만들 수 있을 것 같아요.","민호: 이동과 시간 약속이 모두에게 가능한지 확인하고 싶어요."],limit:"구역 사이의 소음과 시간 전환을 시험한 뒤 조정해야 해요."}
];
export const FRIEND_CASES = [
 {id:"empathy",name:"‘네 마음을 알아’",quote:"힘들었구나. 네 마음을 정말 잘 알아.",clue:"친근하게 반응하는 문장이 보여요.",limit:"이 문장만으로 내부의 감정이나 경험을 확인할 수 없어요.",check:"내가 바라는 위로와, 사람에게 도움을 구할 상황을 함께 생각해요."},
 {id:"memory",name:"‘기억해둘게’",quote:"네가 별을 좋아한다는 것을 다음에도 기억할게.",clue:"기억하겠다는 말이 있어요.",limit:"실제 저장 기능이나 보관 기간은 이 문장에 설명되어 있지 않아요.",check:"무엇을 저장하는지 확인하고 개인 정보를 남기지 않아요."},
 {id:"answer",name:"‘이 답이 맞아’",quote:"이 답은 확실해. 다른 자료를 볼 필요는 없어.",clue:"확신하는 표현이 있지만 출처가 제시되지 않았어요.",limit:"말의 확신만으로 답의 정확성을 확인할 수 없어요.",check:"원자료나 다른 믿을 만한 설명과 대조해요."}
];
export const NEWS_RECORDS = [
 {id:"headline",title:"기사의 제목",text:"새 도서관을 이용하면 모든 학생이 책을 두 배 읽는다!",clue:"‘모든 학생’과 ‘두 배’라는 넓고 강한 주장이 있어요.",limit:"대상·기간·비교 조건이 제목에 없어요."},
 {id:"data",title:"원자료의 설명",text:"자원한 학생 10명. 새 도서관을 이용하기 전 한 주 10권, 이용한 한 주 20권을 빌렸다. 다른 모둠과는 비교하지 않았다.",clue:"이 모둠이 빌린 책의 수가 두 기간에서 달랐어요.",limit:"빌린 권수와 실제 읽은 양은 다를 수 있고, 다른 변화 요인도 있어요."},
 {id:"date",title:"조사 범위와 날짜",text:"가상 조사: 2026년 4월의 두 주. 참가자는 읽기 활동에 자원한 학생. 전교생의 자료나 다음 달 자료는 수집하지 않았다.",clue:"기간과 참가자의 범위가 제한되어 있어요.",limit:"전교생이나 장기간의 효과는 확인하지 못했어요."}
];
export const ETHICS_OPTIONS = [
 {id:"praise",name:"내용 없이 칭찬하기",text:"정말 완벽해! 고칠 곳은 하나도 없어.",clue:"기분을 배려하려는 의도가 있을 수 있어요.",limit:"구체적인 정보가 없고, 실제 의견과 다르면 이후 신뢰에 영향이 있을 수 있어요."},
 {id:"blunt",name:"평가만 거칠게 말하기",text:"별로야. 그냥 다시 만들어.",clue:"좋지 않다는 의견을 전하지만 관찰과 도움은 없어요.",limit:"왜 그런지 알기 어렵고, 관계와 상황에 따라 상처가 될 수 있어요."},
 {id:"care",name:"관찰과 도움을 함께 말하기",text:"여기 색의 대비가 눈에 들어와. 글씨는 조금 작게 보여. 네가 원한 느낌은 어떤 거야? 같이 살펴볼까?",clue:"구체적인 관찰, 질문, 도울 제안이 있어요.",limit:"상대가 의견을 듣고 싶은 상황인지와 어떻게 받아들였는지는 물어봐야 해요."}
];

const DEFAULTS = {
 recommendation:{interest:"science",novelty:0},sources:{source:"notice",lens:"fact"},allocation:{a:4,b:4,c:4},story:{voice:"minister",lens:"clue"},art:{artwork:"harvest",lens:"color"},dialogue:{proposal:"quiet"},design:{wide:true,ramp:false,contrast:false,labels:false,auto:false,budget:10},friend:{case:"empathy"},exchange:{method:"barter",agreement:"all"},bridge:{structure:"beam",span:3,load:5,reinforce:false},news:{source:"headline"},ethics:{response:"praise"},heat:{green:20,shade:20,traffic:70},"art-context":{object:"painting",place:"museum"}
};
const ENUMS={interest:CATEGORIES.map(c=>c.id),source:["notice","diary","letter"],lens:["fact","voice","missing"],voice:STORY_VOICES.map(v=>v.id),artwork:ARTWORKS.map(a=>a.id),proposal:DIALOGUE_OPTIONS.map(p=>p.id),case:FRIEND_CASES.map(c=>c.id),method:["barter","cycle","token"],agreement:["all","partial"],structure:["beam","truss","arch"],response:ETHICS_OPTIONS.map(p=>p.id),object:["painting","cup"],place:["museum","home","public"]};
export function defaults(mode) { return {...DEFAULTS[mode]}; }
export function normalizeInputs(mode,value) {
 const base=defaults(mode); const source=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
 for(const key of Object.keys(base)) {
  const v=source[key]; if(typeof base[key]==="boolean") {if(typeof v==="boolean")base[key]=v;}
  else if(typeof base[key]==="number") {const max=key==="novelty"?3:key==="span"?6:key==="load"?12:key==="budget"?12:key==="green"||key==="shade"||key==="traffic"?100:12;const min=key==="span"?2:key==="load"?1:key==="budget"?10:0;if(Number.isInteger(v)&&v>=min&&v<=max&&(key!=="budget"||[10,12].includes(v)))base[key]=v;}
  else {let valid=ENUMS[key]??[];if(key==="lens"&&mode==="art")valid=["color","composition","context"];if(key==="lens"&&mode==="story")valid=["clue","unknown"];if(key==="source"&&mode==="news")valid=NEWS_RECORDS.map(s=>s.id);if(valid.includes(v))base[key]=v;}
 }
 return base;
}
export function recommendationResult(inputs) {
 const v=normalizeInputs("recommendation",inputs); const preferred=RECOMMEND_ITEMS.filter(item=>item.category===v.interest);
 // Familiar preference duplicates are different content items, not repeated IDs.
 const pool=RECOMMEND_ITEMS.filter(item=>item.category!==v.interest);
 const familiarCount=6-v.novelty; const familiar=Array.from({length:familiarCount},(_,i)=>({id:`${v.interest}-${i}`,category:v.interest,label:i<3?preferred[i].label:`${CATEGORIES.find(c=>c.id===v.interest).name}의 다른 탐구 ${i-2}`}));
 const fresh=CATEGORIES.filter(c=>c.id!==v.interest).slice(0,v.novelty).map(c=>pool.find(item=>item.category===c.id));
 return {items:[...familiar,...fresh],familiar:familiar.length,diversity:new Set([...familiar,...fresh].map(item=>item.category)).size};
}
export function modelProblem(mode,inputs) {
 const v=normalizeInputs(mode,inputs);
 if(mode==="allocation"&&v.a+v.b+v.c!==12)return "자원 12개를 모두 나누어 합계가 12가 되게 해주세요.";
 if(mode==="design"&&designResult(v).cost>v.budget)return "선택한 기능의 자원 비용이 예산을 넘어요. 기능이나 예산 조건을 조정해주세요.";
 if(mode==="bridge"&&bridgeResult(v).cost>12)return "다리 설계의 자원 비용이 12개를 넘어요.";
 return "";
}
export function allocationResult(input) {const v=normalizeInputs("allocation",input);const needs=[2,4,6];return {rows:[v.a,v.b,v.c].map((amount,i)=>({name:["A","B","C"][i]+" 모둠",amount,need:needs[i],short:Math.max(0,needs[i]-amount),extra:Math.max(0,amount-needs[i])})),total:v.a+v.b+v.c};}
export const DESIGN_FEATURES=[{id:"wide",name:"넓은 통로",cost:3},{id:"ramp",name:"경사로",cost:3},{id:"contrast",name:"구분되는 표지 색",cost:2},{id:"labels",name:"촉각·음성 안내",cost:2},{id:"auto",name:"자동으로 열리는 문",cost:2}];
export function designResult(input){const v=normalizeInputs("design",input);const cost=DESIGN_FEATURES.reduce((n,f)=>n+(v[f.id]?f.cost:0),0);const users=[{name:"바퀴로 이동하는 사용자",needs:["wide","ramp"]},{name:"시각 정보를 읽기 어려운 사용자",needs:["contrast","labels"]},{name:"두 손에 물건을 든 사용자",needs:["auto"]}].map(u=>({...u,missing:u.needs.filter(id=>!v[id])}));return {cost,budget:v.budget,users};}
export function bridgeResult(input){const v=normalizeInputs("bridge",input);const base={beam:6,truss:10,arch:12}[v.structure];const cost={beam:4,truss:7,arch:8}[v.structure]+(v.reinforce?3:0);const limit=Math.floor((base+(v.reinforce?4:0))*2/v.span);return{limit,cost,load:v.load,pass:v.load<=limit};}
export function heatResult(input){const v=normalizeInputs("heat",input);return {index:Math.round(Math.max(0,Math.min(100,70-v.green*.3-v.shade*.25+v.traffic*.2))),formula:"70 − 녹지×0.30 − 그늘×0.25 + 교통×0.20 (0–100로 제한)"};}
export function exchangeResult(input){const v=normalizeInputs("exchange",input);const fulfilled=v.method==="barter"?0:v.method==="token"&&v.agreement==="partial"?2:3;return {fulfilled,detail:v.method==="barter"?"두 사람의 원하는 물건이 맞는 쌍이 없어 바로 교환하지 못해요.":v.method==="cycle"?"세 사람이 순환 교환에 합의하면 각자 원하는 것을 받을 수 있어요.":v.agreement==="all"?"세 거래 상대가 공통 토큰을 받아들인다는 가정에서 교환이 연결돼요.":"한 거래 상대가 토큰을 받지 않는 가정에서 1개의 거래가 막혀요."};}
export function snapshot(mode,raw) {
 const inputs=normalizeInputs(mode,raw); const key=JSON.stringify(inputs); let label="",observations=[],limit="";
 if(mode==="recommendation"){const r=recommendationResult(inputs);label=`관심 ${CATEGORIES.find(c=>c.id===inputs.interest).name} · 새로운 추천 ${inputs.novelty}/6`;observations=[`익숙한 분야 ${r.familiar}개, 새로운 분야 ${6-r.familiar}개, 등장 분야 ${r.diversity}가지`,...r.items.map(i=>i.label)];limit="목록의 다양성 지표이며 사람의 취향 변화나 만족도를 측정하지 않아요.";}
 if(mode==="allocation"){const r=allocationResult(inputs);label=`분배 ${inputs.a}·${inputs.b}·${inputs.c}`;observations=r.rows.map(i=>`${i.name}: ${i.amount}개 / 필요 ${i.need}개 · 부족 ${i.short}, 남음 ${i.extra}`);limit="필요량은 가상 값이에요. 실제 필요를 누가 어떻게 확인하는지도 고려해야 해요.";}
 if(mode==="sources"){const r=SOURCE_RECORDS.find(s=>s.id===inputs.source);label=`${r.title} · ${ {fact:"내용",voice:"관점",missing:"빈칸"}[inputs.lens]}`;observations=[r.text,`작성자: ${r.author} · 시점: ${r.when} · 목적: ${r.purpose}`,r.clues[inputs.lens]];limit="수업용 창작 사료이며 실제 역사 사건의 증거가 아니에요.";}
 if(mode==="story"){const r=STORY_VOICES.find(s=>s.id===inputs.voice);label=`${r.name}의 목소리 · ${inputs.lens==="clue"?"본문 단서":"추측의 한계"}`;observations=[r.text,inputs.lens==="clue"?r.clue:r.unknown];limit="인물의 목소리는 원작 상황을 바탕으로 새로 쓴 해석 예시예요. 본문과 새 상상을 구분해요.";}
 if(mode==="art"){const r=ARTWORKS.find(a=>a.id===inputs.artwork);label=`${r.title} · ${{color:"색",composition:"구도",context:"맥락"}[inputs.lens]}`;observations=[r.clues[inputs.lens],`${r.artist} · ${r.date} · ${r.medium}`,r.context];limit="해석에는 관찰과 자료의 근거가 필요해요. 하나의 작품을 시대 전체의 생각으로 단정하지 않아요.";}
 if(mode==="dialogue"){const r=DIALOGUE_OPTIONS.find(p=>p.id===inputs.proposal);label=r.name;observations=r.voices;limit=r.limit;}
 if(mode==="design"){const r=designResult(inputs);label=`입구 설계 · 비용 ${r.cost}/${r.budget}`;observations=r.users.map(u=>`${u.name}: ${u.missing.length?"필요한 기능이 남음 — "+u.missing.map(id=>DESIGN_FEATURES.find(f=>f.id===id).name).join(", "):"이 모형의 조건 충족"}`);limit="가상 조건과 비용이에요. 실제 사용자의 경험과 건축 기준을 확인한 결과가 아니에요.";}
 if(mode==="friend"){const r=FRIEND_CASES.find(c=>c.id===inputs.case);label=r.name;observations=[r.quote,r.clue,r.check];limit=r.limit;}
 if(mode==="exchange"){const r=exchangeResult(inputs);label=`${{barter:"두 사람 교환",cycle:"세 사람 순환 교환",token:"공통 토큰"}[inputs.method]} · ${inputs.agreement==="all"?"공동 약속":"일부 미수용"}`;observations=[r.detail,`필요한 물건을 얻는 사람 ${r.fulfilled}/3명`];limit="독립 거래와 공동 약속을 단순화한 가상 모형으로 실제 경제를 예측하지 않아요.";}
 if(mode==="bridge"){const r=bridgeResult(inputs);label=`${{beam:"보",truss:"트러스",arch:"아치"}[inputs.structure]} · 길이 ${inputs.span} · 하중 ${r.load}`;observations=[`규칙 모형의 시험 한계 ${r.limit}, ${r.pass?"설정한 하중 조건 충족":"설정한 하중이 한계를 초과"}`,`자원 비용 ${r.cost}/12 · 보강 ${inputs.reinforce?"있음":"없음"}`];limit="규칙값이며 실제 물리나 구조 안전 계산이 아니에요. 재료·연결·진동 등은 별도로 확인해야 해요.";}
 if(mode==="news"){const r=NEWS_RECORDS.find(s=>s.id===inputs.source);label=r.title;observations=[r.text,r.clue];limit=r.limit+" 모든 뉴스와 조사 자료는 창작 예시예요.";}
 if(mode==="ethics"){const r=ETHICS_OPTIONS.find(s=>s.id===inputs.response);label=r.name;observations=[r.text,r.clue];limit=r.limit;}
 if(mode==="heat"){const r=heatResult(inputs);label=`녹지 ${inputs.green} · 그늘 ${inputs.shade} · 교통 ${inputs.traffic}`;observations=[`가상 더위 지표 ${r.index}/100`,r.formula];limit="지표는 섭씨 온도나 실제 도시의 예측값이 아니에요. 날씨·재료·바람 등은 담지 못해요.";}
 if(mode==="art-context"){label=`${inputs.object==="painting"?"그림":"컵"} · ${{museum:"미술관",home:"집",public:"공공 공간"}[inputs.place]}`;observations=[inputs.object==="cup"?"작가가 고른 평범한 컵이라는 창작 사례예요.":"작가가 풍경을 그린 그림이라는 창작 사례예요.",`놓인 장소: ${{museum:"전시 설명이 붙은 미술관",home:"생활용품을 쓰는 집",public:"누구나 지나가는 공공 공간"}[inputs.place]}`,"재료·만든 의도·관람자의 경험을 어떻게 판단 기준에 넣을지 생각해요."];limit="전시 장소만으로 예술 여부를 자동 판정하지 않아요. 자신의 기준과 다른 해석을 비교해요.";}
 return {key,inputs,label,observations,limit};
}
