import { dbCheck, LearningError, learningAction, readJson, validId } from "@/lib/learning/server";
import { PILOT_TOPICS, validatePilotObservation } from "@/lib/learning/pilot.mjs";

export async function POST(request, { params }) {
  return learningAction(request, async ({ db }) => {
    const { id } = await params;
    if (!PILOT_TOPICS.some((topic) => topic.id === id)) throw new LearningError("학생 검수 주제를 확인해주세요.", 404);
    const input = await readJson(request);
    validId(input.observationId);
    const result = await db.rpc("learning_append_pilot", {
      p_id: id,
      observation_id: input.observationId,
      observation: validatePilotObservation(input),
    });
    if (result.error?.message === "PILOT_FULL") throw new LearningError("이 주제의 검수 기록이 가득 찼어요.", 409);
    if (result.error?.message === "INVALID_PILOT") throw new LearningError("검수에 사용한 초안 버전을 확인해주세요.", 409);
    return { observations: dbCheck(result) };
  });
}
