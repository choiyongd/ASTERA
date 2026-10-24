import { randomUUID } from "node:crypto";
import { learningAction, readJson, dbCheck } from "@/lib/learning/server";
import { validateDraft } from "@/lib/learning/domain.mjs";
export async function POST(request) {
  return learningAction(request, async ({ db }) => {
    const { draft } = await readJson(request);
    return {
      lesson: dbCheck(
        await db
          .from("learning_lessons")
          .insert({ id: randomUUID(), draft: validateDraft(draft) })
          .select()
          .single(),
      ),
    };
  });
}
