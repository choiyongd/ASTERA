import { readLabContent } from "@/lib/lab/content-server";
export const dynamic = "force-dynamic";
import ScienceLab from "./science-lab";

export const metadata = {
  title: "SCIENCE 001 · LIFE FINDER | ASTERA LAB",
  description:
    "6개 탐사 토큰으로 가상 행성의 단서를 조사하고, 생명 가능성과 증거를 구분하는 5–10분 탐구 활동.",
};

export default async function SciencePage() {
  const { content } = await readLabContent("science-001");
  return <ScienceLab content={content} />;
}
