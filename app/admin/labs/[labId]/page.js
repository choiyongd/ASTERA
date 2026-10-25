import { notFound } from "next/navigation";
import { learningContext } from "@/lib/learning/server";
import { getLabTopic } from "@/lib/lab/catalog.mjs";
import { ACTIVITIES } from "@/lib/lab/activities.mjs";
import { readLabDraft } from "@/lib/lab/content-server";
import AdminGate from "../../admin-gate";
import LabContentEditor from "../lab-content-editor";
export default async function LabEditorPage({ params }) {
  const { labId } = await params,
    topic = getLabTopic(labId);
  if (!topic) notFound();
  const ctx = await learningContext();
  if (!ctx.admin) return <AdminGate {...ctx} />;
  const initial = await readLabDraft(ctx.db, labId);
  return (
    <LabContentEditor
      topic={topic}
      initial={initial}
      correctOption={
        labId === "science-001" ? "clue" : ACTIVITIES[labId].check.answer
      }
    />
  );
}
