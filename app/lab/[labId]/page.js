import { notFound } from "next/navigation";
import { ALL_LAB_TOPICS, getLabTopic } from "@/lib/lab/catalog.mjs";
import { ACTIVITIES } from "@/lib/lab/activities.mjs";
import CourseLab from "../course-lab";

export function generateStaticParams() {
  return ALL_LAB_TOPICS.filter(topic => topic.id !== "science-001").map(topic => ({ labId: topic.id }));
}

export async function generateMetadata({ params }) {
  const { labId } = await params;
  const topic = getLabTopic(labId);
  return topic ? { title: `${topic.code} · ${topic.tool} | ASTERA LAB`, description: topic.activity } : {};
}

export default async function TopicLabPage({ params }) {
  const { labId } = await params;
  const topic = getLabTopic(labId);
  const activity = ACTIVITIES[labId];
  if (!topic || !activity) notFound();
  return <CourseLab key={topic.id} topic={topic} activity={activity} />;
}
