import { randomUUID } from "node:crypto";
import {
  learningAction,
  readJson,
  dbCheck,
  validId,
  LearningError,
} from "@/lib/learning/server";
import {
  BUCKET,
  validateUpload,
  validateWebUrl,
} from "@/lib/learning/domain.mjs";
export async function POST(request) {
  return learningAction(request, async ({ db, user }) => {
    const input = await readJson(request);
    validId(input.lessonId);
    const lesson = dbCheck(
      await db
        .from("learning_lessons")
        .select("id")
        .eq("id", input.lessonId)
        .maybeSingle(),
    );
    if (!lesson) throw new LearningError("먼저 주제를 저장해주세요.", 404);
    const id = randomUUID();
    if (input.kind === "link" || input.kind === "lab") {
      const url = validateWebUrl(input.url);
      const kind = url.startsWith("/lab/") ? "lab" : "link";
      const asset = dbCheck(
        await db
          .from("learning_assets")
          .insert({
            id,
            lesson_id: lesson.id,
            kind,
            original_name: kind === "lab" ? "ASTERA LAB" : "외부 웹앱",
            external_url: url,
            ready: true,
          })
          .select()
          .single(),
      );
      return { asset };
    }
    const upload = validateUpload(input);
    const path = `${BUCKET}/${lesson.id}/${id}/${upload.kind}`;
    dbCheck(
      await db
        .from("learning_assets")
        .insert({
          id,
          lesson_id: lesson.id,
          kind: upload.kind,
          object_path: path,
          original_name: upload.originalName,
          size: upload.size,
          ready: false,
          uploaded_by: user.id,
        }),
    );
    dbCheck(
      await db
        .from("learning_file_access")
        .insert({
          id,
          owner_uid: user.id,
          active: false,
          scope: "member",
          lesson_id: lesson.id,
        }),
    );
    return { id, path, mime: upload.mime };
  });
}
