import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Module,{createRequire} from "node:module";
import { fileURLToPath } from "node:url";
import { dirname,resolve } from "node:path";
import React,{act} from "react";
import {create} from "react-test-renderer";
import {getLabTopic} from "../lib/lab/catalog.mjs";
import {defaultLabContent} from "../lib/lab/content.mjs";
const require=createRequire(import.meta.url),root=fileURLToPath(new URL("..",import.meta.url)),filename=resolve(root,"app/admin/labs/lab-content-editor.js");
const transformed=await require("next/dist/build/swc").transform(await readFile(filename,"utf8"),{filename,jsc:{parser:{syntax:"ecmascript",jsx:true},transform:{react:{runtime:"automatic"}}},module:{type:"commonjs"}});
let send;
const module=new Module(filename);module.paths=Module._nodeModulePaths(dirname(filename));module.require=id=>{
 if(id==="next/link")return({children,...props})=>React.createElement("a",props,children);
 if(id==="next/navigation")return{useRouter:()=>({refresh(){}})};
 if(id==="@/lib/learning/client")return{learningRequest:(...args)=>send(...args)};
 if(id.startsWith("@/"))return require(resolve(root,id.slice(2)));
 return require(id);
};module._compile(transformed.code,filename);
const Editor=module.exports.default;
const text=node=>node.children.map(c=>typeof c==="string"?c:text(c)).join("");
test("LAB editor saves privately before publishing, marks correct choices and retains edits on conflict",async()=>{
 const original={window:globalThis.window,act:globalThis.IS_REACT_ACT_ENVIRONMENT};
 globalThis.window={addEventListener(){},removeEventListener(){}};globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const requests=[];let conflict=false;
 send=async(path,body)=>{requests.push({path,body});if(conflict)throw Error("다른 화면에서 변경한 내용이 있어요.");return{content:body.content,revision:body.revision+1,published:body.action==="publish"}};
 let renderer;
 await act(async()=>{renderer=create(React.createElement(Editor,{topic:getLabTopic("tech-001"),initial:{content:defaultLabContent("tech-001"),revision:0,publication:null},correctOption:"compare"}))});
 const field=label=>renderer.root.findAllByType("label").find(n=>n.children.some(c=>c===label)).findByType("textarea");
 const button=label=>renderer.root.findAllByType("button").find(n=>text(n)===label);
 const click=async label=>{const target=button(label);assert.ok(target,label);await act(async()=>target.props.onClick())};
 try {
  await act(async()=>field("LAB 핵심 질문").props.onChange({target:{value:"수정한 질문을 비교해볼까요?"}}));
  await click("초안 저장");assert.equal(requests[0].body.action,"save");assert.equal(requests[0].body.content.question,"수정한 질문을 비교해볼까요?");
  assert.equal(requests.length,1);
  await click("LAB에 발행");assert.equal(requests[1].body.action,"publish");assert.equal(requests[1].body.revision,1);
  await click("2. 개념");assert.ok(renderer.root.findAllByType("label").some(n=>text(n).includes("선택지 1 · 정답 연결")));
  await act(async()=>field("개념 1 제목").props.onChange({target:{value:"충돌해도 보관할 개념"}}));
  conflict=true;await click("초안 저장");
  assert.equal(field("개념 1 제목").props.value,"충돌해도 보관할 개념");
  assert.ok(renderer.root.findAllByProps({role:"alert"}).length);
  const count=requests.length;await click("기본 발문을 초안에 불러오기");assert.equal(requests.length,count);
 }finally{await act(async()=>renderer.unmount());globalThis.window=original.window;globalThis.IS_REACT_ACT_ENVIRONMENT=original.act}
});
