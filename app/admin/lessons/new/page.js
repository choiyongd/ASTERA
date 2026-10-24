import { learningContext } from "@/lib/learning/server";
import AdminGate from "../../admin-gate";
import LessonEditor from "../lesson-editor";
export default async function NewLessonPage() {
  let ctx;
  try {
    ctx = await learningContext();
  } catch {
    return <AdminGate configured user unavailable />;
  }
  if (!ctx.admin) return <AdminGate {...ctx} />;
  return (
    <LessonEditor
      initialLesson={null}
      initialAssets={[]}
      releases={[]}
      publication={null}
    />
  );
}
