import { defaults, modelProblem, normalizeInputs, snapshot } from "./models.mjs";
export const COURSE_STEPS=[{label:"질문",title:"먼저, 나의 생각",hint:"생각과 이유를 남겨요."},{label:"개념",title:"탐구에 필요한 개념",hint:"읽고 이해를 확인해요."},{label:"탐색",title:"예측하고 비교하는 실험",hint:"조건과 근거를 비교해요."},{label:"응용",title:"배운 것으로 새롭게 만들기",hint:"생각을 창작과 설계로."},{label:"성찰",title:"나의 생각은 어떻게 달라졌을까?",hint:"처음 생각과 비교해요."}];
export const COURSE_FIELDS=["initial","initialReason","prediction","interpretation","uncertainty","creation","creationReason","final","finalReason","nextQuestion"];
export const courseStorageKey=(id)=>`astera:lab:${id}:v1`;
const meaningful=(s)=>typeof s==="string"&&s.trim().length>=6;
export function freshCourse(topic,activity){return{version:1,labId:topic.id,step:0,inputs:defaults(activity.mode),runs:[],evidence:[],concept:"",...Object.fromEntries(COURSE_FIELDS.map(key=>[key,""])),artPalette:"warm",artFocus:"center",completed:false};}
export function recordExperiment(state,activity){const problem=modelProblem(activity.mode,state.inputs);if(problem)return{state,message:problem,error:true};if(!meaningful(state.prediction))return{state,message:"먼저 무엇이 달라질지 나의 예측을 한 문장으로 써주세요.",error:true};const result=snapshot(activity.mode,state.inputs);if(state.runs.some(run=>run.key===result.key))return{state,message:"이 조건은 이미 기록했어요. 한 가지 조건을 바꾸어 비교해보세요.",error:false};if(state.runs.length>=12)return{state,message:"비교 기록 12개를 모두 사용했어요. 기존 기록을 근거로 정리하거나 새 탐구를 시작해주세요.",error:true};return{state:{...state,runs:[...state.runs,{...result,predictionAtRun:state.prediction.trim()}],completed:false},message:`‘${result.label}’을 비교 기록에 추가했어요.`,error:false};}
export function validateCourseStep(state,activity,step=state.step){
 if(step===0){if(!meaningful(state.initial)||!meaningful(state.initialReason))return "처음 생각과 그렇게 생각한 이유를 각각 한 문장으로 써주세요.";}
 if(step===1&&state.concept!==activity.check.answer)return "개념 확인 질문을 다시 읽고, 자료에서 확인할 수 있는 답을 골라주세요.";
 if(step===2){if(!meaningful(state.prediction))return "조건을 바꾸기 전 나의 예측을 적어주세요.";if(new Set(state.runs.map(r=>r.key)).size<2)return "서로 다른 조건을 2개 이상 비교 기록으로 남겨주세요.";const dimension={sources:"source",story:"voice",art:"artwork",friend:"case",exchange:"method",news:"source",dialogue:"proposal",ethics:"response"}[activity.mode];if(dimension&&new Set(state.runs.map(r=>r.inputs[dimension])).size<2)return {sources:"작성자가 다른 기록 2개를 비교해주세요.",story:"서로 다른 화자 2명의 목소리를 비교해주세요.",art:"서로 다른 작품 2개를 비교해주세요.",friend:"서로 다른 대화 사례 2개를 비교해주세요.",exchange:"서로 다른 교환 방식 2개를 비교해주세요.",news:"제목과 원자료처럼 서로 다른 자료 2개를 비교해주세요.",dialogue:"서로 다른 규칙 제안 2개를 비교해주세요.",ethics:"서로 다른 대화 방식 2개를 비교해주세요."}[activity.mode];if(activity.mode==="news"&&!state.runs.some(r=>r.inputs.source==="data"))return "원자료도 확인해 비교 기록으로 남겨주세요.";if(!state.evidence.some(key=>state.runs.some(r=>r.key===key)))return "내 설명에 사용할 실제 비교 기록을 하나 이상 골라주세요.";if(!meaningful(state.interpretation)||!meaningful(state.uncertainty))return "기록을 비교한 설명과 아직 모르는 점을 한 문장씩 써주세요.";}
 if(step===3&&(!meaningful(state.creation)||!meaningful(state.creationReason)))return "나의 창작·설계안과 그 선택의 이유를 한 문장씩 써주세요.";
 if(step===4&&(!meaningful(state.final)||!meaningful(state.finalReason)||!meaningful(state.nextQuestion)))return "지금의 생각, 그 이유, 다음에 탐구할 질문을 남겨주세요.";
 return "";
}
export const canCompleteCourse=(state,activity)=>COURSE_STEPS.every((_,i)=>!validateCourseStep(state,activity,i));
export function restoreCourse(raw,topic,activity){
 const state=freshCourse(topic,activity);if(!raw||typeof raw!=="object"||raw.version!==1||raw.labId!==topic.id)return state;
 for(const key of COURSE_FIELDS)if(typeof raw[key]==="string")state[key]=raw[key].slice(0,2000);
 state.inputs=normalizeInputs(activity.mode,raw.inputs);
 const records=Array.isArray(raw.runs)?raw.runs.slice(0,12):[];
 for(const record of records){if(!record||typeof record!=="object"||!record.inputs||typeof record.inputs!=="object"||!Object.keys(defaults(activity.mode)).every(key=>Object.hasOwn(record.inputs,key))||modelProblem(activity.mode,record.inputs))continue;const result=snapshot(activity.mode,record.inputs);if(!state.runs.some(r=>r.key===result.key))state.runs.push({...result,predictionAtRun:typeof record.predictionAtRun==="string"?record.predictionAtRun.slice(0,2000):state.prediction});}
 const validKeys=new Set(state.runs.map(r=>r.key));state.evidence=Array.isArray(raw.evidence)?[...new Set(raw.evidence.filter(key=>typeof key==="string"&&validKeys.has(key)))]:[];
 state.concept=activity.check.options.some(o=>o.id===raw.concept)?raw.concept:"";
 if(["warm","cool","mixed"].includes(raw.artPalette))state.artPalette=raw.artPalette;
 if(["center","left","right"].includes(raw.artFocus))state.artFocus=raw.artFocus;
 const allowed=COURSE_STEPS.findIndex((_,i)=>!!validateCourseStep(state,activity,i));state.step=Math.min(Number.isInteger(raw.step)?Math.max(0,Math.min(4,raw.step)):0,allowed<0?4:allowed);
 state.completed=raw.completed===true&&canCompleteCourse(state,activity);return state;
}
export function courseRecord(state,topic,activity){return {topic:topic.code,question:topic.title,initial:state.initial,initialReason:state.initialReason,prediction:state.prediction,runs:state.runs.map(run=>({...snapshot(activity.mode,run.inputs),predictionAtRun:run.predictionAtRun})),evidence:state.runs.filter(r=>state.evidence.includes(r.key)).map(r=>r.label),interpretation:state.interpretation,uncertainty:state.uncertainty,creation:state.creation,creationReason:state.creationReason,artPalette:state.artPalette,artFocus:state.artFocus,final:state.final,finalReason:state.finalReason,nextQuestion:state.nextQuestion,complete:canCompleteCourse(state,activity)};}
