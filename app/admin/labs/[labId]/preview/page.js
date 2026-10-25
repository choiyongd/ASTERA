import Link from "next/link";
import { notFound } from "next/navigation";
import { learningContext } from "@/lib/learning/server";
import { getLabTopic } from "@/lib/lab/catalog.mjs";
import { ACTIVITIES } from "@/lib/lab/activities.mjs";
import { applyLabContent } from "@/lib/lab/content.mjs";
import { readLabDraft } from "@/lib/lab/content-server";
import AdminGate from "../../../admin-gate";
import CourseLab from "@/app/lab/course-lab";
import ScienceLab from "@/app/lab/science-001/science-lab";
import "@/app/lab/lab.css";
export default async function LabPreviewPage({ params }) {
  const { labId } = await params,
    topic = getLabTopic(labId);
  if (!topic) notFound();
  const ctx = await learningContext();
  if (!ctx.admin) return <AdminGate {...ctx} />;
  const { content } = await readLabDraft(ctx.db, labId),
    resolved = applyLabContent(topic, ACTIVITIES[labId], content);
  return (
    <>
      <div className="wrap learning-preview-note">
        관리자 저장본 미리보기 · 학습 기록을 저장하지 않아요.{" "}
        <Link href={"/admin/labs/" + labId}>편집으로 돌아가기 →</Link>
      </div>
      {labId === "science-001" ? (
        <ScienceLab content={content} preview />
      ) : (
        <CourseLab {...resolved} content={content} preview />
      )}
    </>
  );
}
