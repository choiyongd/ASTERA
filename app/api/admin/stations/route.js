import { stationUuid } from "@/lib/learning/station-ids.mjs";
import { doc, runTransaction } from "firebase/firestore";
import { learningAction, readJson, LearningError } from "@/lib/learning/server";
import { STATION_FORMAT, validateStation } from "@/lib/learning/stations.mjs";
export const maxDuration = 60;
export async function POST(request) {
  return learningAction(request, async ({ db }) => {
    const input = await readJson(request);
    if (
      input.format !== STATION_FORMAT ||
      !Array.isArray(input.entries) ||
      !input.entries.length ||
      input.entries.length > 10
    )
      throw new LearningError("한 번에 정거장 10개까지 등록할 수 있어요.");
    const entries = input.entries.map(validateStation);
    if (new Set(entries.map((e) => e.stationId)).size !== entries.length)
      throw new LearningError("중복된 정거장이 있어요.");
    return runTransaction(db.firestore, async (tx) => {
      const refs = entries.map((e) => ({
        lesson: doc(db.firestore, "learning_lessons", stationUuid(e.stationId)),
        asset: doc(
          db.firestore,
          "learning_assets",
          stationUuid(e.stationId + ":source"),
        ),
      }));
      const snapshots = await Promise.all(
        refs.flatMap((r) => [tx.get(r.lesson), tx.get(r.asset)]),
      );
      const results = entries.map((e, i) => {
        const prior = snapshots[i * 2];
        if (prior.exists())
          return {
            stationId: e.stationId,
            id: prior.id,
            status:
              prior.data().source?.hash === e.hash ? "skipped" : "conflict",
          };
        if (snapshots[i * 2 + 1].exists())
          return { stationId: e.stationId, status: "conflict" };
        const date = new Date().toISOString(),
          id = refs[i].lesson.id,
          assetId = refs[i].asset.id;
        tx.set(refs[i].lesson, {
          id,
          revision: 1,
          created_at: date,
          updated_at: date,
          review_status: "pending",
          teacher_notes: e.teacherNotes,
          source: {
            batch: "gyoyang-v02",
            station_id: e.stationId,
            category: e.category,
            volume: e.volume,
            pages: e.pages,
            filename: e.filename,
            hash: e.hash,
            original_minutes: 40,
            original_student: e.originalStudent,
            license: "CC BY-NC-SA 4.0 / 개별 출처 CC BY 4.0",
            review_notice: "AI 집필 초안 · 교사·학생 검증 전",
          },
          draft: {
            ...e.draft,
            materials: [
              { id: assetId, label: "읽기 자료의 출처·권리", stage: 1 },
            ],
          },
        });
        tx.set(refs[i].asset, {
          id: assetId,
          lesson_id: id,
          kind: "reading",
          original_name: "읽기 자료의 출처·권리",
          body_text: e.sourceReading,
          ready: true,
          created_at: date,
          updated_at: date,
        });
        return { stationId: e.stationId, id, status: "created" };
      });
      return { results };
    });
  });
}
