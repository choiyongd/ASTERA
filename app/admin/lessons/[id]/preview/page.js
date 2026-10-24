import { notFound } from "next/navigation";
import {
  learningContext,
  dbCheck,
  releaseMaterials,
} from "@/lib/learning/server";
import { UUID } from "@/lib/learning/domain.mjs";
import AdminGate from "../../../admin-gate";
import LearningPlayer from "../../../../learn/learning-player";
export default async function PreviewPage({ params }) {
  let ctx;
  try {
    ctx = await learningContext();
  } catch {
    return <AdminGate configured user unavailable />;
  }
  if (!ctx.admin) return <AdminGate {...ctx} />;
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const lesson = dbCheck(
    await ctx.db
      .from("learning_lessons")
      .select("*")
      .eq("id", id)
      .maybeSingle(),
  );
  if (!lesson) notFound();
  return (
    <LearningPlayer
      content={lesson.draft}
      materials={await releaseMaterials(ctx.db, lesson.draft)}
      releaseId={id}
      version={0}
      initialProgress={null}
      authenticated={false}
      preview
    />
  );
}
