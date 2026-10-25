import { doc, runTransaction } from "firebase/firestore";
import { learningAction, readJson, LearningError } from "@/lib/learning/server";
import { getLabTopic } from "@/lib/lab/catalog.mjs";
import { validateLabContent } from "@/lib/lab/content.mjs";
export async function POST(request, { params }) {
  return learningAction(request, async ({ db }) => {
    const { labId } = await params;
    if (!getLabTopic(labId))
      throw new LearningError("LAB 주제를 찾을 수 없어요.", 404);
    const input = await readJson(request);
    if (
      !["save", "publish"].includes(input.action) ||
      !Number.isInteger(input.revision) ||
      input.revision < 0
    )
      throw new LearningError("저장 요청을 확인해주세요.");
    const content = validateLabContent(input.content, labId);
    return runTransaction(db.firestore, async (tx) => {
      const ref = doc(db.firestore, "lab_content_drafts", labId),
        snapshot = await tx.get(ref),
        current = snapshot.data();
      if ((current?.revision || 0) !== input.revision)
        throw new LearningError(
          "다른 화면에서 변경한 내용이 있어요. 현재 내용을 보관하고 새로고침해주세요.",
          409,
        );
      const revision = input.revision + 1,
        date = new Date().toISOString();
      tx.set(ref, {
        id: labId,
        revision,
        draft_json: JSON.stringify(content),
        updated_at: date,
      });
      if (input.action === "publish")
        tx.set(doc(db.firestore, "lab_content_publications", labId), {
          id: labId,
          revision,
          content_json: JSON.stringify(content),
          published_at: date,
        });
      return { content, revision, published: input.action === "publish" };
    });
  });
}
