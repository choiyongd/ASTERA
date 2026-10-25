import { learningContext } from "@/lib/learning/server";
import AdminGate from "../admin-gate";
import StationImporter from "./station-importer";
export const metadata = { title: "교양 정거장 가져오기 | ASTERA" };
export default async function ImportPage() {
  let ctx;
  try {
    ctx = await learningContext();
  } catch {
    return <AdminGate configured user unavailable />;
  }
  if (!ctx.admin) return <AdminGate {...ctx} />;
  return <StationImporter />;
}
