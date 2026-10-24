import {
  learningAction,
  readJson,
  dbCheck,
  validId,
  LearningError,
} from "@/lib/learning/server";
import { validateDraft } from "@/lib/learning/domain.mjs";
export async function PATCH(request, { params }) {
  return learningAction(request, async ({ db }) => {
    const { id } = await params;
    validId(id);
    const body = await readJson(request);
    if (!Number.isInteger(body.revision) || body.revision < 1)
      throw new LearningError("자료 버전을 확인해주세요.");
    if (body.action === "publish") {
      const row = dbCheck(
        await db.from("learning_lessons").select("draft").eq("id", id).single(),
      );
      validateDraft(row.draft, true);
      const catalog = dbCheck(
        await db.rpc("learning_publish", {
          p_id: id,
          p_revision: body.revision,
        }),
      );
      return { catalog, revision: body.revision + 1 };
    }
    if (body.action === "unpublish") {
      dbCheck(
        await db.rpc("learning_unpublish", {
          p_id: id,
          p_revision: body.revision,
        }),
      );
      return { revision: body.revision + 1 };
    }
    return {
      lesson: dbCheck(
        await db.rpc("learning_save_draft", {
          p_id: id,
          p_draft: validateDraft(body.draft),
          p_revision: body.revision,
        }),
      ),
    };
  });
}
