import { randomUUID } from "node:crypto";
import { doc, runTransaction } from "firebase/firestore";
import {
  learningAction,
  readJson,
  dbCheck,
  LearningError,
} from "@/lib/learning/server";
import { validateDraft } from "@/lib/learning/domain.mjs";
import { getLabTopic } from "@/lib/lab/catalog.mjs";
export async function POST(request) {
  return learningAction(request, async ({ db }) => {
    const input = await readJson(request),
      draft = validateDraft(input.draft);
    if (!input.labId)
      return {
        lesson: dbCheck(
          await db
            .from("learning_lessons")
            .insert({ id: randomUUID(), draft })
            .select()
            .single(),
        ),
      };
    const topic = getLabTopic(input.labId);
    if (!topic) throw new LearningError("연결할 LAB를 확인해주세요.");
    const id = randomUUID(),
      assetId = randomUUID(),
      date = new Date().toISOString();
    const asset = {
      id: assetId,
      lesson_id: id,
      kind: "lab",
      original_name: topic.tool,
      external_url: "/lab/" + topic.id,
      ready: true,
      created_at: date,
      updated_at: date,
    };
    const lesson = {
      id,
      draft: {
        ...draft,
        materials: [{ id: assetId, label: topic.tool, stage: 2 }],
      },
      revision: 1,
      created_at: date,
      updated_at: date,
    };
    await runTransaction(db.firestore, async (tx) => {
      tx.set(doc(db.firestore, "learning_lessons", id), lesson);
      tx.set(doc(db.firestore, "learning_assets", assetId), asset);
    });
    return { lesson, assets: [asset] };
  });
}
