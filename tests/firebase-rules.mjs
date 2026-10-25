import { loadLabRoute } from "./load-lab-routes.mjs";
import { lessonDraftFromLab } from "../lib/lab/learning-draft.mjs";
import { getLabTopic } from "../lib/lab/catalog.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { ref, uploadBytes, getBytes } from "firebase/storage";
import { FirebaseStore } from "../lib/firebase/store.js";
import { newDraft, STAGES } from "../lib/learning/domain.mjs";
import { defaultLabContent } from "../lib/lab/content.mjs";
import { randomUUID } from "node:crypto";

test("Firebase rules enforce draft isolation, memberships, immutable uploads and private progress", async () => {
  const env = await initializeTestEnvironment({
    projectId: "demo-astera",
    firestore: {
      rules: await readFile(
        new URL("../firestore.rules", import.meta.url),
        "utf8",
      ),
    },
    storage: {
      rules: await readFile(
        new URL("../storage.rules", import.meta.url),
        "utf8",
      ),
    },
  });
  const adminCtx = env.authenticatedContext("admin", {
      email: "admin@example.test",
      email_verified: true,
    }),
    unverified = env.authenticatedContext("unverified", {
      email: "admin@example.test",
      email_verified: false,
    }),
    member = env.authenticatedContext("member", {
      email: "member@example.test",
      email_verified: true,
    }),
    paid = env.authenticatedContext("paid", {
      email: "paid@example.test",
      email_verified: true,
    }),
    other = env.authenticatedContext("other", {
      email: "other@example.test",
      email_verified: true,
    }),
    guest = env.unauthenticatedContext();
  const lessonId = randomUUID(),
    assetId = randomUUID(),
    path = `learning-materials/${lessonId}/${assetId}/pdf`,
    bytes = new TextEncoder().encode("%PDF-1.7 learning fixture");
  const draft = {
    ...newDraft(),
    title: "어떤 근거로 설명할까?",
    slug: "compare-evidence",
    summary: "두 가지 근거를 비교합니다.",
    goals: ["차이를 설명할 수 있어요."],
    access: "member",
    materials: [{ id: assetId, label: "비교 자료", stage: 1 }],
    stages: STAGES.map((s) => ({
      ...s,
      body: "자료를 비교하고 나의 생각을 정리해주세요.",
    })),
  };
  try {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "learning_admins", "admin"), { user_id: "admin" });
      await setDoc(doc(db, "learning_admins", "unverified"), {
        user_id: "unverified",
      });
      for (const uid of ["member", "other"])
        await setDoc(doc(db, "profiles", uid), {
          id: uid,
          is_member: false,
          membership_expires_at: null,
        });
      await setDoc(doc(db, "profiles", "paid"), {
        id: "paid",
        is_member: true,
        membership_expires_at: Date.now() + 86400000,
      });
    });

    const labId = "tech-001",
      draftRef = doc(adminCtx.firestore(), "lab_content_drafts", labId),
      pubRef = doc(adminCtx.firestore(), "lab_content_publications", labId);
    const copy = defaultLabContent(labId),
      json = JSON.stringify(copy),
      date = new Date().toISOString();
    const draftCopy = {
        id: labId,
        revision: 1,
        draft_json: json,
        updated_at: date,
      },
      publishedCopy = {
        id: labId,
        revision: 1,
        content_json: json,
        published_at: date,
      };
    await assertFails(
      setDoc(doc(member.firestore(), "lab_content_drafts", labId), draftCopy),
    );
    await assertFails(
      setDoc(
        doc(unverified.firestore(), "lab_content_drafts", labId),
        draftCopy,
      ),
    );
    await assertSucceeds(setDoc(draftRef, draftCopy));
    await assertFails(
      getDoc(doc(guest.firestore(), "lab_content_drafts", labId)),
    );
    await assertFails(
      getDocs(collection(member.firestore(), "lab_content_drafts")),
    );
    await assertFails(
      setDoc(pubRef, { ...publishedCopy, content_json: "mismatched draft" }),
    );
    await assertFails(
      setDoc(
        doc(member.firestore(), "lab_content_publications", labId),
        publishedCopy,
      ),
    );
    await assertSucceeds(setDoc(pubRef, publishedCopy));
    assert.equal(
      (
        await getDoc(doc(guest.firestore(), "lab_content_publications", labId))
      ).data().content_json,
      json,
    );
    copy.fields.initial.label = "管理자 수정 질문";
    const changedJson = JSON.stringify(copy);
    await assertSucceeds(
      setDoc(draftRef, { ...draftCopy, revision: 2, draft_json: changedJson }),
    );
    assert.equal(
      (
        await getDoc(doc(guest.firestore(), "lab_content_publications", labId))
      ).data().content_json,
      json,
    );
    await assertFails(
      updateDoc(draftRef, { revision: 2, draft_json: changedJson }),
    );
    await assertFails(
      setDoc(draftRef, { ...draftCopy, revision: 3, draft_json: 7 }),
    );
    await assertFails(
      setDoc(pubRef, {
        ...publishedCopy,
        revision: 1,
        content_json: changedJson,
      }),
    );
    await assertSucceeds(
      setDoc(pubRef, {
        ...publishedCopy,
        revision: 2,
        content_json: changedJson,
      }),
    );
    assert.equal(
      (
        await getDoc(doc(guest.firestore(), "lab_content_publications", labId))
      ).data().content_json,
      changedJson,
    );
    await assertSucceeds(
      getDocs(collection(guest.firestore(), "lab_content_publications")),
    );

    const apiStore=new FirebaseStore(adminCtx.firestore(),"admin"),api=await loadLabRoute("app/api/admin/labs/[labId]/route.js",{db:apiStore});
    const apiCopy=defaultLabContent("science-001");apiCopy.fields.initial.label="수정한 API 발문";
    const call=async(action,revision,content=apiCopy)=>{const response=await api.POST(new Request("http://localhost/api/admin/labs/science-001",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,revision,content})}),{params:Promise.resolve({labId:"science-001"})});return{status:response.status,data:await response.json()}};
    const savedCopy=await call("save",0);assert.equal(savedCopy.status,200);assert.equal(savedCopy.data.revision,1);
    assert.equal((await getDoc(doc(guest.firestore(),"lab_content_publications","science-001"))).exists(),false);
    assert.equal((await call("publish",1)).status,200);
    const publishedApi=(await getDoc(doc(guest.firestore(),"lab_content_publications","science-001"))).data();
    assert.equal(JSON.parse(publishedApi.content_json).fields.initial.label,"수정한 API 발문");
    assert.equal((await call("save",1)).status,409);
    apiCopy.fields.initial.label="공개되면 안 되는 다음 초안";assert.equal((await call("save",2)).status,200);
    assert.equal((await getDoc(doc(guest.firestore(),"lab_content_publications","science-001"))).data().content_json,publishedApi.content_json);
    const createRoute=await loadLabRoute("app/api/admin/lessons/route.js",{db:apiStore});
    const prepared=lessonDraftFromLab(getLabTopic("science-001"),apiCopy);
    const createdResponse=await createRoute.POST(new Request("http://localhost/api/admin/lessons",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({draft:prepared.draft,labId:"science-001"})}));
    assert.equal(createdResponse.status,200);const linked=await createdResponse.json();
    assert.equal(linked.lesson.draft.materials[0].id,linked.assets[0].id);
    assert.equal((await getDoc(doc(adminCtx.firestore(),"learning_assets",linked.assets[0].id))).data().external_url,"/lab/science-001");
    assert.equal((await getDoc(doc(adminCtx.firestore(),"learning_lessons",linked.lesson.id))).data().draft.title,apiCopy.question);
    const admin = adminCtx.firestore(),
      store = new FirebaseStore(admin, "admin");
    await assertSucceeds(
      setDoc(doc(admin, "learning_lessons", lessonId), {
        id: lessonId,
        draft,
        revision: 1,
        updated_at: new Date().toISOString(),
      }),
    );
    await assertFails(
      getDoc(doc(guest.firestore(), "learning_lessons", lessonId)),
    );
    await assertFails(
      getDoc(doc(unverified.firestore(), "learning_lessons", lessonId)),
    );
    await assertFails(
      updateDoc(doc(member.firestore(), "profiles", "member"), {
        is_member: true,
      }),
    );
    await assertSucceeds(
      setDoc(doc(admin, "learning_assets", assetId), {
        id: assetId,
        lesson_id: lessonId,
        kind: "pdf",
        original_name: "자료.pdf",
        object_path: path,
        size: bytes.length,
        ready: false,
      }),
    );
    await assertSucceeds(
      setDoc(doc(admin, "learning_file_access", assetId), {
        owner_uid: "admin",
        active: false,
        scope: "member",
        lesson_id: lessonId,
      }),
    );
    await assertSucceeds(
      uploadBytes(ref(adminCtx.storage(), path), bytes, {
        contentType: "application/pdf",
      }),
    );
    await assertFails(
      uploadBytes(ref(member.storage(), path + "-new"), bytes, {
        contentType: "application/pdf",
      }),
    );
    await assertSucceeds(
      updateDoc(doc(admin, "learning_assets", assetId), { ready: true }),
    );
    let published = await store.rpc("learning_publish", {
      p_id: lessonId,
      p_revision: 1,
    });
    assert.equal(published.error, null, JSON.stringify(published.error));
    const catalog = published.data;
    await assertSucceeds(
      getDoc(doc(guest.firestore(), "learning_catalog", lessonId)),
    );
    await assertFails(
      getDoc(doc(guest.firestore(), "learning_releases", catalog.release_id)),
    );
    await assertFails(
      getDoc(doc(guest.firestore(), "learning_assets", assetId)),
    );
    await assertSucceeds(
      getDoc(doc(member.firestore(), "learning_releases", catalog.release_id)),
    );
    await assertSucceeds(getBytes(ref(member.storage(), path)));
    await assertFails(getBytes(ref(guest.storage(), path)));
    await assertFails(
      uploadBytes(ref(adminCtx.storage(), path), bytes, {
        contentType: "application/pdf",
      }),
    );
    const assessment = { pre: [2, 2, 2, 2], post: [3, 4, 3, 4] };
    const answer = Object.fromEntries(
        STAGES.map((s) => [s.id, "관찰한 차이를 근거로 설명합니다."]),
      ),
      progressId = `member_${catalog.release_id}`,
      p = {
        id: progressId,
        user_id: "member",
        release_id: catalog.release_id,
        answers: answer,
        assessment,
        lesson_id: lessonId,
        universe: draft.universe,
        title: draft.title,
        version: 1,
        step: 4,
        completed: true,
        revision: 1,
        updated_at: new Date().toISOString(),
      };
    await assertFails(
      setDoc(doc(member.firestore(), "learning_progress", progressId), {
        ...p,
        answers: { ...answer, question: "" },
      }),
    );
    const memberStore = new FirebaseStore(member.firestore(), "member");
    const saved = await memberStore.rpc("learning_save_progress", {
      p_release: catalog.release_id,
      p_answers: answer,
      p_step: 4,
      p_completed: true,
      p_revision: 0,
      p_assessment: assessment,
    });
    assert.equal(saved.error, null, JSON.stringify(saved.error));
    assert.equal(saved.data.completed, true);
    const stale = await memberStore.rpc("learning_save_progress", {
      p_release: catalog.release_id,
      p_answers: answer,
      p_step: 4,
      p_completed: true,
      p_revision: 0,
      p_assessment: assessment,
    });
    assert.ok(stale.error.message.includes("REVISION_CONFLICT"));
    await assertFails(
      getDoc(doc(other.firestore(), "learning_progress", progressId)),
    );
    await assertFails(
      updateDoc(doc(member.firestore(), "learning_progress", progressId), {
        revision: 1,
      }),
    );
    await assertFails(
      setDoc(
        doc(
          member.firestore(),
          "learning_progress",
          `other_${catalog.release_id}`,
        ),
        { ...p, id: `other_${catalog.release_id}`, user_id: "other" },
      ),
    );
    let changed = await store.rpc("learning_save_draft", {
      p_id: lessonId,
      p_revision: 2,
      p_draft: {
        ...draft,
        title: "초안에서만 바꾼 제목",
        access: "subscriber",
      },
    });
    assert.equal(changed.error, null);
    assert.equal(
      (
        await getDoc(doc(guest.firestore(), "learning_catalog", lessonId))
      ).data().title,
      draft.title,
    );
    assert.ok(
      (
        await store.rpc("learning_publish", { p_id: lessonId, p_revision: 2 })
      ).error.message.includes("REVISION_CONFLICT"),
    );
    published = await store.rpc("learning_publish", {
      p_id: lessonId,
      p_revision: 3,
    });
    assert.equal(published.error, null);
    assert.equal(published.data.version, 2);
    await assertFails(
      getDoc(
        doc(member.firestore(), "learning_releases", published.data.release_id),
      ),
    );
    await assertFails(getBytes(ref(member.storage(), path)));
    await assertSucceeds(
      getDoc(
        doc(paid.firestore(), "learning_releases", published.data.release_id),
      ),
    );
    await assertSucceeds(getBytes(ref(paid.storage(), path)));
    await env.withSecurityRulesDisabled((ctx) =>
      updateDoc(doc(ctx.firestore(), "profiles", "paid"), {
        membership_expires_at: Date.now() - 1000,
      }),
    );
    await assertFails(
      getDoc(
        doc(paid.firestore(), "learning_releases", published.data.release_id),
      ),
    );
    await assertFails(getBytes(ref(paid.storage(), path)));
    const closed = await store.rpc("learning_unpublish", {
      p_id: lessonId,
      p_revision: 4,
    });
    assert.equal(closed.error, null);
    assert.equal(
      (
        await getDoc(doc(guest.firestore(), "learning_catalog", lessonId))
      ).exists(),
      false,
    );
    await assertFails(
      getDoc(doc(member.firestore(), "learning_assets", assetId)),
    );
  } finally {
    await env.cleanup();
  }
});
