import { notFound } from "next/navigation";
import { getLabTopic } from "@/lib/lab/catalog.mjs";
import { ACTIVITIES } from "@/lib/lab/activities.mjs";
import { readLabContent } from "@/lib/lab/content-server";
import { applyLabContent } from "@/lib/lab/content.mjs";
export const dynamic = "force-dynamic";
import CourseLab from "../course-lab";

export async function generateMetadata({ params }) {
  const { labId } = await params;
  const topic = getLabTopic(labId);
  return topic
    ? {
        title: `${topic.code} · ${topic.tool} | ASTERA LAB`,
        description: topic.activity,
      }
    : {};
}

export default async function TopicLabPage({ params }) {
  const { labId } = await params;
  const topic = getLabTopic(labId);
  const activity = ACTIVITIES[labId];
  if (!topic || !activity) notFound();
  const { content } = await readLabContent(labId);
  return (
    <CourseLab
      key={topic.id}
      {...applyLabContent(topic, activity, content)}
      content={content}
    />
  );
}
