import {
  learningAction,
  readJson,
  dbCheck,
  validId,
  LearningError,
} from "@/lib/learning/server";
import { normalizeProgress } from "@/lib/learning/domain.mjs";
export async function POST(request) {
  return learningAction(
    request,
    async ({ db }) => {
      const body = await readJson(request);
      validId(body.releaseId);
      if (!Number.isInteger(body.revision) || body.revision < 0)
        throw new LearningError("학습 기록 버전을 확인해주세요.");
      const progress = normalizeProgress(body);
      const saved = dbCheck(
        await db.rpc("learning_save_progress", {
          p_release: body.releaseId,
          p_answers: progress.answers,
          p_step: progress.step,
          p_completed: progress.completed,
          p_assessment: progress.assessment,
          p_revision: body.revision,
        }),
      );
      return { progress: saved };
    },
    false,
  );
}
