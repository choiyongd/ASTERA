import { learningContext } from "@/lib/learning/server";
import { lessonDraftFromLab } from "@/lib/lab/learning-draft.mjs";
import { getLabTopic } from "@/lib/lab/catalog.mjs";
import { readLabContent } from "@/lib/lab/content-server";
import AdminGate from "../../admin-gate";
import LessonEditor from "../lesson-editor";
export default async function NewLessonPage({ searchParams }) {
  let ctx;
  try {
    ctx = await learningContext();
  } catch {
    return <AdminGate configured user unavailable />;
  }
  if (!ctx.admin) return <AdminGate {...ctx} />;
  const query = await searchParams,
    topic = getLabTopic(query?.lab);
  let initialDraft = null,
    prefillNotice = "";
  if (topic) {
    const { content } = await readLabContent(topic.id);
    const prepared = lessonDraftFromLab(topic, content);
    initialDraft = prepared.draft;
    if (prepared.shortened)
      prefillNotice =
        "긴 LAB 문구 일부를 과정 초안에 맞게 줄였어요. 발행 전에 안내와 질문을 확인해주세요.";
  }
  return (
    <LessonEditor
      initialLesson={null}
      initialAssets={[]}
      releases={[]}
      publication={null}
      initialDraft={initialDraft}
      prefillNotice={prefillNotice}
      linkedLabId={topic?.id || null}
      fileUploadsEnabled={process.env.FIREBASE_UPLOADS_ENABLED === "true"}
    />
  );
}
