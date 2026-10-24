import {
  learningAction,
  dbCheck,
  validId,
  LearningError,
} from "@/lib/learning/server";
import { firebaseFile } from "@/lib/firebase/server";
import { isReadyFile } from "@/lib/learning/domain.mjs";
export async function POST(request, { params }) {
  return learningAction(request, async ({ db, token }) => {
    const { id } = await params;
    validId(id);
    const asset = dbCheck(
      await db.from("learning_assets").select("*").eq("id", id).single(),
    );
    if (asset.ready) return { asset };
    const file = await firebaseFile(asset.object_path, token);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length !== asset.size || !isReadyFile(asset.kind, bytes))
      throw new LearningError(
        "파일 내용이나 용량을 확인할 수 없어요. 올바른 PDF 또는 단일 HTML 파일로 다시 업로드해주세요.",
      );
    const updated = dbCheck(
      await db
        .from("learning_assets")
        .update({ ready: true })
        .eq("id", id)
        .eq("ready", false)
        .select()
        .single(),
    );
    return { asset: updated };
  });
}
