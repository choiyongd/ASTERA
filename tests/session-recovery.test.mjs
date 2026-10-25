import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import Module,{createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import React,{act} from 'react';
import {create} from 'react-test-renderer';
import {usableSessionToken,sessionCookieAge} from '../lib/firebase/session-token.mjs';
const require=createRequire(import.meta.url),root=fileURLToPath(new URL('..',import.meta.url));
const token=exp=>'header.'+Buffer.from(JSON.stringify({exp})).toString('base64url')+'.test-signature';
async function load(path,mocks){
 const filename=resolve(root,path),{code}=await require('next/dist/build/swc').transform(await readFile(filename,'utf8'),{filename,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}});
 const m=new Module(filename);m.paths=Module._nodeModulePaths(dirname(filename));m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(code,filename);return m.exports;
}
test('session cookies never outlive a token reused near expiry',()=>{
 const now=1700000000000;
 assert.equal(usableSessionToken(token(now/1000-1),now),false);
 assert.equal(usableSessionToken(token(now/1000+30),now),false);
 assert.equal(usableSessionToken('malformed',now),false);
 assert.equal(sessionCookieAge(token(now/1000+120),now),90);
 assert.equal(sessionCookieAge(token(now/1000+3600),now),3500);
 assert.equal(sessionCookieAge(token(now/1000-1),now),0);
});
test('an expired server cookie does not initialize Firebase with stale credentials',async()=>{
 let appOptions;
 const module=await load('lib/firebase/server.js',{
  'server-only':{},'firebase/app':{initializeServerApp:(_config,options)=>(appOptions=options,{})},
  'firebase/auth':{getAuth:()=>({authStateReady:async()=>{},currentUser:null})},'firebase/firestore':{getFirestore:()=>({})},
  'next/headers':{cookies:async()=>({get:()=>({value:token(Math.floor(Date.now()/1000)-100)})}),headers:async()=>({})},
  './config':{firebaseConfig:{},firebaseConfigured:()=>true},'./store':{FirebaseStore:class{}},
  './session-token.mjs':require('../lib/firebase/session-token.mjs'),
 });
 const ctx=await module.firebaseSession();
 assert.equal(appOptions.authIdToken,undefined);assert.equal(ctx.sessionExpired,true);assert.equal(ctx.user,null);assert.equal(ctx.token,null);
});
test('session route bounds cookie age, detects real changes, and still delegates token verification',async()=>{
 const jar=new Map(),writes=[];let verified=0,accept=true;
 const module=await load('app/api/auth/session/route.js',{
  'next/headers':{cookies:async()=>({get:k=>jar.has(k)?{value:jar.get(k)}:undefined,set:(k,value,options)=>{writes.push(options);jar.set(k,value)}})},
  '@/lib/firebase/session-token.mjs':require('../lib/firebase/session-token.mjs'),
  '@/lib/firebase/server':{firebaseSession:async()=>{verified++;return {user:accept?{id:'owner',email:'test@example.test'}:null,db:{from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{id:'owner'}})})})})}}}},
 });
 const request=idToken=>new Request('https://astera.test/api/auth/session',{method:'POST',headers:{'Content-Type':'application/json','X-Astera-Action':'1',Origin:'https://astera.test'},body:JSON.stringify({idToken})});
 assert.equal((await module.POST(request(token(Math.floor(Date.now()/1000)-1)))).status,401);assert.equal(verified,0);
 const fresh=token(Math.floor(Date.now()/1000)+120);
 assert.equal((await (await module.POST(request(fresh))).json()).changed,true);
 assert.ok(writes[0].maxAge>85&&writes[0].maxAge<=90);assert.equal(writes[0].httpOnly,true);assert.equal(writes[0].sameSite,'lax');
 assert.equal((await (await module.POST(request(fresh))).json()).changed,false);
 accept=false;assert.equal((await module.POST(request(token(Math.floor(Date.now()/1000)+300)))).status,401);
});
test('client serializes cookie synchronization and refreshes the page only for a changed server session',async()=>{
 const original={fetch:globalThis.fetch,window:globalThis.window};let currentToken='same-token',active=0,maxActive=0,savedToken;const events=[],forces=[];
 const user={uid:'owner',email:'test@example.test',getIdToken:async force=>{forces.push(force);if(force)currentToken='new-token';return currentToken;}};
 const auth={currentUser:user,authStateReady:async()=>{}};
 globalThis.window={dispatchEvent:e=>events.push(e.type)};
 globalThis.fetch=async(_url,options)=>{active++;maxActive=Math.max(maxActive,active);await Promise.resolve();const value=JSON.parse(options.body).idToken,changed=savedToken!==value;savedToken=value;active--;return Response.json({changed});};
 try{
 const module=await load('lib/firebase/client.js',{'firebase/app':{getApps:()=>[{}],getApp:()=>({})},'firebase/auth':{getAuth:()=>auth},'firebase/storage':{getStorage:()=>({})},'./config':{firebaseConfig:{},firebaseConfigured:()=>true}});
 await Promise.all([module.restoreSession(),module.restoreSession()]);assert.equal(maxActive,1);assert.equal(events.length,1);
 await module.restoreSession(true);assert.equal(events.length,2);assert.equal(forces.at(-1),true);assert.equal(savedToken,'new-token');
 }finally{Object.assign(globalThis,original);}
});
test('session bridge renews on resume and periodically, refreshes server content once, and cleans listeners',async()=>{
 const original={window:globalThis.window,document:globalThis.document,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};
 const events=new Map(),docEvents=new Map(),intervals=new Map(),renewals=[];let refreshed=0;
 globalThis.window={addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n),setInterval:(fn,ms)=>(intervals.set(1,{fn,ms}),1),clearInterval:id=>intervals.delete(id)};
 globalThis.document={visibilityState:'visible',addEventListener:(n,f)=>docEvents.set(n,f),removeEventListener:n=>docEvents.delete(n)};globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const router={refresh:()=>refreshed++};let renderer;
 try{
 const Bridge=(await load('app/session-bridge.js',{'next/navigation':{useRouter:()=>router},'@/lib/firebase/client':{restoreSession:async force=>renewals.push(force)},'@/lib/firebase/config':{firebaseConfigured:()=>true}})).default;
 await act(async()=>{renderer=create(React.createElement(Bridge));});assert.equal(renewals.length,1);assert.equal(refreshed,0);
 await act(async()=>{events.get('focus')();docEvents.get('visibilitychange')();intervals.get(1).fn();});assert.deepEqual(renewals,[false,false,false,true]);
 events.get('astera:session-synced')();assert.equal(refreshed,1);
 await act(async()=>renderer.unmount());assert.equal(events.size,0);assert.equal(docEvents.size,0);assert.equal(intervals.size,0);
 }finally{Object.assign(globalThis,original);}
});
test('a rejected edit is retried once after renewal; authorization failures are never retried',async()=>{
 const original=globalThis.fetch;const calls=[],renewals=[];let responses=[Response.json({error:'expired'},{status:401}),Response.json({lesson:{revision:2}})];
 globalThis.fetch=async(url,options)=>{calls.push({url,...options});return responses.shift();};
 try{
 const {learningRequest}=await load('lib/learning/client.js',{'@/lib/firebase/client':{restoreSession:async force=>(renewals.push(force),{id:'owner'})}});
 const payload={revision:1,draft:{title:'보존할 제목'}};
 assert.equal((await learningRequest('/api/admin/lessons/test',payload,'PATCH')).lesson.revision,2);assert.deepEqual(renewals,[true]);assert.equal(calls[0].body,calls[1].body);
 responses=[Response.json({error:'forbidden'},{status:403})];await assert.rejects(()=>learningRequest('/test',{}),e=>e.status===403);assert.equal(renewals.length,1);
 responses=[Response.json({error:'expired'},{status:401}),Response.json({error:'expired'},{status:401})];await assert.rejects(()=>learningRequest('/test',{}),e=>e.status===401);assert.equal(renewals.length,2);assert.equal(responses.length,0);
 }finally{globalThis.fetch=original;}
});
