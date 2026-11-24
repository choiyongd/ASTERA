import { notFound } from "next/navigation";
import Link from "next/link";
import {
  learningContext,
  dbCheck,
  releaseMaterials,
} from "@/lib/learning/server";
import { UUID } from "@/lib/learning/domain.mjs";
import { learnerContent } from "@/lib/learning/reading-deck.mjs";
import AdminGate from "../../../admin-gate";
import LearningPlayer from "../../../../learn/learning-player";
export default async function PreviewPage({ params, searchParams }) {
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
  const pilotRevision = (await searchParams)?.revision;
  if (pilotRevision !== undefined && pilotRevision !== String(lesson.revision))
    return <main className="learning-shell"><section className="learning-panel">
      <h1>검수할 초안이 바뀌었어요</h1>
      <p>학생 검수 목록에서 최신 저장본을 열어 주세요.</p>
      <Link className="learning-button" href="/admin/pilot">학생 검수로 돌아가기</Link>
    </section></main>;
  return (
    <LearningPlayer
      content={learnerContent(lesson.draft)}
      materials={await releaseMaterials(ctx.db, lesson.draft)}
      releaseId={id}
      version={0}
      initialProgress={null}
      authenticated={false}
      preview
    />
  );
}
